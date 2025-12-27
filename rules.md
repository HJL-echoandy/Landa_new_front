# 开发规范 (Development Rules)

## 📋 核心原则

### 1. 数据模型优先 (Model First) - **最重要！**
在开发任何功能前，**必须先检查后端模型定义**：

```bash
# 检查顺序（严格执行）
1. backend/app/models/       # SQLAlchemy 模型（数据库表结构）
   ├─ 查看表的所有字段名
   ├─ 确认字段类型（int/str/float/Optional等）
   ├─ 确认枚举类型的合法值
   └─ 注意关联关系

2. backend/app/schemas/      # Pydantic 模型（API 输入输出）
   ├─ 查看 API 响应的字段名
   └─ 确认返回值结构

3. backend/app/api/v1/       # API 端点和响应格式
   ├─ 查看如何组装响应数据
   └─ 学习字段映射方式

4. therapist/src/types/      # 前端 TypeScript 类型定义
   └─ 严格匹配后端 schema
```

**禁止猜测字段名！** 必须使用模型中定义的确切字段名。

**必读文档**: `backend/DATABASE_FIELD_STANDARDS.md` - 完整的数据模型和字段规范

### 2. 类型一致性 (Type Consistency)
前端类型必须与后端 API 响应完全匹配：

- ✅ **正确**: 从后端模型复制字段定义
- ❌ **错误**: 自己编造字段名或类型

参考文档：`FIELD_MAPPING.md`

### 3. 动态数据 (Dynamic Data)
- ✅ **正确**: 从 Redux/API 读取数据
- ❌ **错误**: 硬编码 mock 数据

### 4. 枚举类型 (Enums) - **必须检查！**
使用枚举时必须检查实际定义：

```python
# backend/app/models/user.py
class UserRole(str, enum.Enum):
    USER = "user"          # ✅ 正确
    THERAPIST = "therapist"
    ADMIN = "admin"
    # CUSTOMER = "customer"  # ❌ 不存在！

# backend/app/models/booking.py
class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    EN_ROUTE = "en_route"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
```

### 5. 字段命名统一性 (Naming Consistency) - **新增！**

#### 标准字段命名模式：

**主键**: 统一使用 `id`
```python
id: int                   # ✅ 所有表
```

**外键**: `{表单数}_id`
```python
user_id: int              # ✅ 关联 users 表
therapist_id: int         # ✅ 关联 therapists 表
service_id: int           # ✅ 关联 services 表
```

**时间戳**: 统一使用 `_at` 后缀
```python
created_at: datetime      # ✅ 创建时间
updated_at: datetime      # ✅ 更新时间
cancelled_at: datetime    # ✅ 取消时间
therapist_arrived_at: datetime    # ✅ 技师到达时间
```

**布尔标志**: 使用 `is_` 或 `has_` 前缀
```python
is_active: bool           # ✅ 是否激活
is_verified: bool         # ✅ 是否验证
is_default: bool          # ✅ 是否默认
```

**计数器**: 使用 `_count` 后缀
```python
review_count: int         # ✅ 评论数
booking_count: int        # ✅ 预约数
completed_count: int      # ✅ 完成数
```

**金额**: 使用 `_price` 或 `_amount`
```python
base_price: float         # ✅ 基础价格
total_price: float        # ✅ 总价
discount_amount: float    # ✅ 折扣金额
```

## 🔍 常见陷阱与错误案例

### 陷阱 1: Address 表字段错误 ⚠️

```python
# ❌ 错误示例 1 - 使用不存在的 full_address
address_detail = address.full_address  # AttributeError!

# ✅ 正确示例 - 手动组合完整地址
full_address = f"{address.province}{address.city}{address.district}{address.street}"
if address.detail:
    full_address += f" {address.detail}"
address_detail = full_address

# ❌ 错误示例 2 - phone vs contact_phone
address = Address(
    phone="13800138000"  # TypeError: 'phone' is an invalid keyword!
)

# ✅ 正确示例 - Address 使用 contact_phone
address = Address(
    contact_phone="13800138000",  # ✅ 正确字段名
    contact_name="张三"            # ✅ 联系人姓名
)
```

**重要区别**:
- `User` 表: `phone` (用户本人电话)
- `Address` 表: `contact_phone` (收货/服务地址联系电话，可能不是用户本人)

### 陷阱 2: 枚举值错误

```python
# ❌ 错误
user = User(role=UserRole.CUSTOMER)  # AttributeError: CUSTOMER

# ✅ 正确（先检查枚举定义）
user = User(role=UserRole.USER)  # USER 才是正确的值
```

### 陷阱 3: 前端类型不匹配

```typescript
// ❌ 错误：自己编造字段
interface TherapistProfile {
  full_name: string;  // 后端没有这个字段！
  avatar_url: string; // 应该是 avatar，不是 avatar_url！
  is_online: boolean; // 应该是 is_active!
}

// ✅ 正确：从后端 TherapistInfo schema 复制
interface TherapistProfile {
  name: string;       // ✅ 后端有
  avatar: string;     // ✅ 后端有
  is_active: boolean; // ✅ 后端有
}
```

### 陷阱 4: User vs Therapist 字段混淆

```python
# ❌ 错误 - User 表没有 name 字段
user = await db.get(User, user_id)
display_name = user.name  # AttributeError!

# ✅ 正确 - User 用 nickname，Therapist 用 name
user = await db.get(User, user_id)
display_name = user.nickname or "用户"  # ✅

therapist = await db.get(Therapist, therapist_id)
display_name = therapist.name  # ✅
```

### 陷阱 5: 时间字段格式化遗漏

```python
# ❌ 错误 - 直接返回 time 对象
start_time=booking.start_time,  # 前端收到: { _type: 'time' }

# ✅ 正确 - 格式化为字符串
start_time=booking.start_time.strftime("%H:%M"),  # "14:30"
```

## 📝 开发工作流

### 新功能开发流程（严格执行）

