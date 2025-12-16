"""
认证相关 Schema
"""
from typing import Optional
from pydantic import BaseModel, Field


class SMSCodeRequest(BaseModel):
    """发送验证码请求"""
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$", description="手机号")


class SMSCodeResponse(BaseModel):
    """发送验证码响应"""
    message: str = "验证码已发送"


class LoginRequest(BaseModel):
    """手机号登录请求"""
    phone: str = Field(..., pattern=r"^1[3-9]\d{9}$", description="手机号")
    code: str = Field(..., min_length=4, max_length=6, description="验证码")


class WechatLoginRequest(BaseModel):
    """微信登录请求"""
    code: str = Field(..., description="微信授权码")


class TokenResponse(BaseModel):
    """Token 响应"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """刷新 Token 请求"""
    refresh_token: str


class UserInfo(BaseModel):
    """用户基本信息（包含在 Token 响应中）"""
    id: int
    phone: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    member_level: str
    points: int
    is_new_user: bool = False

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """登录响应"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserInfo

