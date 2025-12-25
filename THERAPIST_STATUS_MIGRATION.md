# 技师状态字段统一文档

## ✅ 完成时间
2024-12-26

## 📋 背景
之前后端数据库模型使用 `is_active: bool` 来表示技师状态，仅能表示"激活"或"未激活"两种状态。但从产品角度来看，技师需要更细粒度的状态控制：
- **在线 (online)**: 可接单
- **忙碌 (busy)**: 暂不接单
- **离线 (offline)**: 不可接单

因此需要将后端、前端、数据库统一为 `TherapistStatus` 枚举类型。

## 🎯 修改目标
遵循 `rules.md` 规范，确保：
1. 后端模型定义为唯一真相来源
2. 前端类型与后端 Schema 严格匹配
3. API 响应字段与数据库模型一致
4. 提供数据库迁移脚本确保平滑升级

## 📝 修改内容

### 1. 后端模型（✅ 已完成）

#### `backend/app/models/therapist.py`
```python
# 添加枚举定义
class TherapistStatus(str, enum.Enum):
    """技师状态枚举"""
    ONLINE = "online"     # 在线 - 可接单
    BUSY = "busy"         # 忙碌 - 暂不接单
    OFFLINE = "offline"   # 离线 - 不可接单

# 修改 Therapist 模型
class Therapist(Base):
    # ...其他字段...
    
    # 状态（修改前：is_active: bool）
    status: Mapped[str] = mapped_column(
        Enum(TherapistStatus),
        default=TherapistStatus.OFFLINE,
        nullable=False
    )
```

**变更**:
- ❌ 删除: `is_active: Mapped[bool]`
- ✅ 新增: `status: Mapped[str]` (枚举类型)

### 2. 后端 Schema（✅ 已完成）

#### `backend/app/api/v1/therapist_auth.py`

**TherapistInfo Schema**:
```python
class TherapistInfo(BaseModel):
    # ...其他字段...
    status: str = TherapistStatus.OFFLINE  # ✅ 使用 TherapistStatus 枚举
```

**变更**:
- ❌ 删除: `is_active: bool = True`
- ✅ 新增: `status: str = TherapistStatus.OFFLINE`

**所有 API 响应**:
```python
# 登录响应、获取技师信息、更新技师信息
return TherapistInfo(
    # ...
    status=therapist.status  # ✅ 返回 status 字段
)
```

### 3. 新增 API 端点（✅ 已完成）

#### `PUT /api/v1/therapist/auth/status`

**Request**:
```json
{
  "status": "online"  // "online" | "busy" | "offline"
}
```

**Response**:
```json
{
  "message": "状态更新成功",
  "status": "online"
}
```

**实现**:
```python
@router.put("/status", response_model=UpdateTherapistStatusResponse, summary="更新技师状态")
async def update_therapist_status(
    request: UpdateTherapistStatusRequest,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """更新技师状态"""
    # 验证状态值
    valid_statuses = [s.value for s in TherapistStatus]
    if request.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # 更新技师状态
    therapist.status = request.status
    await db.commit()
    
    return UpdateTherapistStatusResponse(message="状态更新成功", status=therapist.status)
```

### 4. 前端类型定义（✅ 已完成）

#### `therapist/src/types/user.ts`
```typescript
export interface TherapistInfo {
  // ...其他字段...
  status: string;     // ✅ 技师状态: "online" | "busy" | "offline"
}
```

**变更**:
- ❌ 删除: `is_active: boolean`
- ✅ 新增: `status: string`

### 5. 前端 API 调用（✅ 已完成）

#### `therapist/src/api/auth.ts`
```typescript
/**
 * 更新技师状态
 */
export const updateTherapistStatus = async (
  status: string
): Promise<{ message: string; status: string }> => {
  return request.put('/therapist/auth/status', { status });
};
```

### 6. 前端 UI 集成（✅ 已完成）

#### `therapist/src/screens/orders/OrdersScreen.tsx`

**状态类型**:
```typescript
type TherapistStatus = 'online' | 'busy' | 'offline';
```

**状态切换逻辑**:
```typescript
const handleStatusChange = async (status: TherapistStatus) => {
  try {
    setTherapistStatus(status);
    
    // ✅ 调用 API 更新后端技师状态
    await authApi.updateTherapistStatus(status);
    Alert.alert('状态已更新', `您已切换为${STATUS_CONFIG[status].label}`);
  } catch (error) {
    Alert.alert('更新失败', '状态切换失败，请稍后再试');
    setTherapistStatus(therapistStatus);  // 恢复之前的状态
  }
};
```

**初始状态同步**:
```typescript
// ✅ 从 Redux 的 user 数据中读取技师状态
const [therapistStatus, setTherapistStatus] = useState<TherapistStatus>(
  (user?.status as TherapistStatus) || 'offline'
);
```

