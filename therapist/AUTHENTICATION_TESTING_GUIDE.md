# 🧪 P0 认证增强功能测试指南

本文档提供详细的测试步骤，用于验证 Token 自动刷新和启动状态恢复功能。

---

## 📋 测试清单

- [ ] **测试 1**: Token 自动刷新（401 自动恢复）
- [ ] **测试 2**: 并发请求时的 Token 刷新
- [ ] **测试 3**: Refresh Token 失效后的退出登录
- [ ] **测试 4**: App 启动时 Token 有效的自动登录
- [ ] **测试 5**: App 启动时 Token 过期但 Refresh Token 有效
- [ ] **测试 6**: App 启动时 Refresh Token 也过期的退出

---

## 🔧 准备工作

### 1. 启动后端服务

```powershell
cd D:\Landa_new_front\backend
docker-compose up -d

# 查看日志
docker-compose logs -f api
```

### 2. 启动前端应用

```powershell
cd D:\Landa_new_front\therapist
npx expo start -c

# 按 'a' 在 Android 模拟器运行
```

### 3. 确认测试账号

- **手机号**: `13800138000`
- **验证码**: `888888`（debug 模式通用验证码）

---

## ✅ 测试 1：Token 自动刷新（401 自动恢复）

### 目标
验证当 access_token 过期时，拦截器能自动刷新并重试请求。

### 步骤

#### 1.1 修改 Token 过期时间（仅用于测试）

临时修改后端配置，缩短 token 有效期：

```python
# backend/app/core/config.py (临时修改)
ACCESS_TOKEN_EXPIRE_MINUTES: int = 1  # 改为 1 分钟（原值：60 * 24 * 7）
```

```powershell
# 重启后端
cd D:\Landa_new_front\backend
docker-compose restart api
```

#### 1.2 登录应用

1. 打开 App，进入登录页
2. 输入手机号 `13800138000`
3. 点击 "Send Code"
4. 输入验证码 `888888`
5. 点击 "Login"
6. ✅ **预期结果**: 成功登录，进入主页

#### 1.3 等待 Token 过期

1. 登录后，等待 **1 分钟**（让 access_token 过期）
2. 在 "Profile" 页面点击任意需要认证的功能（如 "Edit Profile"）
3. 观察控制台日志

#### 1.4 验证自动刷新

✅ **预期日志输出**:

```
📤 API Request: GET /api/v1/therapist/auth/profile
❌ Response Error: 401 Unauthorized
🔄 尝试刷新 Token...
✅ Token 刷新成功
📤 API Request: GET /api/v1/therapist/auth/profile (重试)
📥 API Response: 200 OK
```

✅ **预期结果**:
- App **不会退出登录**
- 请求自动重试成功
- 用户无感知

#### 1.5 恢复配置

测试完成后，恢复原配置：

```python
# backend/app/core/config.py
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 恢复为 7 天
```

```powershell
docker-compose restart api
```

---

## ✅ 测试 2：并发请求时的 Token 刷新

### 目标
验证多个请求同时遇到 401 时，只刷新一次 token。

### 步骤

#### 2.1 保持 Token 过期时间为 1 分钟

```python
# backend/app/core/config.py
ACCESS_TOKEN_EXPIRE_MINUTES: int = 1
```

#### 2.2 创建测试场景

1. 登录应用
2. 等待 1 分钟（让 token 过期）
3. 快速连续触发多个需要认证的操作：
   - 点击 "Profile" → "Edit Profile"
   - 点击 "Orders" 刷新列表
   - 点击 "Income" 刷新数据

#### 2.3 观察日志

✅ **预期日志**:

```
📤 API Request: GET /api/v1/therapist/auth/profile
📤 API Request: GET /api/v1/orders
📤 API Request: GET /api/v1/income/stats
❌ Response Error: 401 (x3)
🔄 尝试刷新 Token... (只调用一次!)
✅ Token 刷新成功
📤 API Request: GET /api/v1/therapist/auth/profile (重试)
📤 API Request: GET /api/v1/orders (重试)
📤 API Request: GET /api/v1/income/stats (重试)
📥 API Response: 200 OK (x3)
```

✅ **预期结果**:
- 只调用一次 `/refresh` API
- 所有请求都成功重试
- 不会退出登录

---

## ✅ 测试 3：Refresh Token 失效后的退出登录

### 目标
验证当 refresh_token 也过期时，正确退出登录。

### 步骤

#### 3.1 模拟 Refresh Token 失效

方法 1：手动修改 Redux state（使用 Redux DevTools）

方法 2：修改后端配置，缩短 refresh_token 有效期

```python
# backend/app/core/config.py (临时修改)
REFRESH_TOKEN_EXPIRE_DAYS: int = 0  # 设为 0 天（立即过期）
```

```powershell
docker-compose restart api
```

#### 3.2 触发刷新

1. 等待 access_token 过期（1 分钟）
2. 触发任意需要认证的操作

#### 3.3 验证退出登录

✅ **预期日志**:

```
📤 API Request: GET /api/v1/therapist/auth/profile
❌ Response Error: 401 Unauthorized
🔄 尝试刷新 Token...
❌ Token 刷新失败: 401 Unauthorized
🔒 退出登录
```

✅ **预期结果**:
- App 自动退出登录
- 跳转到登录页
- Redux state 被清空

---

## ✅ 测试 4：App 启动时 Token 有效的自动登录

### 目标
验证 App 重启后，如果 token 有效，自动登录成功。

### 步骤

#### 4.1 正常登录

1. 打开 App，登录成功
2. 进入主页

#### 4.2 关闭并重启 App

**Android 模拟器**:
- 按两次返回键（退出 App）
- 或从多任务界面关闭 App
- 重新打开 App

