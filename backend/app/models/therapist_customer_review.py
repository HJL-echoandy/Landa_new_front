"""
技师对客户评价模型 (Therapist to Customer Review)
技师完成服务后对客户的评价和反馈
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, DateTime, Text, Integer, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TherapistCustomerReview(Base):
    """技师对客户评价表"""
    __tablename__ = "therapist_customer_reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # 关联字段
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)  # 被评价的客户
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"), index=True, unique=True)
    
    # 评分（1-5星）
    rating: Mapped[int] = mapped_column(Integer)  # 整体评分
    
    # 快速标签（多选）
    tags: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)  # 例如：['准时', '礼貌', '小费丰厚']
    
    # 私密备注（仅管理员可见）
    private_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # 关联关系
    therapist: Mapped["Therapist"] = relationship("Therapist")
    user: Mapped["User"] = relationship("User")
    booking: Mapped["Booking"] = relationship("Booking")


# 避免循环导入
from app.models.therapist import Therapist
from app.models.user import User
from app.models.booking import Booking

