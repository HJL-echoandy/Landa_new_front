"""
认证接口
"""
import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import (
    SMSCodeRequest, 
    SMSCodeResponse,
    LoginRequest, 
    LoginResponse,
    RefreshTokenRequest,
    TokenResponse,
    UserInfo
)

router = APIRouter()

# 临时存储验证码（生产环境应使用 Redis）
_verification_codes: dict = {}


@router.post("/send-code", response_model=SMSCodeResponse, summary="发送验证码")
async def send_sms_code(request: SMSCodeRequest):
    """
    发送手机验证码
    
    - 验证码有效期 5 分钟
    - 同一手机号 60 秒内不能重复发送
    """
    phone = request.phone
    
    # TODO: 检查发送频率限制（Redis）
    
    # 生成 6 位验证码
    code = str(random.randint(100000, 999999))
    
    # 存储验证码（生产环境使用 Redis）
    _verification_codes[phone] = {
        "code": code,
        "created_at": datetime.utcnow()
    }
    
    # TODO: 调用阿里云短信服务发送验证码
    # await send_sms(phone, code)
    
    # 开发环境打印验证码
    if settings.DEBUG:
        print(f"[DEBUG] 验证码: {phone} -> {code}")
    
    return SMSCodeResponse(message="验证码已发送")


@router.post("/login", response_model=LoginResponse, summary="手机号登录")
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    手机验证码登录
    
    - 未注册用户自动注册
    - 返回 access_token 和 refresh_token
    """
    phone = request.phone
    code = request.code
    
    # 验证验证码
    stored = _verification_codes.get(phone)
    if not stored or stored["code"] != code:
        # 开发环境允许万能验证码
        if not (settings.DEBUG and code == "888888"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码错误或已过期"
            )
    
    # 清除验证码
    _verification_codes.pop(phone, None)
    
    # 查询用户
    result = await db.execute(
        select(User).where(User.phone == phone)
    )
    user = result.scalar_one_or_none()
    
    is_new_user = False
    
    # 新用户自动注册
    if not user:
        user = User(
            phone=phone,
            nickname=f"用户{phone[-4:]}",
            is_verified=True
        )
        db.add(user)
        await db.flush()
        is_new_user = True
    
    # 更新最后登录时间
    user.last_login_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    
    # 生成 Token
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserInfo(
            id=user.id,
            phone=user.phone,
            nickname=user.nickname,
            avatar=user.avatar,
            member_level=user.member_level.value,
            points=user.points,
            is_new_user=is_new_user
        )
    )


@router.post("/refresh", response_model=TokenResponse, summary="刷新 Token")
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    使用 refresh_token 刷新 access_token
    """
    user_id = verify_token(request.refresh_token, "refresh")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # 验证用户存在且活跃
    result = await db.execute(
        select(User).where(User.id == int(user_id))
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # 生成新 Token
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

