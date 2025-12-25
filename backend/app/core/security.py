"""
安全模块 - JWT 认证、密码加密
"""
from datetime import datetime, timedelta
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 算法
ALGORITHM = "HS256"


def create_access_token(
    subject: Any, 
    role: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    创建访问令牌
    
    Args:
        subject: 令牌主题（通常是用户ID）
        role: 用户角色（user/therapist/admin）
        expires_delta: 过期时间增量
        
    Returns:
        JWT 令牌字符串
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    
    # 添加角色信息到 Token
    if role:
        to_encode["role"] = role
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(subject: Any) -> str:
    """
    创建刷新令牌
    
    Args:
        subject: 令牌主题（通常是用户ID）
        
    Returns:
        JWT 刷新令牌字符串
    """
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
    """
    验证令牌
    
    Args:
        token: JWT 令牌
        token_type: 令牌类型 (access/refresh)
        
    Returns:
        包含 user_id 和 role 的字典，或 None
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        type_: str = payload.get("type")
        role: str = payload.get("role")
        
        if user_id is None or type_ != token_type:
            return None
            
        return {
            "user_id": user_id,
            "role": role
        }
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """获取密码哈希"""
    return pwd_context.hash(password)

