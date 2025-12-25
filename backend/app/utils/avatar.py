"""
头像生成工具
"""
import hashlib
from typing import Optional


def generate_default_avatar(
    seed: str,
    style: str = "avataaars",
    size: int = 256
) -> str:
    """
    生成默认头像 URL (DiceBear)
    
    Args:
        seed: 种子值（手机号、用户ID、邮箱等）
        style: 头像风格（avataaars, bottts, personas 等）
        size: 图片尺寸
    
    Returns:
        头像 URL
    
    Examples:
        >>> generate_default_avatar("13800138000")
        'https://api.dicebear.com/7.x/avataaars/png?seed=13800138000&size=256&backgroundColor=b6e3f4,c0aede,d1d4f9'
    """
    # 使用柔和的背景色
    background_colors = "b6e3f4,c0aede,d1d4f9"
    
    # ✅ 改用 PNG 格式，React Native Image 组件原生支持
    return (
        f"https://api.dicebear.com/7.x/{style}/png"  # 从 svg 改为 png
        f"?seed={seed}"
        f"&size={size}"
        f"&backgroundColor={background_colors}"
    )


def generate_avatar_from_name(
    name: str,
    size: int = 256
) -> str:
    """
    基于姓名生成头像 (UI Avatars)
    
    Args:
        name: 姓名
        size: 图片尺寸
    
    Returns:
        头像 URL
    
    Examples:
        >>> generate_avatar_from_name("张三")
        'https://ui-avatars.com/api/?name=张三&size=256&background=random&color=fff&bold=true&rounded=true'
    """
    import urllib.parse
    encoded_name = urllib.parse.quote(name)
    
    return (
        f"https://ui-avatars.com/api/"
        f"?name={encoded_name}"
        f"&size={size}"
        f"&background=random"
        f"&color=fff"
        f"&bold=true"
        f"&rounded=true"
    )


def get_avatar_hash(text: str) -> str:
    """
    生成文本的 MD5 哈希（用于 Gravatar 等）
    
    Args:
        text: 要哈希的文本（通常是邮箱）
    
    Returns:
        MD5 哈希值
    """
    return hashlib.md5(text.lower().encode('utf-8')).hexdigest()

