"""
创建测试账号 - 验证 PNG 头像
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.therapist import Therapist
from app.utils.avatar import generate_default_avatar


async def create_test_account():
    """创建测试账号"""
    async with AsyncSessionLocal() as db:
        phone = "15800158000"
        
        # 检查是否已存在
        result = await db.execute(
            select(User).where(User.phone == phone)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"⚠️  手机号 {phone} 已存在，删除旧账号...")
            # 删除旧的 therapist 记录
            therapist_result = await db.execute(
                select(Therapist).where(Therapist.user_id == existing_user.id)
            )
            therapist = therapist_result.scalar_one_or_none()
            if therapist:
                await db.delete(therapist)
            await db.delete(existing_user)
            await db.commit()
            print("✅ 旧账号已删除")
        
        # 创建新账号
        print(f"\n📝 正在创建测试账号: {phone}")
        
        # 生成 PNG 格式头像
        default_nickname = f"测试{phone[-4:]}"
        default_avatar = generate_default_avatar(phone)
        print(f"🎨 生成头像: {default_avatar}")
        print(f"   格式: PNG ✅ (React Native 原生支持)")
        
        # 创建用户
        user = User(
            phone=phone,
            nickname=default_nickname,
            avatar=default_avatar,
            role=UserRole.THERAPIST,
            is_verified=False,
            is_active=True
        )
        db.add(user)
        await db.flush()
        
        # 创建技师信息
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
        
        print("\n" + "="*60)
        print("✅ 测试账号创建成功！")
        print("="*60)
        print(f"📱 手机号: {phone}")
        print(f"🔑 验证码: 888888")
        print(f"👤 昵称: {default_nickname}")
        print(f"🎨 头像: {default_avatar}")
        print("="*60)
        print("\n💡 测试步骤:")
        print("1. 打开技师端 App")
        print(f"2. 输入手机号: {phone}")
        print("3. 输入验证码: 888888")
        print("4. 登录后查看头像是否正常显示")
        print("="*60)


if __name__ == "__main__":
    asyncio.run(create_test_account())

