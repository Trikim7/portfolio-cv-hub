# Portfolio CV Hub

Hệ thống quản lý Portfolio và CV trực tuyến — kết nối **Ứng viên**, **Nhà tuyển dụng** và **Quản trị viên** trên một nền tảng duy nhất.

| Vai trò | Chức năng chính |
|---------|----------------|
| **Ứng viên** | Tạo portfolio, quản lý kỹ năng / kinh nghiệm / dự án, upload CV, xem CV inline, bật/tắt hồ sơ công khai |
| **Nhà tuyển dụng** | Đăng ký doanh nghiệp (chờ duyệt), tìm kiếm ứng viên full-text, gửi lời mời tuyển dụng, AI Ranking |
| **Admin** | Dashboard tổng quan, quản lý ứng viên, duyệt / từ chối / khóa doanh nghiệp |

**Tech Stack:** FastAPI · Next.js 14 · PostgreSQL · SQLAlchemy · Alembic · Cloudinary · TailwindCSS · TypeScript · Docker

---

## Yêu cầu hệ thống

**Cách 1 — Docker (khuyên dùng):** chỉ cần **Docker Desktop** (đã bao gồm Docker Compose).

**Cách 2 — Chạy thủ công:**
- Python 3.9+
- Node.js 18+
- npm (đi kèm Node.js)
- PostgreSQL 14+
- Git

---

## Cách 1: Chạy bằng Docker (nhanh nhất)

**Bước 1: Thiết lập biến môi trường (.env)**

```bash
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin thực của bạn (DB, Cloudinary, JWT secret...).

**Bước 2: Chạy hệ thống**

```bash
docker-compose up --build
```

Sau khi chạy xong:
- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:8000**
- Swagger docs: **http://localhost:8000/docs**

Dừng hệ thống:

```bash
docker-compose down
```

---

## Cách 2: Chạy thủ công (development)

### Backend (FastAPI)

```bash
cd backend
cp .env.example .env
```

Tạo môi trường ảo và cài dependencies:

```bash
# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate

# Windows (PowerShell)
py -m venv .venv
.venv\Scripts\Activate.ps1
```

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

- API server: **http://localhost:8000**
- Swagger docs: **http://localhost:8000/docs**
- Lần chạy đầu, Alembic tự động tạo database + tất cả bảng + tài khoản admin mặc định.

### Frontend (Next.js)

Mở terminal mới (giữ backend chạy):

```bash
cd frontend
cp .env.example .env.local   # chỉnh NEXT_PUBLIC_API_URL nếu cần
npm install
npm run dev
```

- Giao diện web: **http://localhost:3000**

---

## Biến môi trường quan trọng

| Biến | Ví dụ | Mô tả |
|------|-------|-------|
| `DATABASE_URL` | `postgresql://user:pass@localhost/dbname` | Kết nối PostgreSQL |
| `SECRET_KEY` | `your-secret-key` | JWT signing key |
| `CLOUDINARY_CLOUD_NAME` | `mycloud` | Cloudinary upload CV/avatar |
| `CLOUDINARY_API_KEY` | `...` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `...` | Cloudinary API secret |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL dùng trong frontend |

---

## Tài khoản mặc định

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | `admin@portfoliocvhub.com` | `admin123` |

Ứng viên và Nhà tuyển dụng tự đăng ký qua giao diện.

---

## Luồng sử dụng

1. **Ứng viên** → Đăng ký → Đăng nhập → Tạo portfolio (thông tin, kỹ năng, kinh nghiệm, dự án, upload CV) → Bật công khai → Chia sẻ link `portfolio/{slug}`
2. **Nhà tuyển dụng** → Đăng ký doanh nghiệp → Chờ Admin duyệt → Đăng nhập → Tìm kiếm ứng viên → Gửi lời mời tuyển dụng → AI Ranking
3. **Khách vãng lai** → Trang chủ → Tìm kiếm ứng viên công khai (không cần đăng nhập) → Xem portfolio
4. **Admin** → Đăng nhập → Dashboard tổng quan → Duyệt doanh nghiệp → Quản lý ứng viên / khóa tài khoản

