#!/bin/sh
# =============================================================================
# Docker Entrypoint — Portfolio CV Hub Backend
# =============================================================================
# Thứ tự khởi động:
#   1. Chờ PostgreSQL sẵn sàng (đã xử lý bởi healthcheck trong compose)
#   2. Chạy Alembic migrations (upgrade head)
#   3. Chạy seed dữ liệu mẫu (tự bỏ qua nếu DB đã có dữ liệu)
#   4. Khởi động uvicorn
# =============================================================================

set -e

echo "========================================"
echo "  Portfolio CV Hub — Docker Entrypoint"
echo "========================================"

# ---------------------------------------------------------------------------
# 1. Alembic migrations
# ---------------------------------------------------------------------------
echo ""
echo "▶  [1/3] Chạy database migrations..."
alembic upgrade head
echo "✅  Migrations hoàn tất."

# ---------------------------------------------------------------------------
# 2. Seed dữ liệu mẫu
# ---------------------------------------------------------------------------
echo ""
echo "▶  [2/3] Chạy seed dữ liệu mẫu..."
python -m app.db.seed
echo "✅  Seed hoàn tất."

# ---------------------------------------------------------------------------
# 3. Khởi động FastAPI server
# ---------------------------------------------------------------------------
echo ""
echo "▶  [3/3] Khởi động Uvicorn server..."
echo "========================================"

exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1