```bash
步骤 1: 查看后端模型（⏱️ 5-10分钟）
  └─> backend/app/models/[模型名].py
      检查清单:
      □ 表结构和字段名（不要猜！）
      □ 字段类型（int/str/float/Optional/List等）
      □ 枚举类型的所有合法值
      □ 外键关联关系
      □ 必填字段 vs 可选字段
      □ 默认值
      
      💡 技巧: 复制粘贴字段名，不要手打！

步骤 2: 查看后端 Schema（⏱️ 3-5分钟）
  └─> backend/app/schemas/[模型名].py
      检查清单:
      □ API 输入输出格式
      □ Response 模型的字段列表
      □ 字段是否与数据库模型一致
      □ 有无额外的计算字段

步骤 3: 查看 API 端点（⏱️ 5-10分钟）
  └─> backend/app/api/v1/[功能名].py
      检查清单:
      □ 响应格式和字段映射方式
      □ 如何关联查询多个表
      □ 如何组合/格式化字段
      □ 状态码和错误处理
      □ 分页、筛选、排序逻辑

步骤 4: 定义前端类型（⏱️ 3-5分钟）
  └─> therapist/src/types/[模型名].ts
      检查清单:
      □ 严格匹配后端 schema 的字段名
      □ 类型正确映射（number/string/boolean）
      □ 可选字段添加 ?
      □ 数组类型正确标注
      □ 枚举类型使用 union types

步骤 5: 实现功能（⏱️ 按需）
  └─> 使用 Redux + API 调用
      检查清单:
      □ 禁止硬编码数据
      □ 使用定义好的类型
      □ 错误处理完整
      □ Loading 状态管理

步骤 6: 测试验证（⏱️ 5-10分钟）
  └─> 运行并验证
      检查清单:
      □ Linter 无错误
      □ TypeScript 编译通过
      □ API 调用成功
      □ 数据显示正确
      □ 边界情况测试
```

**总耗时**: 约 25-40 分钟（但能避免数小时的调试！）

### 编写脚本/测试数据流程

```bash
步骤 1: 阅读所有相关模型定义（⏱️ 10-15分钟）
  └─> 列出需要用到的所有表
      □ User
      □ Address  
      □ Therapist
      □ Service
      □ Booking
      □ ...

步骤 2: 逐个检查模型字段（⏱️ 15-20分钟）
  └─> 为每个模型创建字段清单
      □ 必填字段（不能为 None）
      □ 可选字段（Optional）
      □ 有默认值的字段
      □ 外键关联
      □ 唯一约束
      
      💡 创建一个检查表格:
      | 字段名 | 类型 | 必填 | 默认值 | 说明 |
      |--------|------|------|--------|------|
      | phone  | str  | ✓    | -      | 手机号 |

步骤 3: 检查枚举类型（⏱️ 2-3分钟）
  └─> 确认所有枚举的合法值
      □ UserRole: USER, THERAPIST, ADMIN
      □ BookingStatus: PENDING, CONFIRMED, ...
      □ MemberLevel: BRONZE, SILVER, GOLD, PLATINUM

步骤 4: 编写代码（⏱️ 按需）
  └─> 使用模型中定义的确切字段名
      □ 从检查清单复制字段名
      □ 不要手打字段名
      □ 使用 IDE 自动补全
      □ 添加类型注解

步骤 5: 测试验证（⏱️ 5-10分钟）
  └─> 运行脚本，查看错误信息
      □ 如果有 TypeError/AttributeError → 回到步骤 2
      □ 检查数据库记录是否正确创建
      □ 验证关联关系
      □ 验证数据完整性
```

**总耗时**: 约 35-50 分钟（但确保数据质量！）

### API 字段组装规则（新增！）

#### 规则 1: 直接映射
如果数据库字段可以直接使用：
```python
# ✅ 直接映射
booking_no=booking.booking_no,
total_price=booking.total_price,
status=booking.status,
user_note=booking.user_note,
```

#### 规则 2: 关联查询
需要从其他表获取数据：
```python
# 1. 先查询关联表
user = await db.execute(select(User).where(User.id == booking.user_id))
user = user.scalar_one()

service = await db.execute(select(Service).where(Service.id == booking.service_id))
service = service.scalar_one()

# 2. 使用关联表字段（添加前缀以区分）
customer_name=user.nickname or "客户",  # customer_ 前缀表示来自用户
customer_phone=user.phone,
service_name=service.name,              # service_ 前缀表示来自服务
service_duration=booking.duration,      # 虽然存在 booking，但属于服务概念
```

#### 规则 3: 字段组合
需要组合多个字段：
```python
# ✅ 先组合，再使用
address = await db.execute(select(Address).where(Address.id == booking.address_id))
address = address.scalar_one()

# 组合完整地址
full_address = f"{address.province}{address.city}{address.district}{address.street}"
if address.detail:
    full_address += f" {address.detail}"

# 使用组合后的值
address_detail=full_address,
address_contact=address.contact_name,
address_phone=address.contact_phone,  # ⚠️ 注意：不是 phone！
```

#### 规则 4: 格式化转换
时间、日期等需要格式化：
```python
# ✅ 格式化时间
start_time=booking.start_time.strftime("%H:%M"),  # time → "14:30"
end_time=booking.end_time.strftime("%H:%M"),

# ✅ 格式化日期
booking_date=booking.booking_date.isoformat(),    # date → "2024-12-25"

# ✅ 格式化日期时间
created_at=booking.created_at.isoformat(),        # datetime → "2024-12-25T14:30:00"
```