---

## Tính năng nổi bật

### Trang chủ (Public)
- Hero section với search bar tìm kiếm ứng viên không cần đăng nhập
- Số liệu thống kê thực từ database (tổng ứng viên, lượt xem, lời mời)
- Hiển thị ứng viên nổi bật theo lượt xem
- Hướng dẫn "Cách hoạt động" với SVG icon đơn sắc

### Tìm kiếm (Public — `/search`)
- Full-text search: tìm trong `full_name`, `headline`, `bio` **và skill names**
- Quick tags lọc nhanh theo kỹ năng phổ biến
- Không yêu cầu đăng nhập

### CV
- **Xem CV** (dashboard ứng viên): mở inline trong browser tab (`Content-Disposition: inline`)
- **Tải CV** (trang portfolio công khai): buộc tải xuống (`Content-Disposition: attachment`)
- Hỗ trợ Cloudinary URL và file lưu local

### AI Ranking (Nhà tuyển dụng)
- Đánh giá và xếp hạng ứng viên theo tiêu chí tùy chỉnh
- Lưu lịch sử ranking, so sánh ứng viên

---

## Database Migration (Alembic)

Migration tự động chạy khi khởi động server.

Khi thay đổi model:

```bash
cd backend

# Tạo migration file
python3 -m alembic revision --autogenerate -m "mô tả thay đổi"

# Áp dụng vào database
python3 -m alembic upgrade head
```

Các lệnh hữu ích:

```bash
python3 -m alembic current       # Revision hiện tại
python3 -m alembic history       # Lịch sử migration
python3 -m alembic downgrade -1  # Rollback 1 bước
python3 -m alembic check         # Kiểm tra model chưa migrate
```

---

## Cấu trúc dự án

```text
portfolio-cv-hub/
├── docker-compose.yml
├── .env.example                  # Template biến môi trường
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py           # Đăng ký / đăng nhập
│   │   │   ├── candidate.py      # CRUD profile, CV upload/view/download
│   │   │   ├── recruiter.py      # Tìm kiếm, lời mời, AI ranking
│   │   │   ├── admin.py          # Quản lý users, doanh nghiệp
│   │   │   └── public.py         # Stats & featured candidates (no auth)
│   │   ├── core/                 # JWT, password hashing, config
│   │   ├── db/                   # SQLAlchemy engine & session
│   │   ├── models/               # ORM models
│   │   ├── repositories/         # Data access layer
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Business logic
│   │   └── main.py               # Entry point + auto-migrate
│   ├── alembic/
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx          # Trang chủ (hero, stats, featured)
        │   ├── search/           # Trang tìm kiếm công khai
        │   ├── portfolio/        # Public portfolio view ([slug])
        │   ├── (dashboard)/      # Candidate dashboard
        │   ├── recruiter/        # Recruiter pages
        │   ├── admin/            # Admin pages
        │   ├── login/
        │   └── register/
        ├── components/
        │   ├── dashboard/        # CV, Skills, Experiences, Projects managers
        │   ├── layout/           # Navbar (ẩn tự động theo route)
        │   └── recruiter/        # Search, invitations, ranking
        ├── hooks/                # AuthContext, ProfileContext
        ├── services/api.ts       # Axios client + tất cả API methods
        └── types/                # TypeScript interfaces
```

---

## API Endpoints

| Module | Prefix | Chức năng |
|--------|--------|-----------|
| Auth | `/api/auth` | Đăng ký, đăng nhập, recruiter register |
| Candidate | `/api/candidate` | Profile CRUD, skills, experiences, projects, CV view/download |
| Recruiter | `/api/recruiter` | Tìm kiếm ứng viên (full-text + skill), lời mời, AI ranking |
| Admin | `/api/admin` | Stats, quản lý users, duyệt doanh nghiệp |
| Public | `/api/public` | Stats trang chủ, danh sách ứng viên nổi bật (no auth) |

Chi tiết đầy đủ tại **http://localhost:8000/docs** (Swagger UI).
