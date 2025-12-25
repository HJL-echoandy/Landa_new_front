"""
技师端认证接口
"""
import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.therapist import Therapist
from app.schemas.auth import (
    SMSCodeRequest,
    SMSCodeResponse,
    LoginRequest,
    RefreshTokenRequest,
    TokenResponse
)
from pydantic import BaseModel, Field

router = APIRouter()

# 临时存储验证码（生产环境应使用 Redis）
_verification_codes: dict = {}


# ==================== Schemas ====================

class TherapistInfo(BaseModel):
    """技师信息响应"""
    id: int
    user_id: int
    phone: str
    nickname: str = ""
    avatar: str = ""
    role: str
    
    # 技师专属字段
    name: str = ""
    title: str = ""
    experience_years: int = 0
    rating: float = 5.0
    review_count: int = 0  # 与数据库模型一致
    completed_count: int = 0  # 与数据库模型一致
    is_verified: bool = False
    is_active: bool = True  # 与数据库模型一致
    
    class Config:
        from_attributes = True


class TherapistLoginResponse(BaseModel):
    """技师登录响应"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    therapist: TherapistInfo


# ==================== APIs ====================

@router.post("/send-code", response_model=SMSCodeResponse, summary="发送技师验证码")
async def send_therapist_sms_code(request: SMSCodeRequest):
    """
    发送技师端验证码
    
    - 验证码有效期 5 分钟
    - 同一手机号 60 秒内不能重复发送
    """
    phone = request.phone
    
    # TODO: 检查发送频率限制（Redis）
    
    # 生成 6 位验证码
    code = str(random.randint(100000, 999999))
    
    # 存储验证码（生产环境使用 Redis）
    _verification_codes[f"therapist_{phone}"] = {
        "code": code,
        "created_at": datetime.utcnow()
    }
    
    # TODO: 调用阿里云短信服务发送验证码
    # await send_sms(phone, code, template="therapist_login")
    
    # 开发环境打印验证码
    if settings.DEBUG:
        print(f"[DEBUG] 技师验证码: {phone} -> {code}")
    
    return SMSCodeResponse(message="验证码已发送")


@router.post("/login", response_model=TherapistLoginResponse, summary="技师登录")
async def therapist_login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    技师手机验证码登录
    
    - 只允许已注册的技师登录
    - 返回 access_token 和 refresh_token
    - Token 中包含 role='therapist'
    """
    phone = request.phone
    code = request.code
    
    # 验证验证码
    stored = _verification_codes.get(f"therapist_{phone}")
    if not stored or stored["code"] != code:
        # 开发环境允许万能验证码
        if not (settings.DEBUG and code == "888888"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码错误或已过期"
            )
    
    # 清除验证码
    _verification_codes.pop(f"therapist_{phone}", None)
    
    # 查询用户，必须是技师角色
    result = await db.execute(
        select(User).where(
            User.phone == phone,
            User.role == UserRole.THERAPIST
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="该手机号未注册为技师，请联系管理员"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已被禁用，请联系管理员"
        )
    
    # 查询技师详细信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        # 技师数据不存在，自动创建
        therapist = Therapist(
            user_id=user.id,
            name=user.nickname or f"技师{phone[-4:]}",
            title="按摩师",
            experience_years=0,
            rating=5.0
        )
        db.add(therapist)
        await db.flush()
    
    # 更新最后登录时间
    user.last_login_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    await db.refresh(therapist)
    
    # 生成 Token（包含 role='therapist'）
    access_token = create_access_token(user.id, role=UserRole.THERAPIST.value)
    refresh_token = create_refresh_token(user.id)
    
    return TherapistLoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        therapist=TherapistInfo(
            id=therapist.id,
            user_id=user.id,
            phone=user.phone,
            nickname=user.nickname or "",
            avatar=user.avatar or "",
            role=user.role.value,
            name=therapist.name,
            title=therapist.title,
            experience_years=therapist.experience_years,
            rating=therapist.rating,
            review_count=therapist.review_count,  # 直接使用数据库字段
            completed_count=therapist.completed_count,  # 直接使用数据库字段
            is_verified=therapist.is_verified,
            is_active=therapist.is_active  # 直接使用数据库字段
        )
    )


@router.post("/refresh", response_model=TokenResponse, summary="刷新技师 Token")
async def refresh_therapist_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    使用 refresh_token 刷新技师 access_token
    """
    token_data = verify_token(request.refresh_token, "refresh")
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user_id = token_data.get("user_id")
    
    # 验证用户存在且是技师
    result = await db.execute(
        select(User).where(
            User.id == int(user_id),
            User.role == UserRole.THERAPIST
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # 生成新 Token（包含 role）
    access_token = create_access_token(user.id, role=UserRole.THERAPIST.value)
    refresh_token = create_refresh_token(user.id)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/logout", summary="技师登出")
async def therapist_logout():
    """
    技师登出
    
    - 前端清除本地 Token
    - 后端可以将 Token 加入黑名单（需要 Redis）
    """
    # TODO: 将 Token 加入黑名单（Redis）
    return {"message": "登出成功"}

