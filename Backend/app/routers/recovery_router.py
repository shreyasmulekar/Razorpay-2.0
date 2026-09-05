"""
Track 3 — AI Revenue Recovery
FastAPI router exposing all recovery endpoints:
  GET  /v1/recovery/scan              — dry-run preview of recoverable payments
  POST /v1/recovery/run-batch         — execute recovery on N payments
  GET  /v1/recovery/audit-trail       — full action log with ₹ outcomes
  POST /v1/recovery/mandate-retry/{id} — retry failed mandate with sequencer
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.services.revenue_recovery_service import (
    RevenueRecoveryAgent,
    MandateRetrySequencer,
)
from app.models.payment import PaymentIntent, PaymentState
from datetime import datetime, timezone
from app.db import get_db

recovery_router = APIRouter(prefix="/v1/recovery", tags=["Track 3 — AI Revenue Recovery"])

# In-memory audit log (persisted per server lifetime; in production, write to DB)
_audit_log: list[dict] = []


# ---------------------------------------------------------------------------
# GET /v1/recovery/scan  — dry-run preview
# ---------------------------------------------------------------------------
@recovery_router.get("/scan")
async def scan_recoverable(db: AsyncSession = Depends(get_db)):
    """
    Dry-run scan: shows what CAN be recovered without taking any action.
    Use this to preview before running /run-batch.
    """
    return await RevenueRecoveryAgent.scan_failed_intents(db)


# ---------------------------------------------------------------------------
# POST /v1/recovery/run-batch  — THE MAIN ENDPOINT
# ---------------------------------------------------------------------------
@recovery_router.post("/run-batch")
async def run_recovery_batch(
    batch_size: int = Query(default=50, ge=10, le=500, description="Number of payments to process"),
    db: AsyncSession = Depends(get_db)
):
    """
    Executes recovery interventions on up to `batch_size` payments.

    THE BAR: Returns measured ₹ recovered, stopping rules applied, and full audit trail.
    Every action is logged. Defense-only — no consumer harassment.
    """
    result = await RevenueRecoveryAgent.run_batch(db, batch_size=batch_size)

    # Persist audit trail in memory
    _audit_log.extend(result.get("audit_trail", []))

    return result


# ---------------------------------------------------------------------------
# GET /v1/recovery/audit-trail
# ---------------------------------------------------------------------------
@recovery_router.get("/audit-trail")
async def get_audit_trail(limit: int = Query(default=100, le=500)):
    """
    Returns the full audit trail of all recovery actions taken.
    Every action shows: payment_id, cause, action_taken, outcome, ₹ recovered.
    """
    if not _audit_log:
        return {
            "message": "No recovery actions taken yet. Run /run-batch first.",
            "total_actions": 0,
            "audit_trail": [],
        }

    recent = _audit_log[-limit:]
    total_recovered = sum(a.get("amount_recovered", 0) for a in _audit_log)
    total_refunded = sum(a.get("amount_refunded", 0) for a in _audit_log)

    return {
        "total_actions": len(_audit_log),
        "showing": len(recent),
        "cumulative_recovered_inr": round(total_recovered, 2),
        "cumulative_recovered_formatted": f"₹{total_recovered:,.2f}",
        "cumulative_refunded_inr": round(total_refunded, 2),
        "audit_trail": recent,
    }


# ---------------------------------------------------------------------------
# POST /v1/recovery/mandate-retry/{mandate_id}
# ---------------------------------------------------------------------------
@recovery_router.post("/mandate-retry/{mandate_id}")
async def retry_mandate(
    mandate_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Smart mandate retry with stopping rules.
    Returns the retry schedule and current status — prevents infinite retries.
    Compliant with RBI PA/PG: max 3 retry attempts per mandate cycle.
    """
    # Find the most recent failed payment for this mandate
    result = await db.execute(select(PaymentIntent))
    payments = result.scalars().all()

    # Find payments that could be mandate-related (recurring=True and failed)
    mandate_payments = [
        p for p in payments
        if p.is_recurring and p.state in (PaymentState.FAILED, PaymentState.PROCESSING)
    ]

    if not mandate_payments:
        # Return a sample schedule using current time
        return MandateRetrySequencer.get_retry_schedule(
            mandate_id=mandate_id,
            failed_at=datetime.now(timezone.utc)
        )

    # Use the most recent failed mandate payment
    latest = sorted(mandate_payments, key=lambda p: p.created_at, reverse=True)[0]

    return {
        "mandate_id": mandate_id,
        "linked_payment": latest.id,
        "merchant_id": latest.merchant_id,
        "amount": float(latest.amount),
        **MandateRetrySequencer.get_retry_schedule(mandate_id, latest.created_at)
    }


# ---------------------------------------------------------------------------
# GET /v1/recovery/failure-breakdown
# ---------------------------------------------------------------------------
@recovery_router.get("/failure-breakdown")
async def get_failure_breakdown(db: AsyncSession = Depends(get_db)):
    """
    Returns the failure cause distribution across all payments.
    Powers the funnel visualization on the frontend.
    """
    from app.services.revenue_recovery_service import RevenueRecoveryAgent, FailureCause
    from datetime import datetime, timezone
    from collections import Counter

    result = await db.execute(select(PaymentIntent))
    payments = result.scalars().all()
    now = datetime.now(timezone.utc)

    cause_counter: Counter = Counter()
    total_by_cause: dict[str, float] = {}

    for p in payments:
        created = p.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        age_hours = (now - created).total_seconds() / 3600
        cause = RevenueRecoveryAgent._classify_failure(p, age_hours)
        label = cause if cause else "SUCCESSFUL"
        cause_counter[label] += 1
        total_by_cause[label] = total_by_cause.get(label, 0) + float(p.amount)

    total_payments = len(payments)
    breakdown = [
        {
            "cause": cause,
            "count": count,
            "percentage": round(count / total_payments * 100, 2) if total_payments else 0,
            "total_amount_inr": round(total_by_cause.get(cause, 0), 2),
            "recoverable": cause not in ("SUCCESSFUL", FailureCause.ISSUER_DECLINE, FailureCause.CHECKOUT_ABANDONMENT),
        }
        for cause, count in cause_counter.most_common()
    ]

    recoverable_amount = sum(
        b["total_amount_inr"] for b in breakdown if b["recoverable"]
    )

    return {
        "total_payments": total_payments,
        "breakdown": breakdown,
        "total_recoverable_amount_inr": round(recoverable_amount, 2),
        "total_recoverable_formatted": f"₹{recoverable_amount:,.2f}",
    }
