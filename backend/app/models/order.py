"""
订单模型
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Text, Float, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class PaymentMethod(str, enum.Enum):
    """支付方式"""
    WECHAT = "wechat"
    ALIPAY = "alipay"
    APPLE_PAY = "apple_pay"
    CARD = "card"


class PaymentStatus(str, enum.Enum):
    """支付状态"""
    PENDING = "pending"
    PAID = "paid"
    REFUND_PENDING = "refund_pending"
    REFUNDED = "refunded"
    FAILED = "failed"


class Order(Base):
    """订单表"""
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_no: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"), index=True, unique=True)
    
    total_amount: Mapped[float] = mapped_column(Float)
    paid_amount: Mapped[float] = mapped_column(Float, default=0)
    refund_amount: Mapped[float] = mapped_column(Float, default=0)
    
    payment_method: Mapped[Optional[PaymentMethod]] = mapped_column(
        SQLEnum(PaymentMethod),
        nullable=True
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        SQLEnum(PaymentStatus),
        default=PaymentStatus.PENDING
    )
    
    transaction_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    payment_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    refund_no: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    refund_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    refund_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    invoice_requested: Mapped[bool] = mapped_column(default=False)
    invoice_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    invoice_title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    invoice_tax_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    invoice_email: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    invoice_no: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    invoice_issued_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    user: Mapped["User"] = relationship("User", back_populates="orders")
    booking: Mapped["Booking"] = relationship("Booking", back_populates="order")


# 避免循环导入
from app.models.user import User
from app.models.booking import Booking
