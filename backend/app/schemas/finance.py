from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from app.models.finance import WithdrawalStatus, TransactionType

# --- 余额相关 Schema ---

class TherapistBalanceResponse(BaseModel):
    balance: float
    total_income: float
    frozen_amount: float
    updated_at: datetime

    class Config:
        from_attributes = True

# --- 提现相关 Schema ---

class WithdrawalCreateRequest(BaseModel):
    amount: float = Field(..., gt=0, description="提现金额")
    account_type: str = Field(..., description="账户类型: alipay, wechat, bank")
    account_name: str = Field(..., description="账户姓名")
    account_no: str = Field(..., description="账号")
    bank_name: Optional[str] = Field(None, description="银行名称(仅银行卡需要)")
    remark: Optional[str] = None

class WithdrawalResponse(BaseModel):
    id: int
    therapist_id: int
    amount: float
    status: WithdrawalStatus
    
    account_type: str
    account_name: str
    account_no: str
    bank_name: Optional[str]
    
    remark: Optional[str]
    admin_note: Optional[str]
    
    created_at: datetime
    processed_at: Optional[datetime]

    class Config:
        from_attributes = True

# --- 交易流水相关 Schema ---

class TransactionResponse(BaseModel):
    id: int
    type: TransactionType
    amount: float
    balance_after: float
    description: Optional[str]
    reference_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