#### 规则 5: 添加注释标注来源
```python
# ✅ 良好实践：注释标注数据来源
return TherapistOrderListItem(
    # 订单基础信息（from Booking）
    id=booking.id,
    booking_no=booking.booking_no,
    status=booking.status,
    
    # 客户信息（from User via booking.user_id）
    customer_name=user.nickname or "客户",
    customer_phone=user.phone,
    customer_avatar=user.avatar,
    
    # 服务信息（from Service via booking.service_id）
    service_id=service.id,
    service_name=service.name,
    service_duration=booking.duration,
    
    # 地址信息（from Address via booking.address_id - 需组合）
    address_detail=full_address,
    address_contact=address.contact_name,
    address_phone=address.contact_phone,  # ⚠️ 不是 phone
    
    # 价格信息（from Booking）
    service_price=booking.service_price,
    total_price=booking.total_price,
    
    # 时间信息（from Booking - 需格式化）
    booking_date=booking.booking_date,
    start_time=booking.start_time.strftime("%H:%M"),
    end_time=booking.end_time.strftime("%H:%M"),
)
```

## 🛠️ 调试技巧

### 遇到字段错误时

```bash
# 1. 错误信息示例
TypeError: 'phone' is an invalid keyword argument for Address

# 2. 立即检查模型定义
cat backend/app/models/user.py | grep -A 20 "class Address"

# 3. 找到正确的字段名
# 发现是 contact_phone，不是 phone

# 4. 修复代码
```

### 遇到枚举错误时

```bash
# 1. 错误信息示例
AttributeError: CUSTOMER

# 2. 检查枚举定义
cat backend/app/models/user.py | grep -A 10 "class UserRole"

# 3. 查看合法值
# USER, THERAPIST, ADMIN（没有 CUSTOMER）

# 4. 使用正确的值
```

## 📚 必读文档（按优先级）

### 🔴 必读（开发前必看）
1. **`backend/DATABASE_FIELD_STANDARDS.md`** - 完整的数据模型和字段规范
   - 所有表的字段列表
   - 字段命名标准
   - 常见错误案例
   - API 字段组装规则

2. **`rules.md`** (本文档) - 开发规范总纲
   - 核心原则
   - 工作流程
   - 常见陷阱

3. **`backend/app/models/`** - 数据库模型定义（源头！）
   - `user.py` - 用户和地址模型
   - `therapist.py` - 技师模型
   - `service.py` - 服务模型
   - `booking.py` - 预约/订单模型
   - `order.py` - 支付订单模型
   - `review.py` - 评论模型

### 🟡 建议阅读（开发中参考）
4. **`FIELD_MAPPING.md`** - 前后端字段映射
5. **`backend/app/schemas/`** - API Schema 定义
6. **`backend/FIELD_ERRORS_FIXED.md`** - 已修复的字段错误案例
7. **`therapist/FIELD_MAPPING.md`** - 技师端字段映射

### 🟢 可选阅读（深入学习）
8. **项目 README 文档**
9. **API 文档（FastAPI 自动生成）**

## ⚠️ 黄金规则（必须遵守！）

### 🥇 规则 1: 永远不要猜测字段名
```python
# ❌ 错误思维
"这个表应该有 full_address 字段吧？"
"phone 和 contact_phone 应该一样吧？"
"User 和 Therapist 都有 name 字段吧？"

# ✅ 正确思维
"让我打开模型文件确认一下..."
"让我查看 Address 类的定义..."
"让我对比 User 和 Therapist 的字段..."
```

### 🥈 规则 2: 永远先看模型定义
```bash
# ❌ 错误流程
写代码 → 运行 → 报错 → 查模型 → 修复 → 再运行

# ✅ 正确流程
查模型 → 写代码 → 运行 → ✓ 成功！

# 时间对比
错误流程: 30分钟写代码 + 2小时调试 = 2.5小时
正确流程: 10分钟查模型 + 30分钟写代码 + 5分钟测试 = 45分钟

省下 1.75 小时！！！
```

### 🥉 规则 3: 遵循后端定义的准确名称
```python
# ❌ 错误 - 使用自己喜欢的名字
user_full_name = user.name          # User 没有 name
therapist_phone_number = therapist.phone  # Therapist 没有 phone

# ✅ 正确 - 使用后端定义的名字
user_display_name = user.nickname   # User 有 nickname
therapist_name = therapist.name     # Therapist 有 name
therapist_phone = user.phone        # 通过 therapist.user_id 关联到 user.phone
```

### 🏅 规则 4: 类型必须完全匹配
```typescript
// ❌ 错误 - 类型不匹配
interface Order {
  id: string;           // 后端是 int，前端不能用 string！
  total_price: string;  // 后端是 float，前端应该用 number！
  is_active: number;    // 后端是 bool，前端不能用 number！
}

// ✅ 正确 - 严格匹配
interface Order {
  id: number;           // ✓ 匹配后端 int
  total_price: number;  // ✓ 匹配后端 float
  is_active: boolean;   // ✓ 匹配后端 bool
}
```

### 🎖️ 规则 5: 禁止硬编码数据
```typescript
// ❌ 错误 - 硬编码
const ProfileScreen = () => {
  const userName = "Alice Chen";  // 写死的数据
  const userAvatar = "https://...";
  
  return <Text>{userName}</Text>;
};

// ✅ 正确 - 从 Redux 读取
const ProfileScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return <Text>{user?.name || user?.nickname || '用户'}</Text>;
};
```

## 🎯 快速检查清单（开发前）

复制此清单，每次开发新功能前检查：

```
□ 已查看所有相关的后端模型文件
□ 已记录所有需要使用的字段名和类型
□ 已确认字段是否需要关联查询
□ 已确认字段是否需要组合/格式化
□ 已检查所有枚举类型的合法值
□ 已确认可选字段（Optional）的处理方式
□ 已定义前端 TypeScript 类型
□ 前端类型已与后端 schema 严格匹配
□ 已添加适当的注释标注数据来源
□ 已阅读相关的错误案例文档
```

全部打勾 ✓ 后再开始编码！

## 💡 效率提升技巧

### 技巧 1: 使用模板代码
保存常用的代码模板，快速复用：

