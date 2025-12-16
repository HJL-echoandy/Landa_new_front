"""
预约模型
"""
from datetime import datetime, date, time
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Text, Integer, Float, Date, Time, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class BookingStatus(str, enum.Enum):
    """预约状态"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    EN_ROUTE = "en_route"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Booking(Base):
    """预约表"""
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    booking_no: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), index=True)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), index=True)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id"), index=True)
    
    booking_date: Mapped[date] = mapped_column(Date, index=True)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)
    duration: Mapped[int] = mapped_column(Integer)
    
    service_price: Mapped[float] = mapped_column(Float)
    discount_amount: Mapped[float] = mapped_column(Float, default=0)
    points_used: Mapped[int] = mapped_column(Integer, default=0)
    points_deduction: Mapped[float] = mapped_column(Float, default=0)
    coupon_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    coupon_deduction: Mapped[float] = mapped_column(Float, default=0)
    total_price: Mapped[float] = mapped_column(Float)
    
    status: Mapped[BookingStatus] = mapped_column(
        SQLEnum(BookingStatus),
        default=BookingStatus.PENDING
    )
    
    user_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    therapist_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    cancel_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cancelled_by: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    therapist_arrived_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    service_started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    service_completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    therapist: Mapped["Therapist"] = relationship(
        "Therapist", 
        back_populates="bookings"
    )
    order: Mapped[Optional["Order"]] = relationship(
        "Order",
        back_populates="booking",
        uselist=False
    )
    review: Mapped[Optional["Review"]] = relationship(
        "Review",
        back_populates="booking",
        uselist=False
    )


# 避免循环导入
from app.models.therapist import Therapist
from app.models.order import Order
from app.models.review import Review
