"""
财务相关 API 端点
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime

from app.core.database import get_db
from app.api.deps import get_current_therapist
from app.models.therapist import Therapist
from app.models.finance import (
    TherapistBalance, 
    Withdrawal, 
    Transaction, 
    WithdrawalStatus,
    TransactionType
)
from app.schemas.finance import (
    TherapistBalanceResponse,
    WithdrawalCreateRequest,
    WithdrawalResponse,
    TransactionResponse
)

router = APIRouter()

@router.get("/balance", response_model=TherapistBalanceResponse, summary="获取技师余额信息")
async def get_balance(
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db)
):
    """
    获取当前技师的余额、累计收入等信息
    如果账户不存在，会自动初始化
    """
    result = await db.execute(
        select(TherapistBalance).where(TherapistBalance.therapist_id == current_therapist.id)
    )
    balance_obj = result.scalar_one_or_none()

    if not balance_obj:
        # 自动初始化
        balance_obj = TherapistBalance(
            therapist_id=current_therapist.id,
            balance=0.0,
            total_income=0.0,
            frozen_amount=0.0
        )
        db.add(balance_obj)
        await db.commit()
        await db.refresh(balance_obj)
    
    return balance_obj


@router.post("/withdrawals", response_model=WithdrawalResponse, summary="申请提现")
async def create_withdrawal(
    request: WithdrawalCreateRequest,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db)
):
    """
    提交提现申请
    """
    # 1. 检查余额是否充足
    result = await db.execute(
        select(TherapistBalance).where(TherapistBalance.therapist_id == current_therapist.id)
    )
    balance_obj = result.scalar_one_or_none()
    
    if not balance_obj:
        # 应该不太可能发生，因为通常先查询余额
        balance_obj = TherapistBalance(therapist_id=current_therapist.id)
        db.add(balance_obj)
        await db.commit()
    
    if balance_obj.balance < request.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="余额不足"
        )
        
    # 2. 扣除余额，增加冻结金额
    balance_obj.balance -= request.amount
    balance_obj.frozen_amount += request.amount
    
    # 3. 创建提现记录
    withdrawal = Withdrawal(
        therapist_id=current_therapist.id,
        amount=request.amount,
        status=WithdrawalStatus.PENDING,
        account_type=request.account_type,
        account_name=request.account_name,
        account_no=request.account_no,
        bank_name=request.bank_name,
        remark=request.remark
    )
    db.add(withdrawal)
    
    # 4. 创建交易流水 (类型为 WITHDRAWAL)
    # 注意：这里记录的是负数，表示余额减少
    transaction = Transaction(
        therapist_id=current_therapist.id,
        type=TransactionType.WITHDRAWAL,
        amount=-request.amount,
        balance_after=balance_obj.balance,
        description=f"申请提现到 {request.account_type}",
        # reference_id 将在提交后关联，这里稍微棘手，因为 withdrawal.id 还没生成
        # 我们可以先 commit withdrawal 再更新 reference_id，或者利用 flush
    )
    db.add(transaction)
    
    await db.commit()
    await db.refresh(withdrawal)
    
    # 更新 transaction 的 reference_id
    transaction.reference_id = str(withdrawal.id)
    await db.commit()
    
    return withdrawal


@router.get("/withdrawals", response_model=List[WithdrawalResponse], summary="获取提现记录")
async def get_withdrawals(
    skip: int = 0,
    limit: int = 20,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db)
):
    """
    分页获取提现记录
    """
    result = await db.execute(
        select(Withdrawal)
        .where(Withdrawal.therapist_id == current_therapist.id)
        .order_by(desc(Withdrawal.created_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/transactions", response_model=List[TransactionResponse], summary="获取资金流水")
async def get_transactions(
    skip: int = 0,
    limit: int = 20,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db)
):
    """
    分页获取资金流水
    """
    result = await db.execute(
        select(Transaction)
        .where(Transaction.therapist_id == current_therapist.id)
        .order_by(desc(Transaction.created_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

