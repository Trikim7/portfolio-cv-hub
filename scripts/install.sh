#!/usr/bin/env bash
# =============================================================================
# Portfolio CV Hub — Script cài đặt một lệnh (dành cho giảng viên / reviewer)
# =============================================================================
# Yêu cầu: Docker Desktop đang chạy
#
# Chạy từ thư mục gốc repo:
#   chmod +x scripts/install.sh
#   ./scripts/install.sh
#
# Script thực hiện:
#   1. Kiểm tra Docker / Compose
#   2. cp .env.example .env (nếu chưa có)
#   3. docker compose up --build -d
#   4. Chờ Backend + Frontend
#   5. In URL + tài khoản demo để đăng nhập test
#
# Dừng: ./scripts/stop.sh
# Reset DB: docker compose down -v && ./scripts/install.sh
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

echo ""
echo "========================================"
echo "  Portfolio CV Hub — Cài đặt (Docker)"
echo "========================================"
echo ""

if ! command -v docker >/dev/null 2>&1; then
  error "Chưa cài Docker. Tải: https://www.docker.com/products/docker-desktop/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  error "Docker chưa chạy. Mở Docker Desktop rồi chạy lại script."
  exit 1
fi

COMPOSE_CMD=""
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  error "Không tìm thấy Docker Compose."
  exit 1
fi

info "Sử dụng: $COMPOSE_CMD"

if [[ ! -f .env ]]; then
  info "Tạo file .env từ .env.example"
  cp .env.example .env
else
  warn "Đã có .env — giữ nguyên"
fi

info "Khởi động stack: $COMPOSE_CMD up --build -d"
info "(PostgreSQL + Backend + Frontend — lần đầu có thể mất vài phút)"
$COMPOSE_CMD up --build -d

info "Chờ http://localhost:8000/health và http://localhost:3000 ..."
MAX_WAIT=300
ELAPSED=0
BACKEND_OK=0
FRONTEND_OK=0

while [[ $ELAPSED -lt $MAX_WAIT ]]; do
  if [[ $BACKEND_OK -eq 0 ]] && curl -sf "http://localhost:8000/health" >/dev/null 2>&1; then
    BACKEND_OK=1
    info "Backend OK"
  fi
  if [[ $FRONTEND_OK -eq 0 ]] && curl -sf -o /dev/null "http://localhost:3000" 2>/dev/null; then
    FRONTEND_OK=1
    info "Frontend OK"
  fi
  if [[ $BACKEND_OK -eq 1 && $FRONTEND_OK -eq 1 ]]; then
    break
  fi
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

echo ""
echo "========================================"
echo "  ✅ Cài đặt hoàn tất"
echo "========================================"
echo ""
echo "  🌐 Frontend:  http://localhost:3000"
echo "  ⚡ Backend:   http://localhost:8000"
echo "  📖 Swagger:   http://localhost:8000/docs"
echo ""
echo "  ── Tài khoản demo (đăng nhập tại /auth/login) ──"
echo ""
echo "  | Vai trò              | Email                        | Mật khẩu     |"
echo "  |----------------------|------------------------------|--------------|"
echo "  | Quản trị (Admin)     | admin@portfoliocvhub.com     | admin123     |"
echo "  | Doanh nghiệp         | recruiter@portfoliocvhub.com | recruiter123 |"
echo "  | Ứng viên             | candidate@portfoliocvhub.com | candidate123 |"
echo ""
echo "  Portfolio ứng viên mẫu (công khai):"
echo "    http://localhost:3000/portfolio/ung-vien"
echo ""
echo "  Log:   $COMPOSE_CMD logs -f"
echo "  Dừng:  ./scripts/stop.sh"
echo "  Reset: $COMPOSE_CMD down -v && ./scripts/install.sh"
echo ""
[[ $BACKEND_OK -eq 0 || $FRONTEND_OK -eq 0 ]] && \
  warn "Chưa phản hồi đủ — xem log: $COMPOSE_CMD logs -f"
echo ""
