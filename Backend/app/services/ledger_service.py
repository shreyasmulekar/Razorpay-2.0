import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.ledger import LedgerAccount, LedgerEntry, AccountType, EntryType
from app.models.payment import PaymentIntent, PaymentState

class LedgerService:
    @staticmethod
    async def record_payment_settlement(
        session: AsyncSession,
        payment: PaymentIntent,
        reserve_rate: Decimal = Decimal("0.05"), # 5% dynamic holdback
        fee_rate: Decimal = Decimal("0.02")       # 2% gateway fee
    ):
        """
        Atomically splits incoming funds into Nodal, Settlement, Reserve, and Fee accounts.
        Total Debits MUST equal Total Credits.
        """
        gross_amount = payment.amount
        fee_amount = gross_amount * fee_rate
        reserve_amount = gross_amount * reserve_rate
        net_merchant_amount = gross_amount - fee_amount - reserve_amount

        # Accounts setup
        entries = [
            # 1. Debit Bank Clearing (Cash in Transit)
            LedgerEntry(
                id=f"entry_{uuid.uuid4().hex[:16]}",
                transaction_id=payment.id,
                account_id=f"acc_bank_{payment.currency}",
                entry_type=EntryType.DEBIT,
                amount=gross_amount,
                currency=payment.currency
            ),
            # 2. Credit Merchant Settlement Account
            LedgerEntry(
                id=f"entry_{uuid.uuid4().hex[:16]}",
                transaction_id=payment.id,
                account_id=f"acc_merchant_settle_{payment.merchant_id}",
                entry_type=EntryType.CREDIT,
                amount=net_merchant_amount,
                currency=payment.currency
            ),
            # 3. Credit Dynamic Rolling Reserve
            LedgerEntry(
                id=f"entry_{uuid.uuid4().hex[:16]}",
                transaction_id=payment.id,
                account_id=f"acc_merchant_reserve_{payment.merchant_id}",
                entry_type=EntryType.CREDIT,
                amount=reserve_amount,
                currency=payment.currency
            ),
            # 4. Credit Gateway Fee Revenue
            LedgerEntry(
                id=f"entry_{uuid.uuid4().hex[:16]}",
                transaction_id=payment.id,
                account_id="acc_gateway_fees",
                entry_type=EntryType.CREDIT,
                amount=fee_amount,
                currency=payment.currency
            )
        ]

        total_debit = sum(e.amount for e in entries if e.entry_type == EntryType.DEBIT)
        total_credit = sum(e.amount for e in entries if e.entry_type == EntryType.CREDIT)

        if total_debit != total_credit:
            raise ValueError(f"Ledger Imbalance Detected! Debit: {total_debit}, Credit: {total_credit}")

        for entry in entries:
            session.add(entry)
        
        payment.state = PaymentState.SETTLED
        await session.commit()

    @staticmethod
    async def trigger_instant_reversal(session: AsyncSession, payment: PaymentIntent, reason: str):
        """
        Executes an immediate rollback when upstream bank endpoints drop or time out (solving government portal limbo).
        """
        payment.state = PaymentState.AUTO_REFUNDING
        
        # Reverse debit entries immediately
        reversal_entry_credit = LedgerEntry(
            id=f"rev_{uuid.uuid4().hex[:16]}",
            transaction_id=payment.id,
            account_id=f"acc_bank_{payment.currency}",
            entry_type=EntryType.CREDIT,
            amount=payment.amount,
            currency=payment.currency
        )
        reversal_entry_debit = LedgerEntry(
            id=f"rev_{uuid.uuid4().hex[:16]}",
            transaction_id=payment.id,
            account_id=f"acc_refund_suspense_{payment.merchant_id}",
            entry_type=EntryType.DEBIT,
            amount=payment.amount,
            currency=payment.currency
        )

        session.add(reversal_entry_credit)
        session.add(reversal_entry_debit)
        payment.state = PaymentState.REFUNDED
        payment.metadata_payload["auto_reversal_reason"] = reason
        await session.commit()