```python
# 模板：API 字段组装
def build_order_response(booking, user, service, address):
    """组装订单响应数据"""
    # 组合完整地址
    full_address = f"{address.province}{address.city}{address.district}{address.street}"
    if address.detail:
        full_address += f" {address.detail}"
    
    return OrderResponse(
        # 基础信息
        id=booking.id,
        booking_no=booking.booking_no,
        
        # 客户信息
        customer_name=user.nickname or "客户",
        customer_phone=user.phone,
        
        # 服务信息
        service_name=service.name,
        
        # 地址信息
        address_detail=full_address,
        address_phone=address.contact_phone,
    )
```

### 技巧 2: 使用辅助函数
创建可复用的辅助函数：

```python
# backend/app/utils/address.py
def build_full_address(address: Address) -> str:
    """组合完整地址"""
    full = f"{address.province}{address.city}{address.district}{address.street}"
    if address.detail:
        full += f" {address.detail}"
    return full

def format_time_string(t: time) -> str:
    """格式化时间"""
    return t.strftime("%H:%M")
```

### 技巧 3: 使用 IDE 功能
- ✅ 自动补全：输入 `address.` 后让 IDE 提示可用字段
- ✅ 跳转定义：Ctrl/Cmd + Click 跳转到模型定义
- ✅ 查找引用：查看字段在哪里被使用
- ✅ 重命名：安全地批量重命名字段

### 技巧 4: 建立字段对照表
在开发复杂功能时，建立一个表格：

| 前端字段 | 后端来源 | 需要处理 | 备注 |
|---------|---------|---------|------|
| customer_name | user.nickname | 默认值 | or "客户" |
| customer_phone | user.phone | 直接映射 | - |
| service_name | service.name | 直接映射 | - |
| address_detail | address.* | 组合 | 省+市+区+街道+详情 |
| address_phone | address.contact_phone | ⚠️ 注意 | 不是 phone！ |
| start_time | booking.start_time | 格式化 | strftime("%H:%M") |

## 🚨 紧急救援（出错时）

### 遇到 AttributeError
```bash
# 错误: AttributeError: 'Address' object has no attribute 'full_address'

# 救援步骤:
1. 打开 backend/app/models/user.py
2. 找到 Address 类
3. 查看所有字段列表
4. 确认 full_address 不存在
5. 查看 DATABASE_FIELD_STANDARDS.md 了解正确做法
6. 修改代码使用正确的字段组合
```

### 遇到 TypeError
```bash
# 错误: TypeError: 'phone' is an invalid keyword argument for Address

# 救援步骤:
1. 打开 backend/app/models/user.py
2. 找到 Address 类的 __init__ 定义
3. 查看接受的参数名
4. 发现应该是 contact_phone 而不是 phone
5. 修改代码使用正确的参数名
```

### 遇到枚举错误
```bash
# 错误: AttributeError: CUSTOMER

# 救援步骤:
1. 打开 backend/app/models/user.py
2. 找到 UserRole 枚举定义
3. 查看所有合法值: USER, THERAPIST, ADMIN
4. 发现没有 CUSTOMER
5. 修改代码使用 USER
```

---

## 🗄️ 数据库迁移规范（新增！）

### ⚠️ 核心原则
**本项目使用 Alembic 进行数据库迁移管理！**

❌ **禁止**:
- 手写独立的数据库迁移脚本
- 直接使用 SQL ALTER TABLE 语句
- 绕过 Alembic 版本控制

✅ **必须**:
- 使用 Alembic 创建迁移文件
- 遵循 Alembic 的 upgrade/downgrade 模式
- 记录每次迁移的目的和变更内容

### 📝 Alembic 迁移流程

#### 1. 修改模型定义
```python
# backend/app/models/therapist.py

# ❌ 错误：直接修改模型后就开始写代码
class Therapist(Base):
    status: Mapped[str] = mapped_column(Enum(TherapistStatus))  # 新增字段

# ✅ 正确：修改模型后立即创建迁移
# 1. 修改模型
# 2. 创建迁移文件
# 3. 检查生成的迁移
# 4. 执行迁移
# 5. 验证迁移结果
```

#### 2. 创建迁移文件
```bash
# 在 Docker 容器中执行
docker exec landa-api alembic revision --autogenerate -m "描述性的迁移名称"

# 示例：
docker exec landa-api alembic revision --autogenerate -m "add_status_enum_to_therapist"
docker exec landa-api alembic revision --autogenerate -m "change_therapist_is_active_to_status_enum"
```

#### 3. 检查并修改迁移文件
```python
# backend/alembic/versions/xxxx_add_status_enum_to_therapist.py

"""add status enum to therapist

Revision ID: xxxx
Revises: yyyy
Create Date: 2024-12-26 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = 'xxxx'
down_revision: Union[str, None] = 'yyyy'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """执行数据库结构升级"""
    # 1. 添加新列（如果需要）
    op.add_column('therapists', sa.Column('status', sa.String(20), nullable=True))
    
    # 2. 迁移数据（将旧字段值转换为新字段值）
    op.execute("""
        UPDATE therapists 
        SET status = CASE 
            WHEN is_active = true THEN 'offline'  -- 默认离线，等待技师主动上线
            ELSE 'offline'
        END
    """)
    
    # 3. 设置 NOT NULL 约束（数据迁移完成后）
    op.alter_column('therapists', 'status', nullable=False)
    
    # 4. 删除旧列（可选，建议分步进行）
    # op.drop_column('therapists', 'is_active')


def downgrade() -> None:
    """执行数据库结构降级（回滚）"""
    # 按照相反顺序恢复
    op.add_column('therapists', sa.Column('is_active', sa.Boolean(), nullable=True))
    
    op.execute("""
        UPDATE therapists 
        SET is_active = CASE 
            WHEN status = 'online' THEN true
            ELSE false
        END
    """)
    
    op.alter_column('therapists', 'is_active', nullable=False)
    op.drop_column('therapists', 'status')
```

