# Landa API 后端

基于 FastAPI + SQLAlchemy + PostgreSQL 的按摩预约服务后端 API。

## 🚀 快速开始

### 环境要求

- Python 3.10+
- PostgreSQL 14+
- Redis 6+

### 安装依赖

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填写实际配置
```

### 初始化数据库

```bash
# 创建数据库（PostgreSQL）
createdb landa

# 运行数据库迁移
alembic upgrade head
```

### 启动服务

```bash
# 开发模式（自动重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 访问 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📁 项目结构

```
backend/
├── app/
│   ├── main.py              # FastAPI 应用入口
│   ├── core/
│   │   ├── config.py        # 配置管理
│   │   ├── database.py      # 数据库连接
│   │   └── security.py      # 安全（JWT）
│   ├── models/              # SQLAlchemy 数据模型
│   │   ├── user.py
│   │   ├── therapist.py
│   │   ├── service.py
│   │   ├── booking.py
│   │   ├── order.py
│   │   ├── review.py
│   │   └── coupon.py
│   ├── schemas/             # Pydantic 请求/响应模型
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── therapist.py
│   │   ├── service.py
│   │   └── booking.py
│   ├── api/
│   │   ├── deps.py          # 依赖注入
│   │   └── v1/              # API v1 路由
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── services.py
│   │       ├── therapists.py
│   │       └── bookings.py
│   └── services/            # 业务逻辑（可选）
├── alembic/                 # 数据库迁移
├── tests/                   # 测试
├── requirements.txt
├── .env.example
└── README.md
```

## 🔌 API 接口

### 认证
- `POST /api/v1/auth/send-code` - 发送验证码
- `POST /api/v1/auth/login` - 手机号登录
- `POST /api/v1/auth/refresh` - 刷新 Token

### 用户
- `GET /api/v1/users/me` - 获取当前用户信息
- `PUT /api/v1/users/me` - 更新用户信息
- `GET /api/v1/users/me/addresses` - 获取地址列表
- `POST /api/v1/users/me/addresses` - 添加地址
- `GET /api/v1/users/me/favorites` - 获取收藏列表

### 服务
- `GET /api/v1/services/categories` - 获取服务分类
- `GET /api/v1/services` - 获取服务列表
- `GET /api/v1/services/{id}` - 获取服务详情
- `GET /api/v1/services/{id}/therapists` - 获取提供该服务的治疗师

### 治疗师
- `GET /api/v1/therapists` - 获取治疗师列表
- `GET /api/v1/therapists/{id}` - 获取治疗师详情
- `GET /api/v1/therapists/{id}/services` - 获取治疗师服务
- `GET /api/v1/therapists/{id}/availability` - 获取可用时段
- `GET /api/v1/therapists/{id}/reviews` - 获取评价

### 预约
- `POST /api/v1/bookings/preview-price` - 价格预览
- `POST /api/v1/bookings` - 创建预约
- `GET /api/v1/bookings` - 获取预约列表
- `GET /api/v1/bookings/{id}` - 获取预约详情
- `POST /api/v1/bookings/{id}/cancel` - 取消预约

## 🧪 测试

```bash
# 运行测试
pytest

# 运行测试并显示覆盖率
pytest --cov=app
```

## 📦 部署

### Docker

```bash
# 构建镜像
docker build -t landa-api .

# 运行容器
docker run -d -p 8000:8000 --env-file .env landa-api
```

### Docker Compose

```bash
docker-compose up -d
```

## 📝 开发说明

### 代码规范

```bash
# 格式化代码
black app/

# 排序 import
isort app/
```

### 数据库迁移

```bash
# 生成迁移文件
alembic revision --autogenerate -m "描述"

# 执行迁移
alembic upgrade head

# 回滚
alembic downgrade -1
```

