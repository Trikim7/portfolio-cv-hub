#!/usr/bin/env bash
# Dừng stack Docker Portfolio CV Hub.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if docker compose version >/dev/null 2>&1; then
  docker compose down
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose down
else
  echo "Không tìm thấy Docker Compose."
  exit 1
fi

echo "Đã dừng containers (db, backend, frontend)."
echo "Xóa luôn dữ liệu DB: docker compose down -v"
