import enum
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, DateTime, Enum, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.models.ledger import Base

class PaymentState(str, enum.Enum):
    CREATED = "CREATED"
    AUTHENTICATION_PENDING = "AUTHENTICATION_PENDING"
    PROCESSING = "PROCESSING"
    SETTLED = "SETTLED"
    AUTO_REFUNDING = "AUTO_REFUNDING"
    REFUNDED = "REFUNDED"
    FAILED = "FAILED"

class PaymentIntent(Base):
    __tablename__ = "payment_intents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    idempotency_key: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    merchant_id: Mapped[str] = mapped_column(String(64), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    state: Mapped[PaymentState] = mapped_column(Enum(PaymentState), default=PaymentState.CREATED, index=True)
    
    # Cross-Border & Recurring setup parameters
    is_recurring: Mapped[bool] = mapped_column(default=False)
    setup_future_usage: Mapped[str] = mapped_column(String(32), nullable=True) # "off_session" | "on_session"
    
    # Metadata and tracking
    metadata_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    timeout_threshold_seconds: Mapped[int] = mapped_column(Integer, default=180) # Real-time auto reversal threshold
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)