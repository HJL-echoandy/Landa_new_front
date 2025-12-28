"""
财务相关模型
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, DateTime, ForeignKey, Enum as SQLEnum, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base

class WithdrawalStatus(str, enum.Enum):
    """提现状态"""
    PENDING = "pending"     # 待审核
    APPROVED = "approved"   # 已审核/打款中
    REJECTED = "rejected"   # 已拒绝
    PAID = "paid"          # 已打款/完成

class TransactionType(str, enum.Enum):
    """交易类型"""
    INCOME = "income"           # 收入 (订单完成)
    WITHDRAWAL = "withdrawal"   # 提现
    REFUND = "refund"          # 退款 (扣除收入)
    ADJUSTMENT = "adjustment"   # 系统调整

class TherapistBalance(Base):
    """技师余额表"""
    __tablename__ = "therapist_balances"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), unique=True, index=True)
    
    # 金额字段 (使用 Float 保持与现有项目一致，虽然金融计算推荐 Decimal)
    balance: Mapped[float] = mapped_column(Float, default=0.0)      # 可用余额
    total_income: Mapped[float] = mapped_column(Float, default=0.0) # 累计总收入
    frozen_amount: Mapped[float] = mapped_column(Float, default=0.0) # 冻结金额 (提现中)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )

    # 关系
    therapist: Mapped["Therapist"] = relationship("Therapist")


class Withdrawal(Base):
    """提现申请表"""
    __tablename__ = "withdrawals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), index=True)
    
    amount: Mapped[float] = mapped_column(Float) # 提现金额
    status: Mapped[WithdrawalStatus] = mapped_column(
        SQLEnum(WithdrawalStatus),
        default=WithdrawalStatus.PENDING
    )
    
    # 提现账户信息 (快照，防止用户修改资料导致历史记录变动)
    account_type: Mapped[str] = mapped_column(String(20)) # alipay, wechat, bank
    account_name: Mapped[str] = mapped_column(String(100))
    account_no: Mapped[str] = mapped_column(String(100))
    bank_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True) # 仅银行卡需要
    
    remark: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # 申请备注
    admin_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # 管理员备注（如拒绝原因）
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True) # 处理时间
    processed_by: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # 处理人ID
    
    # 关系
    therapist: Mapped["Therapist"] = relationship("Therapist")


class Transaction(Base):
    """资金流水表"""
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), index=True)
    
    type: Mapped[TransactionType] = mapped_column(SQLEnum(TransactionType))
    amount: Mapped[float] = mapped_column(Float) # 变动金额 (正数增加，负数减少)
    balance_after: Mapped[float] = mapped_column(Float) # 变动后余额
    
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reference_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # 关联ID (如 order_no 或 withdrawal_id)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # 关系
    therapist: Mapped["Therapist"] = relationship("Therapist")

