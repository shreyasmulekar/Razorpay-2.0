import enum
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class AccountType(str, enum.Enum):
    NODAL_ESCROW = "NODAL_ESCROW"
    MERCHANT_SETTLEMENT = "MERCHANT_SETTLEMENT"
    MERCHANT_ROLLING_RESERVE = "MERCHANT_ROLLING_RESERVE"
    GATEWAY_FEE = "GATEWAY_FEE"
    BANK_PARTNER_CLEARING = "BANK_PARTNER_CLEARING"

class EntryType(str, enum.Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"

class LedgerAccount(Base):
    __tablename__ = "ledger_accounts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    merchant_id: Mapped[str] = mapped_column(String(64), index=True, nullable=True)
    account_type: Mapped[AccountType] = mapped_column(Enum(AccountType), index=True)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    entries: Mapped[list["LedgerEntry"]] = relationship(back_populates="account")

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    transaction_id: Mapped[str] = mapped_column(String(64), index=True)
    account_id: Mapped[str] = mapped_column(ForeignKey("ledger_accounts.id"), index=True)
    entry_type: Mapped[EntryType] = mapped_column(Enum(EntryType))
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    account: Mapped[LedgerAccount] = relationship(back_populates="entries")