#### 4. 执行迁移
```bash
# 查看当前迁移状态
docker exec landa-api alembic current

# 查看待执行的迁移
docker exec landa-api alembic history

# 执行迁移（升级到最新版本）
docker exec landa-api alembic upgrade head

# 回滚一个版本
docker exec landa-api alembic downgrade -1

# 回滚到指定版本
docker exec landa-api alembic downgrade <revision_id>
```

#### 5. 验证迁移结果
```bash
# 进入数据库检查
docker exec -it landa-postgres psql -U postgres -d landa

# 检查表结构
\d therapists

# 检查数据
SELECT id, name, status FROM therapists LIMIT 5;

# 检查迁移版本
SELECT * FROM alembic_version;

# 退出
\q
```

### 🔄 字段变更最佳实践

#### 情况 1: 添加新字段
```python
def upgrade() -> None:
    # 添加可空字段
    op.add_column('therapists', sa.Column('new_field', sa.String(50), nullable=True))
    
    # 设置默认值
    op.execute("UPDATE therapists SET new_field = 'default_value'")
    
    # 改为非空（如果需要）
    op.alter_column('therapists', 'new_field', nullable=False)
```

#### 情况 2: 字段类型变更
```python
def upgrade() -> None:
    # 1. 添加新列
    op.add_column('therapists', sa.Column('status', sa.String(20), nullable=True))
    
    # 2. 迁移数据（从旧字段转换到新字段）
    op.execute("""
        UPDATE therapists 
        SET status = CASE 
            WHEN is_active = true THEN 'online'
            ELSE 'offline'
        END
    """)
    
    # 3. 设置非空约束
    op.alter_column('therapists', 'status', nullable=False)
    
    # 4. 删除旧列（分步进行更安全）
    # 第一次迁移：添加新列 + 迁移数据
    # 第二次迁移：删除旧列（确认新列工作正常后）
    # op.drop_column('therapists', 'is_active')
```

#### 情况 3: 字段重命名
```python
def upgrade() -> None:
    # PostgreSQL 支持直接重命名
    op.alter_column('therapists', 'old_name', new_column_name='new_name')
```

#### 情况 4: 删除字段
```python
def upgrade() -> None:
    # ⚠️ 危险操作！确保数据已备份
    # 建议先标记为 nullable，运行一段时间确认无问题后再删除
    
    # 第一步：标记为可空（可选）
    # op.alter_column('therapists', 'old_field', nullable=True)
    
    # 第二步：删除列
    op.drop_column('therapists', 'old_field')
```

### 📋 迁移检查清单

创建迁移前：
```
□ 已修改 backend/app/models/ 中的模型定义
□ 已更新对应的 backend/app/schemas/ Schema
□ 已确认字段类型和约束
□ 已规划数据迁移策略（如果需要）
```

创建迁移后：
```
□ 检查生成的迁移文件内容
□ 确认 upgrade() 逻辑正确
□ 确认 downgrade() 可以回滚
□ 添加必要的数据迁移 SQL
□ 测试迁移在开发环境执行成功
```

执行迁移后：
```
□ 验证表结构正确
□ 验证数据完整性
□ 运行应用测试
□ 更新相关文档
□ 提交迁移文件到版本控制
```

### ⚠️ 常见迁移陷阱

#### 陷阱 1: 忘记处理现有数据
```python
# ❌ 错误：直接添加非空字段
def upgrade() -> None:
    op.add_column('therapists', sa.Column('status', sa.String(20), nullable=False))
    # 如果表中已有数据，会失败！

# ✅ 正确：先可空，迁移数据，再非空
def upgrade() -> None:
    op.add_column('therapists', sa.Column('status', sa.String(20), nullable=True))
    op.execute("UPDATE therapists SET status = 'offline'")
    op.alter_column('therapists', 'status', nullable=False)
```

#### 陷阱 2: 没有 downgrade
```python
# ❌ 错误：空的 downgrade
def downgrade() -> None:
    pass

# ✅ 正确：完整的回滚逻辑
def downgrade() -> None:
    op.add_column('therapists', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.drop_column('therapists', 'status')
```

#### 陷阱 3: 一次性删除旧字段
```python
# ❌ 风险：万一新字段有问题，数据已丢失
def upgrade() -> None:
    op.add_column('therapists', sa.Column('status', sa.String(20)))
    op.execute("UPDATE therapists SET status = ...")
    op.drop_column('therapists', 'is_active')  # 立即删除！

# ✅ 安全：分两次迁移
# 第一次迁移: xxxx_add_status_field.py
def upgrade() -> None:
    op.add_column('therapists', sa.Column('status', sa.String(20)))
    op.execute("UPDATE therapists SET status = ...")
    # 保留 is_active，运行一段时间验证

# 第二次迁移: yyyy_remove_is_active_field.py (几天后)
def upgrade() -> None:
    op.drop_column('therapists', 'is_active')  # 确认无问题后删除
```

#### 陷阱 4: 枚举类型迁移（PostgreSQL）
```python
# ❌ 错误：直接使用 Enum
def upgrade() -> None:
    # PostgreSQL 的 ENUM 类型比较特殊
    therapist_status = sa.Enum('online', 'busy', 'offline', name='therapiststatus')
    op.add_column('therapists', sa.Column('status', therapist_status))

# ✅ 正确：使用 VARCHAR + CHECK 约束
def upgrade() -> None:
    op.add_column('therapists', sa.Column('status', sa.String(20)))
    op.create_check_constraint(
        'therapists_status_check',
        'therapists',
        "status IN ('online', 'busy', 'offline')"
    )
```

### 🛠️ 实战案例：技师状态字段迁移

**背景**: 将 `is_active: bool` 改为 `status: Enum['online', 'busy', 'offline']`

**完整步骤**:

