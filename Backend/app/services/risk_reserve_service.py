"""
Track 2 — AI Risk Manager
DynamicReserveCalculator: adjusts merchant rolling reserve rates
based on real-time chargeback ratio and risk tier.

Fixes the PDF problem: gateway refuses refunds citing 'insufficient merchant funds'.
Our rolling reserve ensures chargeback funds are ALWAYS available.
"""

from decimal import Decimal
from typing import Any


class DynamicReserveCalculator:
    """
    Dynamically calculates and adjusts the rolling reserve rate for each merchant
    based on their chargeback ratio, risk tier, and transaction history.

    Reserve tiers:
        GREEN  (chargeback < 0.5%)  → 2% reserve, 30-day rolling window
        YELLOW (chargeback 0.5–1%)  → 5% reserve, 45-day rolling window
        ORANGE (chargeback 1–2%)    → 10% reserve, 60-day rolling window
        RED    (chargeback > 2%)    → 15% reserve + manual review flag
    """

    THRESHOLDS = [
        (0.005, Decimal("0.02"), 30, "GREEN"),
        (0.010, Decimal("0.05"), 45, "YELLOW"),
        (0.020, Decimal("0.10"), 60, "ORANGE"),
        (1.000, Decimal("0.15"), 90, "RED"),
    ]

    @staticmethod
    def calculate(merchant_id: str, payments: list[Any]) -> dict:
        """
        Calculates the appropriate reserve rate for a merchant based on their payment history.

        Args:
            merchant_id: The merchant to evaluate
            payments: All PaymentIntent records for this merchant

        Returns:
            dict with reserve_rate, tier, window_days, and chargeback_ratio
        """
        from app.models.payment import PaymentState

        merchant_payments = [p for p in payments if p.merchant_id == merchant_id]
        total = len(merchant_payments)

        if total == 0:
            return {
                "merchant_id": merchant_id,
                "reserve_rate": 0.05,
                "reserve_tier": "YELLOW",
                "window_days": 45,
                "chargeback_ratio": 0.0,
                "chargeback_count": 0,
                "total_payments": 0,
                "note": "No payment history — using default onboarding reserve.",
                "action_required": False,
            }

        # Count failed/refunded as chargeback proxies
        chargebacks = sum(
            1 for p in merchant_payments
            if p.state in (PaymentState.REFUNDED, PaymentState.AUTO_REFUNDING, PaymentState.FAILED)
        )
        ratio = chargebacks / total

        # Determine tier
        reserve_rate = Decimal("0.15")
        window_days = 90
        tier = "RED"
        for threshold, rate, window, tier_name in DynamicReserveCalculator.THRESHOLDS:
            if ratio <= threshold:
                reserve_rate = rate
                window_days = window
                tier = tier_name
                break

        return {
            "merchant_id": merchant_id,
            "reserve_rate": float(reserve_rate),
            "reserve_tier": tier,
            "window_days": window_days,
            "chargeback_ratio": round(ratio, 6),
            "chargeback_ratio_pct": f"{ratio * 100:.3f}%",
            "chargeback_count": chargebacks,
            "total_payments": total,
            "action_required": tier in ("ORANGE", "RED"),
            "action": (
                "MANUAL_REVIEW_REQUIRED — chargeback ratio exceeds 2%. Account may be suspended." if tier == "RED"
                else "INCREASE_RESERVE — monitor for 30 days." if tier == "ORANGE"
                else None
            ),
            "reserve_fund_note": (
                f"{float(reserve_rate)*100:.0f}% of every settlement held in rolling reserve. "
                f"Released after {window_days} days if no disputes. "
                "Ensures chargeback refunds are ALWAYS available — consumer is never left unprotected."
            )
        }

    @staticmethod
    def get_portfolio_summary(payments: list[Any]) -> dict:
        """Calculates reserve health across all merchants in the portfolio."""
        from collections import defaultdict
        merchant_ids = list({p.merchant_id for p in payments})
        results = [DynamicReserveCalculator.calculate(mid, payments) for mid in merchant_ids]

        tier_counts = {"GREEN": 0, "YELLOW": 0, "ORANGE": 0, "RED": 0}
        for r in results:
            tier_counts[r["reserve_tier"]] = tier_counts.get(r["reserve_tier"], 0) + 1

        avg_ratio = sum(r["chargeback_ratio"] for r in results) / len(results) if results else 0

        return {
            "merchants_analyzed": len(results),
            "portfolio_avg_chargeback_ratio": round(avg_ratio, 6),
            "tier_distribution": tier_counts,
            "merchants_requiring_action": [r for r in results if r["action_required"]],
            "risk_summary": (
                "HEALTHY" if tier_counts["RED"] == 0 and tier_counts["ORANGE"] <= 1
                else "AT_RISK" if tier_counts["RED"] >= 1
                else "MODERATE"
            )
        }
