"""
Track 2 — AI Risk Manager
FastAPI router exposing all risk endpoints:
  GET  /v1/risk/fraud-spikes         — velocity anomalies with z-scores
  POST /v1/risk/chargeback-evidence  — generate evidence package
  GET  /v1/risk/return-scores        — per-merchant return risk
  GET  /v1/risk/abuse-rings          — coordinated fraud clusters
  GET  /v1/risk/metrics              — precision, recall, F1, false-positive cost
  GET  /v1/risk/reserve-portfolio    — rolling reserve health across all merchants
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.payment import PaymentIntent
from app.services.risk_engine import (
    FraudSpikeDetector,
    AbuseRingSentinel,
    ReturnRiskScorer,
    ModelEvaluator,
    IntelligentRiskEngine,
)
from app.services.chargeback_service import ChargebackEvidenceResponder
from app.services.risk_reserve_service import DynamicReserveCalculator
from app.db import get_db

risk_router = APIRouter(prefix="/v1/risk", tags=["Track 2 — AI Risk Manager"])


# ---------------------------------------------------------------------------
# GET /v1/risk/fraud-spikes
# ---------------------------------------------------------------------------
@risk_router.get("/fraud-spikes")
async def get_fraud_spikes(
    window_minutes: int = 40,
    db: AsyncSession = Depends(get_db)
):
    """
    Detects merchant transaction velocity spikes using z-score analysis.
    Returns all merchants with z-score >= 2.5 (flagged) or full list.
    """
    result = await db.execute(select(PaymentIntent))
    payments = result.scalars().all()

    if not payments:
        return {"message": "No payment data available.", "spikes_detected": 0}

    return FraudSpikeDetector.detect_velocity_spike(payments, window_minutes=window_minutes)


# ---------------------------------------------------------------------------
# POST /v1/risk/chargeback-evidence/{payment_id}
# ---------------------------------------------------------------------------
@risk_router.post("/chargeback-evidence/{payment_id}")
async def generate_chargeback_evidence(
    payment_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a bank-submission-ready evidence package for a chargeback dispute.
    Includes: transaction proof, ledger audit trail, webhook delivery log, risk snapshot.
    """
    package = await ChargebackEvidenceResponder.generate_package(payment_id, db)

    if "error" in package:
        raise HTTPException(status_code=404, detail=package["message"])

    return package


# ---------------------------------------------------------------------------
# GET /v1/risk/return-scores
# ---------------------------------------------------------------------------
@risk_router.get("/return-scores")
async def get_return_scores(
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """
    Scores the most recent payments by return/chargeback probability.
    Returns scored list sorted by risk (highest first).
    """
    result = await db.execute(select(PaymentIntent))
    payments = result.scalars().all()

    scored = [
        ReturnRiskScorer.score(p.merchant_id, p.amount, p.currency)
        for p in payments[:limit]
    ]

    return {
        "payments_scored": len(scored),
        "high_risk_count": sum(1 for s in scored if s["risk_tier"] in ("HIGH", "CRITICAL")),
        "scores": sorted(scored, key=lambda x: x["return_probability"], reverse=True)
    }


# ---------------------------------------------------------------------------
# GET /v1/risk/abuse-rings
# ---------------------------------------------------------------------------
@risk_router.get("/abuse-rings")
async def get_abuse_rings(db: AsyncSession = Depends(get_db)):
    """
    Scans payment patterns for coordinated fraud rings across merchant accounts.
    Groups merchants sharing high-risk + cross-border signals.
    """
    result = await db.execute(select(PaymentIntent))
    payments = result.scalars().all()

    return AbuseRingSentinel.scan_for_rings(payments)


# ---------------------------------------------------------------------------
# GET /v1/risk/metrics  ← THE BAR: honest precision/recall + FP cost
# ---------------------------------------------------------------------------
@risk_router.get("/metrics")
async def get_model_metrics(test_size: int = 500):
    """
    Evaluates the IntelligentRiskEngine against a synthetic labeled test set.

    THE BAR: This endpoint exists specifically because the hackathon requires
    'honest metrics including false-positive cost'. We don't hide the FP cost.

    Args:
        test_size: Number of synthetic records to evaluate (default 500)
    """
    if test_size < 50 or test_size > 5000:
        raise HTTPException(status_code=400, detail="test_size must be between 50 and 5000")

    return ModelEvaluator.evaluate(n=test_size)


# ---------------------------------------------------------------------------
# GET /v1/risk/reserve-portfolio
# ---------------------------------------------------------------------------
@risk_router.get("/reserve-portfolio")
async def get_reserve_portfolio(db: AsyncSession = Depends(get_db)):
    """
    Returns rolling reserve health across all merchants.
    Shows which merchants are in RED/ORANGE tier requiring action.
    """
    result = await db.execute(select(PaymentIntent))
    payments = result.scalars().all()

    return DynamicReserveCalculator.get_portfolio_summary(payments)


# ---------------------------------------------------------------------------
# GET /v1/risk/reserve/{merchant_id}
# ---------------------------------------------------------------------------
@risk_router.get("/reserve/{merchant_id}")
async def get_merchant_reserve(merchant_id: str, db: AsyncSession = Depends(get_db)):
    """Returns the dynamic reserve calculation for a specific merchant."""
    result = await db.execute(select(PaymentIntent))
    payments = result.scalars().all()

    return DynamicReserveCalculator.calculate(merchant_id, payments)