```bash
# 1. 修改模型文件
# backend/app/models/therapist.py
# 添加 TherapistStatus 枚举
# 修改字段定义

# 2. 创建迁移
docker exec landa-api alembic revision --autogenerate -m "change_therapist_is_active_to_status_enum"

# 3. 编辑迁移文件
# backend/alembic/versions/xxxx_change_therapist_is_active_to_status_enum.py

# 4. 执行迁移
docker exec landa-api alembic upgrade head

# 5. 验证结果
docker exec -it landa-postgres psql -U postgres -d landa -c "\d therapists"
docker exec -it landa-postgres psql -U postgres -d landa -c "SELECT status, COUNT(*) FROM therapists GROUP BY status"

# 6. 重启服务
docker-compose restart api

# 7. 测试应用
# - 技师登录
# - 状态切换
# - API 响应验证
```

### 📚 Alembic 常用命令

```bash
# 查看当前版本
docker exec landa-api alembic current

# 查看迁移历史
docker exec landa-api alembic history

# 查看待执行的迁移
docker exec landa-api alembic history --verbose

# 升级到最新版本
docker exec landa-api alembic upgrade head

# 升级到指定版本
docker exec landa-api alembic upgrade <revision_id>

# 降级一个版本
docker exec landa-api alembic downgrade -1

# 降级到指定版本
docker exec landa-api alembic downgrade <revision_id>

# 查看 SQL（不执行）
docker exec landa-api alembic upgrade head --sql

# 查看当前与目标的差异
docker exec landa-api alembic upgrade head --sql > migration.sql
```

### 🔐 安全备份流程

迁移前必须备份：

```bash
# 1. 备份整个数据库
docker exec landa-postgres pg_dump -U postgres landa > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 只备份特定表
docker exec landa-postgres pg_dump -U postgres -t therapists landa > therapists_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. 恢复备份（如果需要）
docker exec -i landa-postgres psql -U postgres landa < backup_20241226_100000.sql
```

---

## 🎨 前端 UI 组件规范（新增！）

### ⚠️ 核心原则
**使用 UI 库的组件，而非系统原生组件！**

❌ **禁止**:
- 使用系统原生 `Alert` 弹窗
- 使用系统原生 `confirm` 对话框
- 自己手写样式来实现通用组件

✅ **必须**:
- 使用 `react-native-paper` 的 Material Design 组件
- 保持 UI 风格统一
- 提供更好的用户体验

### 📱 React Native 提示组件对比

#### ❌ 错误示例：使用系统 Alert

```typescript
// ❌ 不好：使用系统原生 Alert
import { Alert } from 'react-native';

const handleSuccess = () => {
  Alert.alert('成功', '操作成功！');  // 样式丑陋，无法自定义
};

const handleError = () => {
  Alert.alert('错误', '操作失败，请重试');  // 不符合应用设计风格
};
```

**问题**：
- ❌ 样式丑陋，无法自定义
- ❌ 与应用整体设计风格不符
- ❌ 用户体验差（需要手动关闭）
- ❌ 在 iOS 和 Android 上表现不一致

#### ✅ 正确示例：使用 Material Design Snackbar

```typescript
// ✅ 好：使用 react-native-paper 的 Snackbar
import { Snackbar } from 'react-native-paper';

export default function MyScreen() {
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  // 显示提示
  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  // 隐藏提示
  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  const handleSuccess = async () => {
    try {
      await someApiCall();
      showSnackbar('操作成功！', 'success');  // ✅ 美观、简洁
    } catch (error) {
      showSnackbar('操作失败，请重试', 'error');  // ✅ 一致的错误提示
    }
  };

  return (
    <View>
      {/* 你的页面内容 */}
      
      {/* ✅ Snackbar 组件 */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={3000}  // 3秒后自动关闭
        action={{
          label: '确定',
          onPress: hideSnackbar,
        }}
        style={{
          backgroundColor: 
            snackbar.type === 'success' ? '#22C55E' :  // 绿色
            snackbar.type === 'error' ? '#EF4444' :    // 红色
            '#3B82F6',  // 蓝色（info）
        }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}
```

**优势**：
- ✅ Material Design 风格，美观现代
- ✅ 自动关闭，用户体验好
- ✅ 可自定义颜色、位置、持续时间
- ✅ 跨平台一致性好
- ✅ 不打断用户操作流程

### 📚 常用 UI 组件推荐

#### 1. 提示消息 (Toast/Snackbar)

```typescript
// ✅ 使用 react-native-paper 的 Snackbar
import { Snackbar } from 'react-native-paper';

// 成功提示
showSnackbar('保存成功', 'success');

// 错误提示
showSnackbar('网络错误，请重试', 'error');

// 信息提示
showSnackbar('数据已同步', 'info');
```

#### 2. 对话框 (Dialog)

```typescript
// ✅ 使用 react-native-paper 的 Dialog
import { Portal, Dialog, Button } from 'react-native-paper';

<Portal>
  <Dialog visible={visible} onDismiss={hideDialog}>
    <Dialog.Title>确认删除</Dialog.Title>
    <Dialog.Content>
      <Text>确定要删除这条记录吗？</Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={hideDialog}>取消</Button>
      <Button onPress={handleConfirm}>确定</Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
```

#### 3. 底部弹出菜单 (Bottom Sheet)

```typescript
// ✅ 使用 @gorhom/bottom-sheet
import BottomSheet from '@gorhom/bottom-sheet';

<BottomSheet
  snapPoints={['25%', '50%', '75%']}
  onChange={handleSheetChanges}
>
  {/* 底部菜单内容 */}
</BottomSheet>
```

#### 4. 加载指示器 (Loading)

```typescript
// ✅ 使用 react-native-paper 的 ActivityIndicator
import { ActivityIndicator } from 'react-native-paper';

<ActivityIndicator 
  animating={true} 
  color="#FFE600" 
  size="large" 
/>
```

### 🎯 UI 组件选择指南

