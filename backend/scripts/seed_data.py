"""
测试数据脚本 - 初始化数据库测试数据
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.append(str(Path(__file__).parent.parent))

from datetime import datetime, date, time, timedelta
from sqlalchemy import select

from app.core.database import AsyncSessionLocal, init_db
from app.models.user import User, Address, MemberLevel
from app.models.therapist import Therapist, TherapistSchedule, TherapistTimeSlot
from app.models.service import Service, ServiceCategory, TherapistService


async def seed_service_categories(session):
    """创建服务分类"""
    categories = [
        {
            "name": "放松按摩",
            "name_en": "Relaxation",
            "description": "缓解压力，放松身心",
            "icon": "🧘",
            "sort_order": 1
        },
        {
            "name": "理疗按摩",
            "name_en": "Therapeutic",
            "description": "针对性治疗，缓解疼痛",
            "icon": "💪",
            "sort_order": 2
        },
        {
            "name": "特色按摩",
            "name_en": "Specialty",
            "description": "特色疗法，独特体验",
            "icon": "✨",
            "sort_order": 3
        }
    ]
    
    for cat_data in categories:
        category = ServiceCategory(**cat_data)
        session.add(category)
    
    await session.flush()
    print(f"✅ 创建了 {len(categories)} 个服务分类")
    
    return await session.execute(select(ServiceCategory))


async def seed_services(session):
    """创建服务"""
    # 获取分类
    result = await session.execute(select(ServiceCategory))
    categories = {c.name_en: c.id for c in result.scalars()}
    
    services = [
        {
            "category_id": categories["Relaxation"],
            "name": "瑞典式按摩",
            "name_en": "Swedish Massage",
            "description": "经典的放松按摩，使用长推、揉捏等手法，促进血液循环，缓解肌肉紧张。",
            "short_description": "经典放松按摩",
            "base_price": 299,
            "duration": 60,
            "benefits": ["缓解压力", "促进血液循环", "改善睡眠", "放松肌肉"],
            "is_featured": True,
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCyoWSLrMHyo5N40_fO7cU_lNNt-LwnjFK3qAchrJZM5QWNOvJasYBCKtZXiRK3sI1B0NPwlEGkF02r0a7Nyu54SlLd1o_I-836e_BuX1PJtyhIxTXQ115RJWiznssve06Fm5FXqsel6k0uCyKqPxJJ-UG_vnpEj0zbsz7BFg_P5UG1OLLXr3S6CdC4-EjTiFzPfwygvKx7X09-ZNQGybT8ziJXIwQvwx4zhzr7HoxuhDtWAZt__A86zNZXPoQY4YGpiacaSsyt6v7V"
        },
        {
            "category_id": categories["Therapeutic"],
            "name": "深层组织按摩",
            "name_en": "Deep Tissue Massage",
            "description": "深层肌肉组织按摩，针对慢性疼痛和肌肉紧张，使用较大力度的手法。",
            "short_description": "深层肌肉放松",
            "base_price": 399,
            "duration": 60,
            "benefits": ["缓解慢性疼痛", "改善姿势", "加速恢复", "释放深层紧张"],
            "is_featured": True,
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDBu2JGWuRDu5UrSkk6f8cvkVh1r98-1xJCTRrBodR7mSbzlsbwNspU_f-wQiOMIMQb1IXGoz4VATTqdqNfkJ32w1kRxGxQq2Rc-fKU0JuFDWpNglhA3Cw3CWWN8rdNjN_-ePiXtc2ccw0DPdz3V3cVYu8dyNaq2FQnJn9EZZbQVz5bRQFg0IkQB0DNXNCpNt5x0XRxHm9Ffl40I4JPQoZY2XmeoZP510WG2-Xnk-RAV4ILVUGDvqbE52zFLsiTkRgo68BkAK2xm9up"
        },
        {
            "category_id": categories["Specialty"],
            "name": "孕妇按摩",
            "name_en": "Prenatal Massage",
            "description": "专为孕妇设计的安全按摩，缓解孕期不适，促进放松。",
            "short_description": "孕期专属护理",
            "base_price": 359,
            "duration": 60,
            "benefits": ["缓解背痛", "减轻水肿", "改善睡眠", "减少焦虑"],
            "is_featured": False,
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBqAx37MPdw2eBNdhI-GGueK9wmeMf0l5PZ3ek5Q3KF44chgldDnk4wfZkdE01UhiAOIRGnSxNdVd7imZOZEKwi5ngAtW8lUHj0004c1qAGIdke6WMB6jqA1v7cS5K97n2jwtdd1A8ee1moORVVHPdb7GTR7k-uxAzshcOKQM5cf484qc6r-eTcptT-2kcf3hENGOf6891lz6GDjAYnd48OpenOH_1MFVOqeLrHIqU9D8ryEzHdHC3mzoYR3-tTmCvJgh2Jbkjg6j1x"
        },
        {
            "category_id": categories["Specialty"],
            "name": "热石按摩",
            "name_en": "Hot Stone Massage",
            "description": "使用加热的火山石进行按摩，热能深入肌肉，带来独特的放松体验。",
            "short_description": "温热深层舒缓",
            "base_price": 459,
            "duration": 75,
            "benefits": ["深度放松", "促进血液循环", "缓解肌肉僵硬", "改善睡眠"],
            "is_featured": True,
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCyoWSLrMHyo5N40_fO7cU_lNNt-LwnjFK3qAchrJZM5QWNOvJasYBCKtZXiRK3sI1B0NPwlEGkF02r0a7Nyu54SlLd1o_I-836e_BuX1PJtyhIxTXQ115RJWiznssve06Fm5FXqsel6k0uCyKqPxJJ-UG_vnpEj0zbsz7BFg_P5UG1OLLXr3S6CdC4-EjTiFzPfwygvKx7X09-ZNQGybT8ziJXIwQvwx4zhzr7HoxuhDtWAZt__A86zNZXPoQY4YGpiacaSsyt6v7V"
        },
        {
            "category_id": categories["Relaxation"],
            "name": "芳香精油按摩",
            "name_en": "Aromatherapy Massage",
            "description": "结合精油的芳香疗法按摩，精油通过皮肤吸收，带来身心双重放松。",
            "short_description": "精油芳香疗愈",
            "base_price": 349,
            "duration": 60,
            "benefits": ["舒缓情绪", "改善皮肤", "放松身心", "提升免疫"],
            "is_featured": False,
            "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDBu2JGWuRDu5UrSkk6f8cvkVh1r98-1xJCTRrBodR7mSbzlsbwNspU_f-wQiOMIMQb1IXGoz4VATTqdqNfkJ32w1kRxGxQq2Rc-fKU0JuFDWpNglhA3Cw3CWWN8rdNjN_-ePiXtc2ccw0DPdz3V3cVYu8dyNaq2FQnJn9EZZbQVz5bRQFg0IkQB0DNXNCpNt5x0XRxHm9Ffl40I4JPQoZY2XmeoZP510WG2-Xnk-RAV4ILVUGDvqbE52zFLsiTkRgo68BkAK2xm9up"
        }
    ]
    
    for service_data in services:
        service = Service(**service_data)
        session.add(service)
    
    await session.flush()
    print(f"✅ 创建了 {len(services)} 个服务")


async def seed_therapists(session):
    """创建治疗师"""
    # 先创建用户账号
    therapist_users = []
    for i in range(4):
        user = User(
            phone=f"1380000000{i}",
            nickname=f"治疗师{i+1}",
            is_verified=True,
            member_level=MemberLevel.GOLD
        )
        session.add(user)
        therapist_users.append(user)
    
    await session.flush()
    
    therapists_data = [
        {
            "user_id": therapist_users[0].id,
            "name": "Dr. Anya Sharma",
            "title": "高级按摩治疗师",
            "about": "Dr. Sharma 拥有 8 年专业按摩经验，专注于深层组织按摩和运动康复。曾在多家五星级酒店 SPA 工作，擅长解决慢性疼痛问题。",
            "experience_years": 8,
            "specialties": ["深层组织", "运动康复", "瑞典式"],
            "certifications": ["国家高级按摩师证书", "运动康复认证"],
            "rating": 4.9,
            "review_count": 156,
            "booking_count": 892,
            "completed_count": 876,
            "base_price": 399,
            "is_verified": True,
            "is_featured": True,
            "avatar": "https://lh3.googleusercontent.com/aida-public/AB6AXuA0T29ZrA7bEcHbudOL3ZXKi2o9VNV5xVgkv0Rj6ur7MS_SUm6dzTL9CmWw-iz5xikRDwfWwARSKP5I8pt6iLU7HmkRPb3ThKbsxU3m_7c9KIas4lDdEmf1bfgb5PYPqG1X16kZPViGkT6zYY6mSHqq_C5PrLVUDr5tWY2jEofmJIPI-z_c_mO6nuhXsCJSfsHPKDRo0vc2zwsSiEfnf-vXTJpiSsBIcPspPEwRCpkfXyH5-11KAQhsmyRe2uvxQStzcoaZTE8iIBTe"
        },
        {
            "user_id": therapist_users[1].id,
            "name": "Dr. Chloe Bennett",
            "title": "瑞典式按摩专家",
            "about": "Dr. Bennett 专注于瑞典式放松按摩，擅长帮助客户缓解工作压力和改善睡眠质量。温柔细腻的手法深受客户喜爱。",
            "experience_years": 5,
            "specialties": ["瑞典式", "芳香疗法", "头部按摩"],
            "certifications": ["瑞典按摩认证", "芳香疗法认证"],
            "rating": 4.8,
            "review_count": 98,
            "booking_count": 534,
            "completed_count": 520,
            "base_price": 299,
            "is_verified": True,
            "is_featured": True,
            "avatar": "https://lh3.googleusercontent.com/aida-public/AB6AXuDCVGOh5pbfvG6-wpp4Sl5An4Hd8xafpucG2tnv7eGKE1Ndvtu_OYReDHKh0gjcdpKZ-N8J_qaqvRlUtihGQckpKvf1uvDZjPCTPHiGxgL0GvkBZtUcGf_-CLoVqPOe04lnOwNSpL88Ha45QTq5qHd367vYgc_cW068EsH7BBJPwhClsD0I_1d7l-SyNH7ihjiKODrwwhvpl0mdpQVIRLSaJZbWx0Pt0IjFm5TR-cu1eUMonqtE60QdRxibZIK7RxIxbofCubZVKtVB"
        },
        {
            "user_id": therapist_users[2].id,
            "name": "Dr. Olivia Chen",
            "title": "芳香疗法师",
            "about": "Dr. Chen 是认证芳香疗法师，精通各类精油的调配和使用。她的按摩结合了东西方技法，为客户带来身心灵的全面放松。",
            "experience_years": 6,
            "specialties": ["芳香疗法", "热石按摩", "中式推拿"],
            "certifications": ["国际芳香疗法认证", "中医推拿证书"],
            "rating": 4.7,
            "review_count": 87,
            "booking_count": 423,
            "completed_count": 415,
            "base_price": 349,
            "is_verified": True,
            "is_featured": True,
            "avatar": "https://lh3.googleusercontent.com/aida-public/AB6AXuAmRsUpwIyeLFwYz01_XMlGZV5K98SLqskwCH_juV01quoVXmYnaX8ipbgZFxcFylLMFWs7DAw3W2IMdKeirH0lMN5VU8k7KBED8mE2yFGz7YssX3bcKqH3K9GyRYDwJQ5ATOdy1pPow3Qj_oSh5bwolqA6RQXIE9szV5iS5eoWGPXHO2lgNBvMXUIVEGodosrMm3laFbWN-CfESN0FhAkCoLbEycqVXlOHue89W6vddLR9feTDz1tvaT20hbhdiaQEh3H5q0KNmTU-"
        },
        {
            "user_id": therapist_users[3].id,
            "name": "Dr. Emily Rose",
            "title": "孕妇按摩专家",
            "about": "Dr. Rose 专注于孕妇按摩和产后康复，拥有丰富的经验帮助准妈妈们度过舒适的孕期。她的温柔手法和专业知识让每位客户感到安心。",
            "experience_years": 7,
            "specialties": ["孕妇按摩", "产后康复", "淋巴引流"],
            "certifications": ["孕妇按摩专业认证", "产后康复认证"],
            "rating": 4.9,
            "review_count": 134,
            "booking_count": 678,
            "completed_count": 670,
            "base_price": 359,
            "is_verified": True,
            "is_featured": False,
            "avatar": "https://lh3.googleusercontent.com/aida-public/AB6AXuCaz9b68I9tUVY0H9JRYIs0wwQIKtHSG9ElHdXufwMp3Xt6fGWC5KHbYlKUFq96FJyDvDBIOX1Lmr9ipt0GIU99_ZQd4y6o8IEPCyo2E5PKFodBKKLodC4dpPlPbOEqS0NEn2J6z7U8JXMnJnsPn9RiJSk--3aNbQB9KMim5wrEPpCIF6xg7AYGgpHTjGusJ74svyaNLUDX6PuNPwH6XugK1ZbZCIzX2XVHreA-wVTrufk7jPL2DWkJW5grzS2eA7pE5ZG9e8qhqpgM"
        }
    ]
    
    therapists = []
    for data in therapists_data:
        therapist = Therapist(**data)
        session.add(therapist)
        therapists.append(therapist)
    
    await session.flush()
    print(f"✅ 创建了 {len(therapists)} 个治疗师")
    
    return therapists


async def seed_therapist_services(session):
    """关联治疗师和服务"""
    # 获取所有治疗师和服务
    therapists_result = await session.execute(select(Therapist))
    therapists = list(therapists_result.scalars())
    
    services_result = await session.execute(select(Service))
    services = list(services_result.scalars())
    
    # 每个治疗师关联部分服务
    associations = [
        # 治疗师1: 深层组织、瑞典式
        (therapists[0].id, services[1].id, 399),  # Deep Tissue
        (therapists[0].id, services[0].id, 299),  # Swedish
        # 治疗师2: 瑞典式、芳香
        (therapists[1].id, services[0].id, 289),  # Swedish (自定义价格)
        (therapists[1].id, services[4].id, 339),  # Aromatherapy
        # 治疗师3: 芳香、热石
        (therapists[2].id, services[4].id, 349),  # Aromatherapy
        (therapists[2].id, services[3].id, 459),  # Hot Stone
        # 治疗师4: 孕妇按摩、瑞典式
        (therapists[3].id, services[2].id, 359),  # Prenatal
        (therapists[3].id, services[0].id, 299),  # Swedish
    ]
    
    for therapist_id, service_id, price in associations:
        ts = TherapistService(
            therapist_id=therapist_id,
            service_id=service_id,
            price=price
        )
        session.add(ts)
    
    await session.flush()
    print(f"✅ 创建了 {len(associations)} 个治疗师-服务关联")


async def seed_time_slots(session):
    """创建治疗师时段"""
    therapists_result = await session.execute(select(Therapist))
    therapists = list(therapists_result.scalars())
    
    # 为每个治疗师创建未来 14 天的时段
    today = date.today()
    time_slots_data = [
        time(9, 0), time(10, 0), time(11, 0),
        time(14, 0), time(15, 0), time(16, 0), time(17, 0), time(18, 0)
    ]
    
    count = 0
    for therapist in therapists:
        for day_offset in range(14):
            slot_date = today + timedelta(days=day_offset)
            
            # 周末减少时段
            slots = time_slots_data if slot_date.weekday() < 5 else time_slots_data[2:6]
            
            for start in slots:
                end = (datetime.combine(date.today(), start) + timedelta(hours=1)).time()
                slot = TherapistTimeSlot(
                    therapist_id=therapist.id,
                    date=slot_date,
                    start_time=start,
                    end_time=end,
                    is_available=True,
                    is_booked=False
                )
                session.add(slot)
                count += 1
    
    await session.flush()
    print(f"✅ 创建了 {count} 个时段")


async def seed_test_user(session):
    """创建测试用户"""
    # 检查是否已存在
    result = await session.execute(
        select(User).where(User.phone == "13800138000")
    )
    if result.scalar_one_or_none():
        print("⏭️ 测试用户已存在，跳过")
        return
    
    user = User(
        phone="13800138000",
        nickname="测试用户",
        email="test@landa.com",
        avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuBpwmTI3GlyifkuLY0usAFg5SIl6kmnDmwg8HfaNjb-Y8GMjG4vgyBGHhBwipITNrq-fG5zaG23-svprnZetd3hDYAC4NejNA3Gbe3kd4lYKOnedj9MmaA7ZcRLbb9bDUEPgCIsjWS1-w-5auBQOnCVnSKqE4IpAT98l4Pz5PQERw3wsATuBKBH3wpRh1sLOmDZYZExHhOne0_apE16vqBVVkG9WDenjTLnWn-bUe8jDxGgyEqs73SBEKKDP9v9IrU1qvy0Y-dlcSO2",
        member_level=MemberLevel.GOLD,
        points=1500,
        is_verified=True
    )
    session.add(user)
    await session.flush()
    
    # 添加测试地址
    addresses = [
        {
            "user_id": user.id,
            "label": "Home",
            "contact_name": "张三",
            "contact_phone": "13800138000",
            "province": "上海市",
            "city": "上海市",
            "district": "浦东新区",
            "street": "陆家嘴环路1000号",
            "detail": "上海中心大厦88层",
            "is_default": True
        },
        {
            "user_id": user.id,
            "label": "Work",
            "contact_name": "张三",
            "contact_phone": "13800138000",
            "province": "上海市",
            "city": "上海市",
            "district": "静安区",
            "street": "南京西路1266号",
            "detail": "恒隆广场25层",
            "is_default": False
        }
    ]
    
    for addr_data in addresses:
        address = Address(**addr_data)
        session.add(address)
    
    await session.flush()
    print(f"✅ 创建测试用户: {user.phone}")


async def main():
    """主函数"""
    print("🚀 开始初始化测试数据...")
    print("-" * 50)
    
    # 初始化数据库表
    await init_db()
    print("✅ 数据库表已创建")
    
    async with AsyncSessionLocal() as session:
        try:
            # 检查是否已有数据
            result = await session.execute(select(ServiceCategory))
            if result.scalars().first():
                print("⚠️ 数据库已有数据，跳过初始化")
                print("如需重新初始化，请先清空数据库")
                return
            
            # 按顺序创建数据
            await seed_service_categories(session)
            await seed_services(session)
            await seed_therapists(session)
            await seed_therapist_services(session)
            await seed_time_slots(session)
            await seed_test_user(session)
            
            await session.commit()
            print("-" * 50)
            print("🎉 测试数据初始化完成!")
            print()
            print("测试账号: 13800138000")
            print("验证码: 888888 (开发模式万能验证码)")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ 初始化失败: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())

