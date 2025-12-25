"""
创建新的测试技师账号
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.therapist import Therapist
from app.utils.avatar import generate_default_avatar


async def create_new_therapist():
    """创建新的测试技师账号"""
    async with AsyncSessionLocal() as db:
        # 使用新的手机号
        phone = "13900139000"
        
        # 检查是否已存在
        result = await db.execute(
            select(User).where(User.phone == phone)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"⚠️  手机号 {phone} 已存在")
            print(f"如需创建新账号，请修改手机号")
            return
        
        # 创建新账号
        print(f"📝 正在创建新技师账号: {phone}")
        
        # ✅ 生成默认头像
        default_nickname = f"技师{phone[-4:]}"
        default_avatar = generate_default_avatar(phone)
        print(f"🎨 生成默认头像: {default_avatar}")
        
        # 1. 创建用户
        user = User(
            phone=phone,
            nickname=default_nickname,
            avatar=default_avatar,
            role=UserRole.THERAPIST,
            is_verified=False,
            is_active=True
        )
        db.add(user)
        await db.flush()  # 获取 user.id
        
        # 2. 创建技师信息
        therapist = Therapist(
            user_id=user.id,
            name=default_nickname,
            title="按摩师",
            avatar=default_avatar,
            about="",
            experience_years=0,
            rating=5.0,
            review_count=0,
            booking_count=0,
            completed_count=0,
            specialties=[],
            service_areas=[],
            base_price=0,
            is_verified=False,
            is_active=True
        )
        db.add(therapist)
        
        await db.commit()
        await db.refresh(user)
        await db.refresh(therapist)
        
        print("\n✅ 新技师账号创建成功！")
        print("\n" + "="*60)
        print("📱 新账号信息")
        print("="*60)
        print(f"手机号: {phone}")
        print(f"验证码: 888888 (debug 模式通用验证码)")
        print(f"昵称: {default_nickname}")
        print(f"头像: {default_avatar}")
        print(f"角色: {user.role.value}")
        print("="*60)
        print("\n💡 使用方法:")
        print("1. 打开技师端 App")
        print(f"2. 输入手机号: {phone}")
        print("3. 点击 '发送验证码'")
        print("4. 输入验证码: 888888")
        print("5. 点击 '登录'")
        print("="*60)


if __name__ == "__main__":
    asyncio.run(create_new_therapist())

