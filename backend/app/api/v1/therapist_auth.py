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
from app.schemas.therapist import UpdateProfileRequest
from app.api.deps import get_current_user, require_role
from app.utils.avatar import generate_default_avatar  # 添加头像生成工具
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
    
    # 查询用户
    result = await db.execute(
        select(User).where(User.phone == phone)
    )
    user = result.scalar_one_or_none()
    
    is_new_user = False
    
    # 如果用户不存在，创建新用户（自动注册）
    if not user:
        is_new_user = True
        
        # ✅ 生成默认昵称和头像
        default_nickname = f"技师{phone[-4:]}"
        default_avatar = generate_default_avatar(phone)  # 使用 DiceBear
        
        print(f"🆕 创建新技师用户: {phone}")
        print(f"   昵称: {default_nickname}")
        print(f"   头像: {default_avatar}")
        
        user = User(
            phone=phone,
            nickname=default_nickname,
            avatar=default_avatar,  # ✅ 设置默认头像
            role=UserRole.THERAPIST,
            is_active=True,
            is_verified=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(user)
        await db.flush()  # 获取 user.id
    
    # 验证用户角色
    if user.role != UserRole.THERAPIST:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="该手机号不是技师账号"
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
    
    # 如果技师档案不存在，自动创建
    if not therapist:
        default_avatar = user.avatar or generate_default_avatar(phone)
        
        print(f"📝 创建技师档案: user_id={user.id}")
        
        therapist = Therapist(
            user_id=user.id,
            name=user.nickname or f"技师{phone[-4:]}",
            title="按摩师",
            avatar=default_avatar,  # ✅ 设置默认头像
            about="",
            experience_years=0,
            specialties=[],
            rating=5.0,
            review_count=0,
            booking_count=0,
            completed_count=0,
            base_price=0,
            is_active=True,
            is_verified=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(therapist)
        await db.flush()
    
    # 更新最后登录时间
    user.last_login_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    await db.refresh(therapist)
    
    if is_new_user:
        print(f"✅ 新技师注册成功: {phone}")
    
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


@router.get("/profile", response_model=TherapistInfo, summary="获取当前技师信息")
async def get_current_therapist_profile(
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """
    获取当前已登录技师的完整信息
    - 需要有效的 access_token
    - 仅限技师角色访问
    """
    # 查询技师档案
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()

    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist profile not found for this user."
        )

    return TherapistInfo(
        id=therapist.id,
        user_id=current_user.id,
        phone=current_user.phone,
        nickname=current_user.nickname or "",
        avatar=current_user.avatar or "",
        role=current_user.role.value,
        name=therapist.name,
        title=therapist.title,
        experience_years=therapist.experience_years,
        rating=therapist.rating,
        review_count=therapist.review_count,
        completed_count=therapist.completed_count,
        is_verified=therapist.is_verified,
        is_active=therapist.is_active
    )


@router.put("/profile", response_model=TherapistInfo, summary="更新当前技师信息")
async def update_therapist_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """
    更新当前已登录技师的个人信息
    - 需要有效的 access_token
    - 仅限技师角色访问
    - 只更新传入的字段（部分更新）
    """
    # 查询技师档案
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()

    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist profile not found for this user."
        )

    # 更新字段（只更新传入的非 None 字段）
    update_data = request.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(therapist, field):
            setattr(therapist, field, value)

    # 如果更新了头像，同时更新 User 表的头像
    if request.avatar:
        current_user.avatar = request.avatar

    # 提交更新
    therapist.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(therapist)
    await db.refresh(current_user)

    return TherapistInfo(
        id=therapist.id,
        user_id=current_user.id,
        phone=current_user.phone,
        nickname=current_user.nickname or "",
        avatar=current_user.avatar or "",
        role=current_user.role.value,
        name=therapist.name,
        title=therapist.title,
        experience_years=therapist.experience_years,
        rating=therapist.rating,
        review_count=therapist.review_count,
        completed_count=therapist.completed_count,
        is_verified=therapist.is_verified,
        is_active=therapist.is_active
    )


