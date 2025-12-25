"""
创建测试技师账号
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


async def create_test_therapist():
    """创建测试技师账号"""
    async with AsyncSessionLocal() as db:
        # 检查是否已存在
        result = await db.execute(
            select(User).where(User.phone == "13800138000")
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print("⚠️  测试账号已存在")
            print(f"手机号: {existing_user.phone}")
            print(f"角色: {existing_user.role.value}")
            
            # 检查技师信息
            therapist_result = await db.execute(
                select(Therapist).where(Therapist.user_id == existing_user.id)
            )
            therapist = therapist_result.scalar_one_or_none()
            
            if therapist:
                print(f"技师姓名: {therapist.name}")
                print(f"技师职称: {therapist.title}")
                print(f"评分: {therapist.rating}")
                print(f"评价数: {therapist.review_count}")
                print(f"完成订单: {therapist.completed_count}")
            else:
                print("⚠️  技师信息缺失，正在创建...")
                therapist = Therapist(
                    user_id=existing_user.id,
                    name="测试技师",
                    title="高级按摩师",
                    experience_years=5,
                    rating=4.8,
                    review_count=120,
                    booking_count=450,
                    completed_count=450,
                    is_verified=True,
                    is_active=True
                )
                db.add(therapist)
                await db.commit()
                print("✅ 技师信息创建成功")
            
            return
        
        # 创建新账号
        print("📝 正在创建测试技师账号...")
        
        # 1. 创建用户
        user = User(
            phone="13800138000",
            nickname="测试技师",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=therapist",
            role=UserRole.THERAPIST,
            is_verified=True,
            is_active=True
        )
        db.add(user)
        await db.flush()  # 获取 user.id
        
        # 2. 创建技师信息
        therapist = Therapist(
            user_id=user.id,
            name="测试技师",
            title="高级按摩师",
            experience_years=5,
            rating=4.8,
            review_count=120,  # 使用正确的字段名
            booking_count=450,
            completed_count=450,
            specialties=["推拿", "按摩", "拔罐"],
            service_areas=["北京市朝阳区", "北京市海淀区"],
            base_price=150.0,
            is_verified=True,
            is_active=True
        )
        db.add(therapist)
        
        await db.commit()
        await db.refresh(user)
        await db.refresh(therapist)
        
        print("\n✅ 测试账号创建成功！")
        print("\n" + "="*50)
        print("📱 测试账号信息:")
        print("="*50)
        print(f"手机号: {user.phone}")
        print(f"验证码: 888888 (万能验证码)")
        print(f"角色: {user.role.value}")
        print(f"技师ID: {therapist.id}")
        print(f"技师姓名: {therapist.name}")
        print(f"职称: {therapist.title}")
        print(f"工作年限: {therapist.experience_years}年")
        print(f"评分: {therapist.rating}/5.0")
        print(f"评价数: {therapist.review_count}")
        print(f"完成订单: {therapist.completed_count}单")
        print("="*50)
        print("\n💡 使用方法:")
        print("1. 在技师登录页面输入手机号: 13800138000")
        print("2. 点击'发送验证码'")
        print("3. 输入验证码: 888888")
        print("4. 点击'登录'")
        print("="*50 + "\n")


if __name__ == "__main__":
    print("🚀 开始创建测试技师账号...\n")
    asyncio.run(create_test_therapist())

