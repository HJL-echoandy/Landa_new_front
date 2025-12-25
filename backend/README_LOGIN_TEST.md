# 技师登录功能测试指南

## 🎯 功能概述

已完成技师端登录功能，包括：
- ✅ 后端技师登录 API (`POST /api/v1/therapist/auth/login`)
- ✅ JWT Token 包含 role 字段
- ✅ 角色验证中间件 (`require_role`)
- ✅ 前端真实 API 调用
- ✅ 验证码登录流程

---

## 📋 准备工作

### 1. 启动后端服务

```bash
cd backend

# 启动 Docker Compose（PostgreSQL + Redis）
docker-compose up -d

# 运行数据库迁移
alembic upgrade head

# 创建测试技师账号
python scripts/create_test_therapist.py

# 启动 FastAPI 服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 启动前端服务

```bash
cd therapist

# 启动 Expo
npx expo start

# 在 Android 模拟器中运行
按 'a'
```

---

## 🧪 测试步骤

### 测试账号信息

```
手机号: 13800138000
验证码: 888888 (开发环境万能验证码)
角色: therapist
```

### 测试流程

1. **打开技师端 App**
   - 应该自动进入登录页面

2. **输入手机号**
   - 输入: `13800138000`
   - 点击"发送验证码"按钮

3. **查看后端日志**
   - 后端终端应该显示:
   ```
   [DEBUG] 技师验证码: 13800138000 -> xxxxxx
   ```

4. **输入验证码**
   - 输入验证码（或直接输入万能码 `888888`）
   - 点击"登录"按钮

5. **验证登录成功**
   - 前端应该自动跳转到主界面（订单列表页）
   - Redux Store 应该包含用户信息

6. **检查 API 请求**
   - 打开浏览器开发者工具 Network 面板
   - 应该看到:
     - `POST /api/v1/therapist/auth/send-code` (发送验证码)
     - `POST /api/v1/therapist/auth/login` (登录)

---

## 🔍 验证要点

### 后端验证

1. **JWT Token 包含 role**

```bash
# 解码 JWT Token (使用 jwt.io 或命令行)
echo "YOUR_ACCESS_TOKEN" | base64 -d
```

应该看到:
```json
{
  "sub": "1",
  "role": "therapist",
  "type": "access",
  "exp": 1234567890
}
```

2. **数据库验证**

```bash
# 连接到 PostgreSQL
docker exec -it landa_postgres psql -U landa -d landa

# 查询用户
SELECT id, phone, role FROM users WHERE phone = '13800138000';

# 查询技师信息
SELECT u.phone, t.name, t.title, t.rating, t.completed_orders 
FROM users u 
JOIN therapists t ON u.id = t.user_id 
WHERE u.phone = '13800138000';
```

### 前端验证

1. **Redux Store**

在 React Native Debugger 中查看:
```javascript
// auth.isLoggedIn 应该为 true
// auth.token 应该包含 JWT
// auth.user 应该包含技师信息
{
  isLoggedIn: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "1",
    name: "测试技师",
    phone: "13800138000",
    role: "therapist",
    rating: 4.8,
    completed_orders: 450
  }
}
```

2. **API 请求头**

后续 API 请求应该自动包含 Token:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🐛 常见问题

### 问题 1: "该手机号未注册为技师"

**原因**: 测试账号未创建或 role 不是 `therapist`

**解决**:
```bash
cd backend
python scripts/create_test_therapist.py
```

### 问题 2: "验证码错误或已过期"

**原因**: 
- 验证码输入错误
- 开发环境未启用万能验证码

**解决**:
- 使用万能验证码 `888888`
- 检查 `backend/.env` 文件中 `DEBUG=true`

### 问题 3: "Network Error"

**原因**: 前端无法连接到后端

**解决**:
1. 检查后端是否启动:
   ```bash
   curl http://localhost:8000/health
   ```

2. 检查前端 API 配置:
   ```typescript
   // therapist/src/utils/constants.ts
   export const API_CONFIG = {
     BASE_URL: 'http://10.0.2.2:8000', // Android 模拟器
     // BASE_URL: 'http://localhost:8000', // iOS 模拟器
   };
   ```

3. Android 模拟器使用 `10.0.2.2` 代替 `localhost`

### 问题 4: Token 未包含 role

**原因**: `create_access_token` 未传递 role 参数

**解决**:
检查 `backend/app/api/v1/therapist_auth.py`:
```python
access_token = create_access_token(user.id, role=UserRole.THERAPIST.value)
```

---

## 📊 API 文档

### 发送验证码

```http
POST /api/v1/therapist/auth/send-code
Content-Type: application/json

{
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "message": "验证码已发送"
}
```

### 技师登录

```http
POST /api/v1/therapist/auth/login
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "888888"
}
```

**响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "therapist": {
    "id": 1,
    "user_id": 1,
    "phone": "13800138000",
    "nickname": "测试技师",
    "avatar": "https://...",
    "role": "therapist",
    "name": "测试技师",
    "title": "高级按摩师",
    "experience_years": 5,
    "rating": 4.8,
    "total_reviews": 120,
    "completed_orders": 450,
    "is_verified": true,
    "is_available": true
  }
}
```

---

## ✅ 测试清单

- [ ] 后端服务启动成功
- [ ] 数据库迁移完成
- [ ] 测试账号创建成功
- [ ] 前端 App 启动成功
- [ ] 能够发送验证码
- [ ] 能够使用验证码登录
- [ ] 登录后跳转到主界面
- [ ] Token 包含在后续请求中
- [ ] 退出登录功能正常
- [ ] Token 刷新功能正常

---

## 🎉 下一步

登录功能已完成！接下来可以：

1. **实现其他技师端 API**
   - 订单管理
   - 收入统计
   - 个人资料
   - 评价管理
   - 日程管理

2. **完善前端页面**
   - 订单详情页交互
   - 地图导航集成
   - GPS 打卡功能
   - 实时消息推送

3. **添加角色权限控制**
   - 在所有技师端 API 加上 `require_role("therapist")`
   - 防止非技师用户访问技师功能

4. **优化用户体验**
   - 添加加载动画
   - 错误提示优化
   - 表单验证增强

---

## 📞 联系与支持

如有问题，请检查:
- 后端日志: `backend/` 终端输出
- 前端日志: Expo Metro 终端输出
- 数据库日志: `docker logs landa_postgres`

