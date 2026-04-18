# Hướng dẫn chạy Portfolio CV Hub

Tài liệu này mô tả cách chạy toàn bộ hệ thống (PostgreSQL + Backend FastAPI + Frontend Next.js) bằng **Docker Compose**, và một số lệnh hữu ích.

---

## 1. Yêu cầu

- **Docker Desktop** (macOS / Windows) hoặc Docker Engine + Compose plugin (Linux).
- Khoảng **2–4 GB RAM** trống cho các container.

Kiểm tra:

```bash
docker --version
docker compose version
```

(Nếu máy bạn chỉ có lệnh cũ `docker-compose`, thay `docker compose` bằng `docker-compose` trong các ví dụ bên dưới.)

---

## 2. Chuẩn bị biến môi trường (tùy chọn)

Ở **thư mục gốc** repo:

```bash
cp .env.example .env
```

Chỉnh `.env` khi cần:

| Biến | Ý nghĩa |
|------|---------|
| `POSTGRES_HOST_PORT` | Cổng Postgres trên máy host (mặc định **5433** để tránh trùng Postgres local 5432). |
| `DATABASE_URL` | Trong Docker **không đổi** trừ khi bạn đổi user/db/password Postgres. |
| `SECRET_KEY` | Khóa ký JWT — đổi khi deploy thật. |
| OAuth (`GOOGLE_*`, `GITHUB_*`, `FACEBOOK_*`, `OAUTH_REDIRECT_BASE_URL`, `FRONTEND_BASE_URL`) | Chỉ cần khi test đăng nhập mạng xã hội. |

**Lưu ý:** Không commit file `.env` lên git.

---

## 3. Chạy bằng Docker (khuyên dùng)

Từ thư mục gốc project (nơi có `docker-compose.yml`):

```bash
docker compose up --build
```

Lần đầu sẽ build image backend + frontend và tải image Postgres; các lần sau có thể bỏ `--build` nếu không đổi `Dockerfile`:

```bash
docker compose up
```

Chạy nền (detach):

```bash
docker compose up -d --build
```

### Địa chỉ sau khi chạy

| Dịch vụ | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **Swagger / OpenAPI** | http://localhost:8000/docs |
| **PostgreSQL (từ máy host)** | `localhost:5433` (user/pass/db theo `.env`, mặc định `cvhub` / `cvhub_dev_pw` / `portfolio_cv_hub`) |

Backend tự chạy **Alembic `upgrade head`** khi khởi động và seed tài khoản admin mặc định (nếu chưa có).

### Tài khoản admin mặc định

| Email | Mật khẩu |
|-------|----------|
| `admin@portfoliocvhub.com` | `admin123` |

---

## 4. Dừng và dọn dẹp

Dừng container, giữ dữ liệu Postgres trong volume:

```bash
docker compose down
```

Xóa container **và** volume Postgres (reset database — mất hết dữ liệu DB):

```bash
docker compose down -v
```

---

## 5. Xem log / trạng thái

```bash
docker compose logs -f              # tất cả service
docker compose logs -f backend      # chỉ backend
docker compose ps                   # trạng thái container
```

---

## 6. Sự cố thường gặp

### Port đã được dùng

- **3000 / 8000 / 5433** bị chiếm: đóng ứng dụng khác hoặc sửa mapping port trong `docker-compose.yml` / `POSTGRES_HOST_PORT` trong `.env`.

### Frontend gọi sai API

- Image frontend build với `NEXT_PUBLIC_API_URL=http://localhost:8000` (trình duyệt gọi API trên máy bạn). Nếu đổi port backend, cần build lại image frontend với biến build phù hợp.

### OAuth (Google / GitHub / Facebook) redirect lỗi

- `OAUTH_REDIRECT_BASE_URL` phải trùng URL mà backend lắng nghe (local: `http://localhost:8000`).
- Callback đăng ký trên từng nhà cung cấp phải khớp với backend (ví dụ Facebook: `/api/auth/oauth/facebook/callback`).

### Database trống / lỗi migration

- Đảm bảo container `postgres` healthy rồi `backend` mới start (`depends_on` trong compose).
- Nếu schema lệch: vào container backend và chạy `alembic upgrade head` (thường không cần vì đã chạy lúc startup).

---

## 7. Chạy không dùng Docker (tóm tắt)

- Cài **PostgreSQL** local hoặc chỉ chạy service `postgres` bằng compose.
- `cd backend` → tạo venv → `pip install -r requirements.txt` → copy `backend/.env.example` thành `backend/.env` và chỉnh `DATABASE_URL` (ví dụ `localhost:5433` nếu Postgres map 5433).
- `uvicorn app.main:app --reload`
- Terminal khác: `cd frontend` → `npm install` → `npm run dev`

Chi tiết thêm có thể xem `README.md`.

---

## 8. Cấu trúc service trong `docker-compose.yml`

| Service | Vai trò |
|---------|---------|
| `postgres` | PostgreSQL 16, volume `postgres_data` |
| `backend` | FastAPI, port **8000**, mount `./backend/uploads` |
| `frontend` | Next.js production build, port **3000** |
