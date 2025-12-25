# 前后端字段映射文档

## 📋 问题说明

前端页面一直显示 "Alice Chen"，是因为使用了硬编码的 Mock 数据，没有从 Redux 读取真实的登录用户信息。

## ✅ 已修复

### 1. 统一数据模型

#### 后端模型（Python）

**User 表** (`backend/app/models/user.py`)
```python
- id: int
- phone: str
- nickname: str
- avatar: str
- role: UserRole (enum: CUSTOMER, THERAPIST, ADMIN)
- is_active: bool
- is_verified: bool
```

**Therapist 表** (`backend/app/models/therapist.py`)
```python
- id: int
- user_id: int (外键 -> User.id)
- name: str                  # 技师姓名
- title: str                 # 职称
- avatar: str                # 技师头像（可与 User.avatar 同步）
- about: str                 # 个人简介
- experience_years: int      # 工作年限
- rating: float              # 平均评分
- review_count: int          # 评价数量
- completed_count: int       # 完成订单数
- is_active: bool            # 是否激活
- is_verified: bool          # 是否认证
```

#### 后端 API 响应（FastAPI Schema）

**TherapistInfo** (`backend/app/api/v1/therapist_auth.py`)
```python
{
  "id": 1,                    # Therapist.id
  "user_id": 10,              # User.id
  "phone": "13800138000",     # User.phone
  "nickname": "技师8000",      # User.nickname
  "avatar": "https://...",    # User.avatar
  "role": "therapist",        # User.role
  "name": "张技师",            # Therapist.name
  "title": "高级按摩师",       # Therapist.title
  "experience_years": 5,      # Therapist.experience_years
  "rating": 4.9,              # Therapist.rating
  "review_count": 128,        # Therapist.review_count
  "completed_count": 256,     # Therapist.completed_count
  "is_verified": true,        # Therapist.is_verified
  "is_active": true           # Therapist.is_active
}
```

#### 前端 TypeScript 类型

**TherapistInfo** (`therapist/src/types/user.ts`)
```typescript
export interface TherapistInfo {
  id: number;                 // Therapist.id
  user_id: number;            // User.id
  phone: string;              // User.phone
  nickname: string;           // User.nickname
  avatar: string;             // User.avatar
  role: string;               // User.role
  name: string;               // Therapist.name
  title: string;              // Therapist.title
  experience_years: number;   // Therapist.experience_years
  rating: number;             // Therapist.rating
  review_count: number;       // Therapist.review_count
  completed_count: number;    // Therapist.completed_count
  is_verified: boolean;       // Therapist.is_verified
  is_active: boolean;         // Therapist.is_active
}
```

### 2. 修复的文件

#### ✅ `therapist/src/types/user.ts`
- 更新 `TherapistInfo` 接口，完全匹配后端字段
- 添加详细注释说明字段来源

#### ✅ `therapist/src/store/authSlice.ts`
- 将 `user` 类型从 `TherapistProfile` 改为 `TherapistInfo`
- 确保 Redux state 与后端响应一致

#### ✅ `therapist/src/screens/auth/LoginScreen.tsx`
- **关键修复**：直接保存完整的 `response.therapist` 对象到 Redux
- 移除了手动构建用户对象的逻辑（之前导致字段丢失）

**修复前：**
```typescript
user: {
  id: response.therapist.user_id.toString(),  // ❌ 错误：转成字符串
  name: response.therapist.name || response.therapist.nickname,
  // ... 只保存了部分字段
} as any  // ❌ 使用 any 忽略类型检查
```

**修复后：**
```typescript
user: response.therapist  // ✅ 直接使用后端返回的完整对象
```

#### ✅ `therapist/src/screens/profile/ProfileScreen.tsx`
- 从 Redux 读取真实的 `user` 数据
- 显示真实姓名：`user.name || user.nickname`
- 显示真实头像：`user.avatar`（带默认头像 fallback）
- 显示真实统计数据：
  - 完成订单数：`user.completed_count`
  - 平均评分：`user.rating`
  - 评价数量：`user.review_count`
- 显示认证状态：`user.is_verified`
- 在线状态使用：`user.is_active`

### 3. 字段映射表

