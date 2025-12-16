"""
优惠券模型
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Text, Integer, Float, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
import enum

from app.core.database import Base


class CouponType(str, enum.Enum):
    """优惠券类型"""
    PERCENTAGE = "percentage"  # 折扣券（百分比）
    FIXED = "fixed"            # 固定金额券


class CouponStatus(str, enum.Enum):
    """优惠券状态"""
    ACTIVE = "active"          # 可用
    USED = "used"              # 已使用
    EXPIRED = "expired"        # 已过期
    DISABLED = "disabled"      # 已禁用


class CouponTemplate(Base):
    """优惠券模板表（用于发放）"""
    __tablename__ = "coupon_templates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # 基本信息
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)  # 优惠码
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # 优惠类型与金额
    coupon_type: Mapped[CouponType] = mapped_column(SQLEnum(CouponType))
    value: Mapped[float] = mapped_column(Float)  # 折扣值（百分比或金额）
    
    # 使用条件
    min_order_amount: Mapped[float] = mapped_column(Float, default=0)  # 最低订单金额
    max_discount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 最大优惠金额（折扣券适用）
    
    # 适用范围
    applicable_services: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # 适用服务ID，逗号分隔
    applicable_therapists: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # 适用治疗师ID
    
    # 发放限制
    total_count: Mapped[int] = mapped_column(Integer)  # 总发放数量
    issued_count: Mapped[int] = mapped_column(Integer, default=0)  # 已发放数量
    per_user_limit: Mapped[int] = mapped_column(Integer, default=1)  # 每用户限领数量
    
    # 有效期
    valid_start: Mapped[datetime] = mapped_column(DateTime)
    valid_end: Mapped[datetime] = mapped_column(DateTime)
    
    # 状态
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )


class UserCoupon(Base):
    """用户优惠券表"""
    __tablename__ = "user_coupons"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # 关联
    user_id: Mapped[int] = mapped_column(index=True)
    template_id: Mapped[int] = mapped_column(index=True)
    
    # 优惠券信息（从模板复制，便于历史查询）
    code: Mapped[str] = mapped_column(String(50), index=True)
    coupon_type: Mapped[CouponType] = mapped_column(SQLEnum(CouponType))
    value: Mapped[float] = mapped_column(Float)
    min_order_amount: Mapped[float] = mapped_column(Float)
    max_discount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # 有效期
    valid_start: Mapped[datetime] = mapped_column(DateTime)
    valid_end: Mapped[datetime] = mapped_column(DateTime)
    
    # 状态
    status: Mapped[CouponStatus] = mapped_column(
        SQLEnum(CouponStatus),
        default=CouponStatus.ACTIVE
    )
    
    # 使用信息
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    used_order_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    
    # 时间戳
    received_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PointsHistory(Base):
    """积分历史记录表"""
    __tablename__ = "points_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(index=True)
    
    # 积分变动
    amount: Mapped[int] = mapped_column(Integer)  # 正数为获得，负数为消耗
    balance: Mapped[int] = mapped_column(Integer)  # 变动后余额
    
    # 来源/用途
    type: Mapped[str] = mapped_column(String(50))  # earn/redeem/expire/adjust
    description: Mapped[str] = mapped_column(String(200))
    
    # 关联订单（如有）
    order_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

