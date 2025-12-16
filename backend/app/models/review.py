"""
评价模型
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Text, Integer, Float, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Review(Base):
    """评价表"""
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), index=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"), index=True, unique=True)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), index=True)
    
    rating: Mapped[int] = mapped_column(Integer)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    images: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    
    skill_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    attitude_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    punctuality_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    tip_amount: Mapped[float] = mapped_column(Float, default=0)
    
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    
    reply_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reply_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    user: Mapped["User"] = relationship("User", back_populates="reviews")
    therapist: Mapped["Therapist"] = relationship("Therapist", back_populates="reviews")
    booking: Mapped["Booking"] = relationship("Booking", back_populates="review")


# 避免循环导入
from app.models.user import User
from app.models.therapist import Therapist
from app.models.booking import Booking