| 前端字段 | 后端来源 | 说明 |
|---------|---------|------|
| `id` | `Therapist.id` | 技师档案 ID |
| `user_id` | `User.id` | 用户账号 ID |
| `phone` | `User.phone` | 手机号 |
| `nickname` | `User.nickname` | 用户昵称（如：技师8000）|
| `avatar` | `User.avatar` | 用户头像 URL |
| `role` | `User.role` | 角色（therapist）|
| `name` | `Therapist.name` | 技师真实姓名 |
| `title` | `Therapist.title` | 技师职称 |
| `experience_years` | `Therapist.experience_years` | 工作年限 |
| `rating` | `Therapist.rating` | 平均评分 |
| `review_count` | `Therapist.review_count` | 评价数量 |
| `completed_count` | `Therapist.completed_count` | 完成订单数 |
| `is_verified` | `Therapist.is_verified` | 是否认证 |
| `is_active` | `Therapist.is_active` | 是否激活 |

### 4. 注意事项

#### ❌ 不存在的字段（不要使用）
- `avatar_url` → 使用 `avatar`
- `full_name` → 使用 `name`
- `is_online` → 使用 `is_active`
- `total_reviews` → 使用 `review_count`
- `total_orders` → 使用 `completed_count`

#### ✅ 正确使用方式

**获取头像：**
```typescript
const avatarUrl = user.avatar || 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.nickname)}&background=135BEC&color=fff&size=256`;
```

**显示姓名：**
```typescript
<Text>{user.name || user.nickname || '未命名'}</Text>
```

**显示职称：**
```typescript
<Text>{user.title || '按摩师'}</Text>
```

**显示统计数据：**
```typescript
<Text>完成订单：{user.completed_count || 0}</Text>
<Text>平均评分：{user.rating?.toFixed(1) || '5.0'}</Text>
<Text>评价数量：{user.review_count || 0}</Text>
```

**判断认证状态：**
```typescript
{user.is_verified && (
  <View style={styles.verifiedBadge}>
    <MaterialIcons name="verified" size={16} />
    <Text>Landa Verified</Text>
  </View>
)}
```

## 📝 开发规范

### 添加新页面时的检查清单

1. ✅ 查看后端模型定义（`backend/app/models/`）
2. ✅ 查看后端 Schema（`backend/app/schemas/`）
3. ✅ 查看 API 响应格式（`backend/app/api/v1/`）
4. ✅ 确保前端 TypeScript 类型匹配（`therapist/src/types/`）
5. ✅ 从 Redux 读取数据，不要硬编码
6. ✅ 使用正确的字段名
7. ✅ 添加默认值处理（`||`、`?.`）

### 示例：正确的页面开发流程

```typescript
// 1. 从 Redux 获取数据
const { user } = useSelector((state: RootState) => state.auth);

// 2. 添加加载状态
if (!user) {
  return <ActivityIndicator />;
}

// 3. 使用正确的字段名 + 默认值
<Text>{user.name || '未命名'}</Text>
<Image source={{ uri: user.avatar || 'default_url' }} />
<Text>{user.completed_count || 0} 单</Text>
```

## 🔍 调试技巧

### 1. 在 Console 中检查当前用户信息

```javascript
// 在 React Native Debugger 中
__NAV__.current  // 当前页面
__redux__.getState().auth.user  // Redux 中的用户信息
```

### 2. 打印登录响应

```typescript
console.log('✅ 登录成功:', JSON.stringify(response, null, 2));
```

### 3. 验证字段存在性

```typescript
useEffect(() => {
  console.log('👤 当前用户:', {
    name: user?.name,
    nickname: user?.nickname,
    avatar: user?.avatar,
    rating: user?.rating,
    completed_count: user?.completed_count,
  });
}, [user]);
```

## 🎯 测试验证

### 1. 登录测试
- ✅ 登录后 Redux 保存完整用户信息
- ✅ 刷新 App 用户信息依然存在（Redux Persist）

### 2. ProfileScreen 测试
- ✅ 显示真实姓名（不是 "Alice Chen"）
- ✅ 显示真实头像
- ✅ 显示真实统计数据
- ✅ 显示认证徽章（如果 `is_verified=true`）

### 3. 字段兼容性测试
- ✅ 所有使用 `user` 的地方都能正确访问字段
- ✅ 没有使用不存在的字段（如 `avatar_url`）
- ✅ TypeScript 没有类型错误

---

**最后更新时间**: 2024-12-25  
**修复版本**: v0.4.1  
**修复人**: AI Assistant  
**验证状态**: ✅ 已验证