**方法 2（推荐）**:
```powershell
# 在 Expo 终端按 'r' 键（重新加载）
```

#### 4.3 观察启动流程

✅ **预期日志**:

```
🔍 开始验证登录状态...
🔐 验证 Token 有效性...
📤 API Request: GET /api/v1/therapist/auth/profile
📥 API Response: 200 OK
✅ Token 有效，用户信息已更新
✅ 登录状态验证完成
```

✅ **预期结果**:
- 显示 "正在验证登录状态..." 加载界面（约 1-2 秒）
- **直接进入主页**（不需要重新登录）
- 用户信息正确显示

---

## ✅ 测试 5：App 启动时 Token 过期但 Refresh Token 有效

### 目标
验证 App 重启时，如果 access_token 过期但 refresh_token 有效，能自动刷新。

### 步骤

#### 5.1 设置短期 Token

```python
# backend/app/core/config.py
ACCESS_TOKEN_EXPIRE_MINUTES: int = 1  # 1 分钟
REFRESH_TOKEN_EXPIRE_DAYS: int = 30   # 30 天
```

```powershell
docker-compose restart api
```

#### 5.2 登录并等待

1. 登录应用
2. 等待 **2 分钟**（让 access_token 过期，但 refresh_token 仍有效）
3. 关闭并重启 App

#### 5.3 观察自动刷新

✅ **预期日志**:

```
🔍 开始验证登录状态...
🔐 验证 Token 有效性...
📤 API Request: GET /api/v1/therapist/auth/profile
❌ Response Error: 401 Unauthorized
⚠️ Token 验证失败
🔄 尝试使用 refresh token 刷新...
📤 API Request: POST /api/v1/therapist/auth/refresh
✅ Token 刷新成功
📤 API Request: GET /api/v1/therapist/auth/profile
📥 API Response: 200 OK
✅ 自动登录成功
✅ 登录状态验证完成
```

✅ **预期结果**:
- 显示 "正在验证登录状态..." 加载界面（约 2-3 秒）
- 自动刷新 token
- **直接进入主页**
- 不需要重新登录

---

## ✅ 测试 6：App 启动时 Refresh Token 也过期

### 目标
验证 App 重启时，如果两个 token 都过期，正确退出到登录页。

### 步骤

#### 6.1 设置极短期 Token

```python
# backend/app/core/config.py
ACCESS_TOKEN_EXPIRE_MINUTES: int = 1   # 1 分钟
REFRESH_TOKEN_EXPIRE_DAYS: int = 0     # 立即过期
```

```powershell
docker-compose restart api
```

#### 6.2 登录并等待

1. 登录应用
2. 等待 **2 分钟**
3. 关闭并重启 App

#### 6.3 验证退出登录

✅ **预期日志**:

```
🔍 开始验证登录状态...
🔐 验证 Token 有效性...
📤 API Request: GET /api/v1/therapist/auth/profile
❌ Response Error: 401 Unauthorized
⚠️ Token 验证失败
🔄 尝试使用 refresh token 刷新...
📤 API Request: POST /api/v1/therapist/auth/refresh
❌ Token 刷新失败，退出登录
✅ 登录状态验证完成
```

✅ **预期结果**:
- 显示 "正在验证登录状态..." 加载界面（约 2-3 秒）
- 自动退出登录
- **跳转到登录页**
- Redux state 被清空

---

## 🎯 测试完成后

### 恢复生产配置

```python
# backend/app/core/config.py
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 天
REFRESH_TOKEN_EXPIRE_DAYS: int = 30             # 30 天
```

```powershell
cd D:\Landa_new_front\backend
docker-compose restart api
```

---

## 📊 测试结果记录表

| 测试项 | 预期结果 | 实际结果 | 状态 |
|--------|---------|---------|------|
| 测试 1: Token 自动刷新 | 401 后自动刷新，请求重试成功 | ⬜ 待测试 | ⬜ |
| 测试 2: 并发请求刷新 | 只刷新一次，所有请求成功 | ⬜ 待测试 | ⬜ |
| 测试 3: Refresh Token 失效 | 自动退出登录，跳转登录页 | ⬜ 待测试 | ⬜ |
| 测试 4: 启动时 Token 有效 | 直接进入主页 | ⬜ 待测试 | ⬜ |
| 测试 5: 启动时 Token 过期 | 自动刷新，进入主页 | ⬜ 待测试 | ⬜ |
| 测试 6: 启动时全部过期 | 退出登录，跳转登录页 | ⬜ 待测试 | ⬜ |

---

## 🐛 常见问题

### Q1: 看不到日志输出？

**A**: 确保在 React Native 开发工具中打开控制台：
- Metro 终端会显示日志
- 或使用 `npx react-native log-android`（Android）
- 或使用 `npx react-native log-ios`（iOS）

### Q2: Token 刷新失败，提示 "user_id not found"？

**A**: 后端 `/refresh` 接口的 token 解析可能有问题。检查：
- `backend/app/api/v1/therapist_auth.py` 中 `user_id = token_data.get("sub")`
- `backend/app/core/security.py` 中 JWT payload 是否包含 `sub` 字段

### Q3: App 重启后直接到登录页，没有验证过程？

**A**: 检查：
- `redux-persist` 是否正确配置
- `AsyncStorage` 中是否保存了 state（可用 React Native Debugger 查看）
- `useAuthCheck` Hook 是否被正确调用

---

## 📝 测试记录

**测试人员**: _____________  
**测试日期**: _____________  
**测试环境**:
- 后端版本: _____________
- 前端版本: _____________
- 模拟器/真机: _____________

**备注**:
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________

