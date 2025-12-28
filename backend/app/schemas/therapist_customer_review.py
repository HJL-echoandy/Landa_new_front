"""
技师对客户评价 Schema
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator


class TherapistCustomerReviewCreate(BaseModel):
    """技师提交客户评价请求"""
    rating: int = Field(..., ge=1, le=5, description="评分（1-5星）")
    tags: Optional[List[str]] = Field(None, description="快速标签")
    private_note: Optional[str] = Field(None, max_length=500, description="私密备注")

    @validator('tags')
    def validate_tags(cls, v):
        """验证标签"""
        if v is not None and len(v) > 10:
            raise ValueError("标签数量不能超过10个")
        return v


class TherapistCustomerReviewResponse(BaseModel):
    """技师对客户评价响应"""
    id: int
    therapist_id: int
    user_id: int
    booking_id: int
    rating: int
    tags: Optional[List[str]]
    private_note: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TherapistCustomerReviewListResponse(BaseModel):
    """技师对客户评价列表响应"""
    id: int
    user_id: int
    booking_id: int
    rating: int
    tags: Optional[List[str]]
    created_at: datetime
    
    # 客户信息
    customer_name: str
    customer_avatar: Optional[str]
    
    # 订单信息
    service_name: str
    booking_date: str

    class Config:
        from_attributes = True

