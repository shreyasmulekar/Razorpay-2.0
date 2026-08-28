import enum
from decimal import Decimal
from datetime import datetime

class RiskTier(str, enum.Enum):
    SAFE = "SAFE"
    ELEVATED = "ELEVATED"
    HIGH_RISK = "HIGH_RISK"
    SYSTEMIC_FRAUD = "SYSTEMIC_FRAUD"

class IntelligentRiskEngine:
    @staticmethod
    def evaluate_transaction(merchant_id: str, amount: Decimal, currency: str) -> tuple[RiskTier, Decimal, float]:
        """
        Evaluates risk using a weighted feature vector model to calculate an anomaly score.
        """
        # Feature 1: Ticket Size Factor 
        # (Normalizing against a hypothetical 500.00 INR baseline average)
        avg_ticket = Decimal("500.00")
        amount_ratio = float(amount / avg_ticket)
        # Squash the value so massive transactions don't blow out the model
        f1_amount_risk = min(amount_ratio * 0.1, 1.0) 

        # Feature 2: Cross-Border / Currency Risk
        # Flagging international routing due to historical friction and failure rates.
        f2_currency_risk = 0.0 if currency == "INR" else 0.85

        # Feature 3: Temporal Velocity (Time-of-Day Anomaly)
        # Higher risk assigned to deep off-hour transactions (midnight to 5 AM)
        current_hour = datetime.utcnow().hour
        f3_time_risk = 0.7 if (0 <= current_hour <= 5) else 0.1

        # Calculate Weighted Anomaly Score
        # W = [Amount(40%), Currency(40%), Time(20%)]
        w1, w2, w3 = 0.40, 0.40, 0.20
        
        anomaly_score = (f1_amount_risk * w1) + (f2_currency_risk * w2) + (f3_time_risk * w3)
        
        # Bound the score strictly between 0.0 and 1.0
        anomaly_score = min(max(anomaly_score, 0.0), 1.0)

        # Threshold Classification Matrix
        if anomaly_score <= 0.40:
            return RiskTier.SAFE, Decimal("0.02"), anomaly_score
        elif anomaly_score <= 0.70:
            return RiskTier.ELEVATED, Decimal("0.05"), anomaly_score
        elif anomaly_score <= 0.90:
            return RiskTier.HIGH_RISK, Decimal("0.15"), anomaly_score
        else:
            # The top percentile: freezes 100% of funds for human review
            return RiskTier.SYSTEMIC_FRAUD, Decimal("1.00"), anomaly_score