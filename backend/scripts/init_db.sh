#!/bin/bash
# 数据库初始化脚本

set -e

echo "🚀 初始化 Landa 数据库..."

# 等待 PostgreSQL 就绪
echo "⏳ 等待 PostgreSQL 启动..."
until pg_isready -h db -p 5432 -U postgres; do
    sleep 1
done
echo "✅ PostgreSQL 已就绪"

# 运行数据库迁移
echo "📦 运行数据库迁移..."
alembic upgrade head
echo "✅ 迁移完成"

# 初始化测试数据
echo "📝 初始化测试数据..."
python scripts/seed_data.py
echo "✅ 测试数据已创建"

echo "🎉 数据库初始化完成!"