| 场景 | ❌ 避免使用 | ✅ 推荐使用 |
|------|-----------|-----------|
| 成功/错误提示 | `Alert.alert()` | `Snackbar` |
| 确认对话框 | `Alert.alert()` | `Dialog` |
| 输入表单 | 原生 `TextInput` | `TextInput` (Paper) |
| 按钮 | 原生 `Button` | `Button` (Paper) |
| 列表 | 原生 `FlatList` + 自定义样式 | `FlatList` + Paper 组件 |
| 开关 | 原生 `Switch` | `Switch` (Paper) |
| 复选框 | 自己实现 | `Checkbox` (Paper) |
| 单选框 | 自己实现 | `RadioButton` (Paper) |

### 📋 UI 组件使用检查清单

开发新功能前：
```
□ 确认需要的提示/交互类型
□ 查看 react-native-paper 文档
□ 选择合适的 Material Design 组件
□ 定义组件状态（visible, message, type 等）
□ 实现显示/隐藏逻辑
```

代码审查时：
```
□ 是否使用了系统原生 Alert？（需要替换）
□ 是否使用了系统原生 confirm？（需要替换）
□ UI 风格是否与整体设计一致？
□ 是否复用了已有的 UI 组件？
□ 颜色是否使用了设计系统中定义的常量？
```

### 💡 实战案例：替换 Alert 为 Snackbar

#### Before（❌ 使用 Alert）

```typescript
// ❌ 不好的代码
import { Alert } from 'react-native';

const handleStatusChange = async (status: string) => {
  try {
    await updateStatus(status);
    Alert.alert('成功', '状态已更新');  // 需要用户点击确定
  } catch (error) {
    Alert.alert('失败', '状态更新失败');  // 样式丑陋
  }
};
```

#### After（✅ 使用 Snackbar）

```typescript
// ✅ 好的代码
import { Snackbar } from 'react-native-paper';

const [snackbar, setSnackbar] = useState({
  visible: false,
  message: '',
  type: 'success' as 'success' | 'error' | 'info',
});

const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  setSnackbar({ visible: true, message, type });
};

const hideSnackbar = () => {
  setSnackbar({ ...snackbar, visible: false });
};

const handleStatusChange = async (status: string) => {
  try {
    await updateStatus(status);
    showSnackbar('状态已更新', 'success');  // ✅ 自动关闭，不打断用户
  } catch (error) {
    showSnackbar('状态更新失败', 'error');  // ✅ 美观、一致
  }
};

return (
  <View>
    {/* 页面内容 */}
    
    {/* Snackbar */}
    <Snackbar
      visible={snackbar.visible}
      onDismiss={hideSnackbar}
      duration={3000}
      action={{ label: '确定', onPress: hideSnackbar }}
      style={{
        backgroundColor: 
          snackbar.type === 'success' ? '#22C55E' :
          snackbar.type === 'error' ? '#EF4444' :
          '#3B82F6',
      }}
    >
      {snackbar.message}
    </Snackbar>
  </View>
);
```

**改进点**：
1. ✅ 使用 Material Design Snackbar
2. ✅ 自动关闭（3秒）
3. ✅ 颜色语义化（成功=绿色，失败=红色）
4. ✅ 不打断用户操作
5. ✅ UI 更美观、更现代

### 🚨 常见错误

#### 错误 1: 混用多种提示方式

```typescript
// ❌ 错误：一会儿用 Alert，一会儿用 Snackbar
Alert.alert('成功', '保存成功');
showToast('删除成功');  // 另一个提示库
showSnackbar('更新成功');  // 又一个提示方式

// ✅ 正确：统一使用 Snackbar
showSnackbar('保存成功', 'success');
showSnackbar('删除成功', 'success');
showSnackbar('更新成功', 'success');
```

#### 错误 2: 忘记清理状态

```typescript
// ❌ 错误：没有清理 Snackbar 状态
const showSnackbar = (message: string) => {
  setSnackbar({ visible: true, message, type: 'success' });
  // 忘记设置自动关闭或提供关闭按钮
};

// ✅ 正确：提供关闭逻辑
<Snackbar
  visible={snackbar.visible}
  onDismiss={hideSnackbar}  // ✅ 用户可手动关闭
  duration={3000}  // ✅ 自动关闭
/>
```

#### 错误 3: 硬编码颜色值

```typescript
// ❌ 错误：直接写颜色值
<Snackbar style={{ backgroundColor: '#22C55E' }}>
  成功
</Snackbar>

// ✅ 正确：使用设计系统常量
const COLORS = {
  success: '#22C55E',
  error: '#EF4444',
  info: '#3B82F6',
};

<Snackbar style={{ backgroundColor: COLORS.success }}>
  成功
</Snackbar>
```

---

## 🤖 AI 协作开发规范（新增！）

### ⚠️ 核心原则
在使用 AI 辅助开发时，必须遵守以下规则以提高效率和降低成本：

### 🥇 规则 1: 禁止生成总结文档
```bash
# ❌ 错误：每次完成功能后都生成总结 MD
- 收入统计功能完成总结.md
- 订单管理完成总结.md  
- UI迁移完成总结.md
- 认证功能完成总结.md

# 问题：
- 浪费大量 token（每个文档 2000-5000 tokens）
- 信息重复，已在代码注释和 git commit 中记录
- 文档很快过时，维护成本高
- 不如直接查看代码和 git history

# ✅ 正确：只维护核心文档
- rules.md (开发规范 - 持续更新)
- 进度管理.md (项目进度 - 定期更新)
- README.md (项目说明)
- API 文档（自动生成）
```

**例外情况**：
- ✅ 只有在用户**明确要求**时才生成总结文档
- ✅ 复杂的架构变更需要设计文档时
- ✅ 重大功能发布需要 Release Notes 时

**正确做法**：
```bash
# 完成功能后的标准流程：
1. ✅ 更新代码注释
2. ✅ 更新 rules.md（如有新的规范或陷阱）
3. ✅ 更新 进度管理.md（标记完成状态）
4. ✅ Git commit 包含清晰的说明
5. ❌ 不要生成单独的完成总结文档
```