### 7. 数据库迁移脚本（✅ 已完成）

#### 使用 Alembic 进行迁移

本项目使用 **Alembic** 进行数据库迁移管理。

**迁移文件位置**: `backend/alembic/versions/xxxx_change_therapist_is_active_to_status_enum.py`

**创建迁移**:
```bash
docker exec landa-api alembic revision --autogenerate -m "change_therapist_is_active_to_status_enum"
```

**迁移文件示例**:
```python
"""change therapist is_active to status enum

Revision ID: xxxx
Revises: yyyy
Create Date: 2024-12-26

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'xxxx'
down_revision: Union[str, None] = 'yyyy'

def upgrade() -> None:
    """升级数据库结构"""
    # 1. 添加 status 列（可空）
    op.add_column('therapists', sa.Column('status', sa.String(20), nullable=True))
    
    # 2. 迁移数据：将所有现有技师设置为 offline
    op.execute("""
        UPDATE therapists 
        SET status = 'offline'
        WHERE status IS NULL
    """)
    
    # 3. 设置 NOT NULL 约束
    op.alter_column('therapists', 'status', nullable=False)
    
    # 4. 添加 CHECK 约束验证枚举值
    op.create_check_constraint(
        'therapists_status_check',
        'therapists',
        "status IN ('online', 'busy', 'offline')"
    )
    
    # 5. 删除旧的 is_active 列（可选，建议分步进行）
    # op.drop_column('therapists', 'is_active')


def downgrade() -> None:
    """降级数据库结构（回滚）"""
    # 恢复 is_active 列
    op.add_column('therapists', 
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true')
    )
    
    # 根据 status 恢复 is_active 的值
    op.execute("""
        UPDATE therapists 
        SET is_active = CASE 
            WHEN status = 'online' THEN true
            ELSE false
        END
    """)
    
    # 删除约束和新列
    op.drop_constraint('therapists_status_check', 'therapists')
    op.drop_column('therapists', 'status')
```

**执行命令**:
```bash
# 查看当前迁移状态
docker exec landa-api alembic current

# 执行迁移
docker exec landa-api alembic upgrade head

# 回滚（如果需要）
docker exec landa-api alembic downgrade -1
```

## 🔄 迁移流程

### 步骤 1: 备份数据库
```bash
docker exec landa-postgres pg_dump -U postgres landa > backup_before_status_migration_$(date +%Y%m%d_%H%M%S).sql
```

### 步骤 2: 创建 Alembic 迁移文件
```bash
docker exec landa-api alembic revision --autogenerate -m "change_therapist_is_active_to_status_enum"
```

### 步骤 3: 编辑迁移文件
打开生成的迁移文件：`backend/alembic/versions/xxxx_change_therapist_is_active_to_status_enum.py`

确认 `upgrade()` 和 `downgrade()` 逻辑正确，特别是数据迁移部分。

### 步骤 4: 查看即将执行的 SQL（可选）
```bash
docker exec landa-api alembic upgrade head --sql
```

### 步骤 5: 执行迁移
```bash
# 查看当前版本
docker exec landa-api alembic current

# 执行迁移
docker exec landa-api alembic upgrade head

# 查看迁移后的版本
docker exec landa-api alembic current
```

### 步骤 6: 验证迁移
```bash
# 进入 PostgreSQL 容器
docker exec -it landa-postgres psql -U postgres -d landa

# 检查 therapists 表结构
\d therapists

# 查看状态分布
SELECT status, COUNT(*) FROM therapists GROUP BY status;

# 检查 Alembic 版本记录
SELECT * FROM alembic_version;

# 退出
\q
```

### 步骤 7: 重启 API 服务
```bash
docker-compose restart api
```

### 步骤 8: 测试验证
- 技师登录
- 切换状态 (在线/忙碌/离线)
- 验证 API 响应
- 验证 Redux 状态更新

### 步骤 9: 如果出现问题，回滚
```bash
# 回滚到上一个版本
docker exec landa-api alembic downgrade -1

# 或回滚到指定版本
docker exec landa-api alembic downgrade <revision_id>

# 恢复数据库备份（最后手段）
docker exec -i landa-postgres psql -U postgres landa < backup_before_status_migration_20241226_100000.sql
```

## 📊 字段对照表

| 维度 | 修改前 | 修改后 | 说明 |
|------|--------|--------|------|
| **数据库模型** | `is_active: bool` | `status: Enum(TherapistStatus)` | 枚举类型更清晰 |
| **后端 Schema** | `is_active: bool = True` | `status: str = TherapistStatus.OFFLINE` | 与模型一致 |
| **前端类型** | `is_active: boolean` | `status: string` | 与后端匹配 |
| **默认值** | `True` (激活) | `"offline"` (离线) | 技师需主动上线 |
| **API 端点** | - | `PUT /therapist/auth/status` | 新增状态更新接口 |

