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
echo "▶  [1/4] Chạy database migrations..."
alembic upgrade head
echo "✅  Migrations hoàn tất."

# ---------------------------------------------------------------------------
# 2. Tài khoản demo (admin, doanh nghiệp, ứng viên) — luôn chạy, idempotent
# ---------------------------------------------------------------------------
echo ""
echo "▶  [2/4] Tạo tài khoản demo (admin / doanh nghiệp / ứng viên)..."
python -m app.db.default_accounts
echo "✅  Tài khoản demo sẵn sàng."

# ---------------------------------------------------------------------------
# 3. Seed dữ liệu Phase 2 (tùy chọn — bỏ qua nếu DB đã có user)
# ---------------------------------------------------------------------------
echo ""
echo "▶  [3/4] Seed dữ liệu mở rộng (nếu DB trống)..."
python -m app.db.seed
echo "✅  Bước seed hoàn tất."

# ---------------------------------------------------------------------------
# 3. Khởi động FastAPI server
# ---------------------------------------------------------------------------
echo ""
echo "▶  [4/4] Khởi động Uvicorn server..."
echo "========================================"

exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1
