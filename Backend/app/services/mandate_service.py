from decimal import Decimal
from typing import Optional

class MandateExecutionService:
    @staticmethod
    def prepare_setup_intent(currency: str, customer_id: str, is_recurring: bool) -> dict:
        """
        Fixes cross-border subscription friction by properly handling off-session 3DS setups.
        """
        intent_payload = {
            "customer_id": customer_id,
            "currency": currency,
            "usage": "off_session" if is_recurring else "on_session",
            "authentication_flow": "3DS2_CHALLENGE_PREFERRED" if currency != "INR" else "RBI_E_MANDATE_FLOW"
        }
        return intent_payload

    @staticmethod
    async def validate_nach_debit_eligibility(
        mandate_id: str,
        amount: Decimal,
        is_user_cancelled: bool,
        is_prepaid: bool
    ) -> tuple[bool, Optional[str]]:
        """
        Pre-flight check preventing NACH bounce fees and unauthorized auto-debits.
        """
        if is_user_cancelled:
            return False, "DEBIT_REJECTED: Mandate is explicitly canceled by customer."
        
        if is_prepaid:
            return False, "DEBIT_REJECTED: Outstanding balance already settled via prepayment."

        return True, None