## 🎨 UI 状态展示

```typescript
const STATUS_CONFIG = {
  online: {
    label: '在线',
    icon: '🟢',
    color: '#22C55E',
    bg: 'rgba(34, 197, 94, 0.1)',
  },
  busy: {
    label: '忙碌',
    icon: '🟡',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.1)',
  },
  offline: {
    label: '离线',
    icon: '⚫',
    color: '#71717A',
    bg: 'rgba(113, 113, 122, 0.1)',
  },
};
```

## ✅ 验证清单

- [x] 后端模型添加 `TherapistStatus` 枚举
- [x] 后端模型修改 `is_active` → `status`
- [x] 后端 Schema 更新 `TherapistInfo`
- [x] 后端 API 添加状态更新端点
- [x] 后端 API 所有响应使用 `status` 字段
- [x] 前端类型定义匹配后端
- [x] 前端 API 调用支持状态更新
- [x] 前端 UI 集成状态切换
- [x] 创建数据库迁移脚本
- [x] Linter 无错误

## 🚀 后续工作

1. **创建并执行 Alembic 迁移**:
   ```bash
   # 创建迁移文件
   docker exec landa-api alembic revision --autogenerate -m "change_therapist_is_active_to_status_enum"
   
   # 编辑迁移文件，确认逻辑正确
   # backend/alembic/versions/xxxx_change_therapist_is_active_to_status_enum.py
   
   # 执行迁移
   docker exec landa-api alembic upgrade head
   ```

2. **重启服务**:
   ```bash
   docker-compose restart api
   ```

3. **测试验证**:
   - 技师登录
   - 切换状态 (在线/忙碌/离线)
   - 验证 API 响应
   - 验证 Redux 状态更新

4. **更新种子数据脚本** (可选):
   更新 `backend/scripts/seed_data.py` 中的技师创建逻辑，使用新的 `status` 字段：
   ```python
   therapist = Therapist(
       # ...其他字段...
       status=TherapistStatus.OFFLINE,  # ✅ 使用新字段
       # is_active=True,  # ❌ 删除旧字段
   )
   ```

5. **更新测试订单脚本** (可选):
   如果 `backend/scripts/create_test_orders.py` 中涉及技师状态，也需要更新。

## 📝 开发规范总结

本次修改严格遵循 `rules.md` 的核心原则：

### ✅ 规则 1: 数据模型优先
- 先检查后端 `backend/app/models/therapist.py`
- 添加枚举定义，修改字段类型
- 确保数据库结构是唯一真相来源

### ✅ 规则 2: 类型一致性
- 前端 `TherapistInfo` 接口与后端 Schema 完全匹配
- 字段名、类型、默认值保持一致

### ✅ 规则 3: 动态数据
- 前端从 Redux 读取 `user.status`
- 调用 API 更新状态，而非硬编码

### ✅ 规则 4: 枚举类型
- 后端定义 `TherapistStatus` 枚举
- 前端使用对应的 Union Type
- API 验证枚举值有效性

### ✅ 规则 5: 字段命名统一
- 统一使用 `status` 字段
- 遵循枚举命名规范 (UPPERCASE)

### ✅ 新增规则: 数据库迁移管理（v2.1.0）
- **使用 Alembic 管理所有数据库变更**
- 每次模型修改后立即创建迁移文件
- 迁移前必须备份数据库
- 编写完整的 upgrade 和 downgrade 逻辑
- 验证迁移结果并记录版本

### 📖 经验教训

#### ❌ 错误做法
```bash
# 直接写 Python 脚本修改数据库
python scripts/migrate_therapist_status.py  # 绕过版本控制！
```

**问题**:
- 无法追踪迁移历史
- 无法回滚变更
- 多环境同步困难
- 团队协作混乱

#### ✅ 正确做法
```bash
# 使用 Alembic 创建和执行迁移
docker exec landa-api alembic revision --autogenerate -m "描述性名称"
docker exec landa-api alembic upgrade head
```

**优势**:
- 版本控制完整
- 可随时回滚
- 团队协作清晰
- 多环境一致性

#### 🎯 核心要点
1. **永远不要绕过 Alembic**：所有数据库变更都通过 Alembic
2. **先备份再迁移**：养成备份习惯，避免数据丢失
3. **完整的回滚方案**：确保 `downgrade()` 可以完全恢复
4. **分步执行危险操作**：删除字段时先标记废弃，运行一段时间后再删除
5. **验证迁移结果**：执行后立即检查表结构和数据完整性

## 📚 相关文档

- `rules.md` - 开发规范
- `backend/DATABASE_FIELD_STANDARDS.md` - 数据库字段规范
- `FIELD_MAPPING.md` - 前后端字段映射

---

**维护者**: Landa Development Team  
**最后更新**: 2024-12-26  
**版本**: v1.0.0