### 🥈 规则 2: 及时更新开发规范
```bash
# ✅ 强制要求：遇到以下情况必须更新 rules.md

1. 发现新的常见错误
   例如：字段名错误、类型不匹配、枚举值错误
   → 立即补充到"常见陷阱"部分

2. 总结新的最佳实践
   例如：API 组装模式、数据迁移步骤、UI 组件使用
   → 立即补充到相应规范部分

3. 引入新的技术栈/工具
   例如：新增 Alembic 迁移、新增 react-native-paper
   → 立即补充使用规范

4. 项目规范变更
   例如：字段命名标准调整、代码风格变更
   → 立即更新相关规范

5. 遇到耗时超过 30 分钟的调试
   例如：某个字段错误花了 2 小时调试
   → 必须记录到 rules.md，避免重复踩坑
```

**更新检查清单**：
```
完成功能开发后：
□ 是否遇到了新的字段错误？ → 更新"常见陷阱"
□ 是否发现了新的最佳实践？ → 更新相关规范
□ 是否引入了新的工具/库？ → 补充使用规范
□ 是否调试超过 30 分钟？ → 记录问题和解决方案
□ 是否有新的开发流程？ → 更新工作流部分
```

**为什么必须及时更新**：
- ✅ rules.md 是团队知识库，越完善越高效
- ✅ 避免重复踩坑，节省大量调试时间
- ✅ 新成员快速上手，降低学习成本
- ✅ AI 助手能获取最新规范，提供更准确建议
- ✅ 持续改进开发流程，提升整体效率

**更新格式**：
```markdown
# 在相应部分添加案例

### 陷阱 X: [问题描述]

```python
# ❌ 错误示例
[错误代码]

# ✅ 正确示例
[正确代码]
```

**解决方案**: [详细说明]
**调试时间**: 花费 X 小时（如果看了 rules.md 只需 5 分钟！）
```

### 🎯 实战案例

#### 案例 1: 避免生成冗余文档

```bash
# ❌ 错误流程
完成收入统计功能
→ 写 300 行代码
→ 生成"收入统计功能完成总结.md"（2500 tokens）
→ 生成"API文档总结.md"（1500 tokens）
→ 生成"测试报告.md"（1000 tokens）
→ 总计浪费 5000 tokens！

# ✅ 正确流程
完成收入统计功能
→ 写 300 行代码（包含清晰注释）
→ 更新 进度管理.md 标记完成（50 tokens）
→ Git commit 附上功能说明（免费）
→ 如遇到新陷阱，更新 rules.md（200 tokens）
→ 总计 250 tokens，节省 95%！
```

#### 案例 2: 及时更新规范

```bash
# 发现问题：address.phone 导致 TypeError
# 调试时间：2 小时

# ❌ 错误：解决后不记录
修复 bug → 继续开发 → 下次又遇到 → 又花 2 小时

# ✅ 正确：立即更新 rules.md
修复 bug 
→ 在"常见陷阱"添加案例
→ 下次 AI 助手直接提醒
→ 团队成员看 rules.md 避免踩坑
→ 节省所有人的时间！
```

### 📋 token 优化建议

**高价值文档**（值得维护）：
- ✅ `rules.md` - 开发规范（核心知识库）
- ✅ `进度管理.md` - 项目进度（简洁列表）
- ✅ `README.md` - 项目说明（必要信息）
- ✅ 代码注释 - 解释复杂逻辑

**低价值文档**（避免生成）：
- ❌ 功能完成总结（重复信息）
- ❌ API 使用示例总结（代码即文档）
- ❌ 测试报告总结（CI/CD 已记录）
- ❌ 每日工作总结（进度管理已够）

**token 使用对比**：
```
传统方式（浪费型）:
- 写代码: 5000 tokens
- 生成 5 个总结文档: 10000 tokens
- 文档很快过时: 0 价值
总计: 15000 tokens → 高成本，低价值

优化方式（高效型）:
- 写代码 + 注释: 5500 tokens
- 更新 rules.md: 300 tokens
- 更新 进度管理.md: 100 tokens
总计: 5900 tokens → 低成本，高价值

节省: 60% tokens，同时提升文档质量！
```

---

## 📖 版本历史

- **v2.3.0** (2024-12-27)
  - 🆕 新增 AI 协作开发规范
  - 🆕 规则 1: 禁止生成总结文档（节省 token）
  - 🆕 规则 2: 及时更新开发规范（持续改进）
  - 📝 补充 token 优化建议
  - 📝 补充实战案例和对比分析

- **v2.2.0** (2024-12-26)
  - 🆕 新增前端 UI 组件规范
  - 🆕 新增 Snackbar 替代 Alert 指南
  - 🆕 新增 Material Design 组件推荐
  - 🆕 新增 UI 组件选择指南
  - 📝 补充实战案例和常见错误

- **v2.1.0** (2024-12-26)
  - 🆕 新增数据库迁移规范
  - 🆕 新增 Alembic 使用指南
  - 🆕 新增字段变更最佳实践
  - 🆕 新增迁移陷阱和实战案例
  - 📝 补充备份和回滚流程

- **v2.0.0** (2024-12-25)
  - 新增字段命名统一性规范
  - 新增 API 字段组装规则
  - 新增效率提升技巧
  - 扩展常见陷阱案例
  - 新增快速检查清单
  - 新增紧急救援指南

- **v1.0.0** (2024-12-24)
  - 初始版本
  - 核心原则
  - 基本工作流程

---

**维护者**: Landa Development Team  
**最后更新**: 2024-12-27  

**记住核心理念**: 
> 花 2 分钟检查模型，胜过花 20 分钟调试错误！  
> 花 10 分钟阅读文档，胜过花 2 小时返工重写！  
> 使用 Alembic 管理迁移，胜过手写 SQL 脚本造成版本混乱！  
> 使用 UI 库组件，胜过系统原生组件提升用户体验！  
> 及时更新 rules.md，胜过重复踩坑浪费时间！  
> 不生成冗余总结文档，胜过浪费 token 降低成本！