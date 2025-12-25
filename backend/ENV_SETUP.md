# 🔧 环境变量配置指南

## 创建 .env 文件

在 `backend/` 目录下创建 `.env` 文件，内容如下：

```env
# Landa Backend Environment Variables

# ========== App ==========
APP_NAME=Landa API
APP_VERSION=1.0.0
DEBUG=true

# ========== Database ==========
# Important: Port 5433 on host (because docker-compose.yml maps 5433:5432)
DATABASE_URL=postgresql+asyncpg://postgres:landa2024@localhost:5433/landa

# ========== Redis ==========
REDIS_URL=redis://localhost:6379/0

# ========== Security ==========
SECRET_KEY=dev-secret-key-change-in-production-please-use-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ========== CORS ==========
CORS_ORIGINS=http://localhost:3000,http://localhost:19006,http://10.0.2.2:19006

# ========== SMS (Development) ==========
SMS_PROVIDER=aliyun
ALIYUN_ACCESS_KEY_ID=your_key_id
ALIYUN_ACCESS_KEY_SECRET=your_key_secret
SMS_SIGN_NAME=Landa
SMS_TEMPLATE_CODE=SMS_123456
```

## 快速创建命令

### PowerShell (Windows)
```powershell
cd backend

# 创建 .env 文件
@"
APP_NAME=Landa API
APP_VERSION=1.0.0
DEBUG=true
DATABASE_URL=postgresql+asyncpg://postgres:landa2024@localhost:5433/landa
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=dev-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:19006,http://10.0.2.2:19006
"@ | Out-File -FilePath .env -Encoding UTF8
```

### 或者手动创建
1. 在 `backend/` 目录右键 → 新建文本文档
2. 命名为 `.env`（删除 .txt 后缀）
3. 复制上面的内容进去
4. 保存

## 注意事项

⚠️ **数据库端口是 5433**
- Docker 容器映射: `5433:5432`
- 所以连接字符串用 `localhost:5433`

✅ **数据库密码是 landa2024**
- 在 `docker-compose.yml` 中定义
- 必须匹配才能连接成功

