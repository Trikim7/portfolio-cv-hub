# Portfolio CV Hub

Hệ thống quản lý Portfolio và CV trực tuyến — kết nối **Ứng viên**, **Nhà tuyển dụng** và **Quản trị viên** trên một nền tảng duy nhất.

| Vai trò | Chức năng chính |
|---------|----------------|
| **Ứng viên** | Tạo portfolio, quản lý kỹ năng / kinh nghiệm / dự án, upload CV, bật/tắt hồ sơ công khai |
| **Nhà tuyển dụng** | Đăng ký doanh nghiệp (chờ duyệt), tìm kiếm ứng viên, gửi lời mời tuyển dụng |
| **Admin** | Dashboard tổng quan, quản lý ứng viên, duyệt / từ chối / khóa doanh nghiệp |

**Tech Stack:** FastAPI · Next.js 14 · SQLAlchemy · Alembic · SQLite · TailwindCSS · TypeScript · Docker

---

## Yêu cầu hệ thống

**Cách 1 — Docker (khuyên dùng):** chỉ cần **Docker Desktop** (đã bao gồm Docker Compose).

**Cách 2 — Chạy thủ công:**
- Python 3.9+
- Node.js 18+
- npm (đi kèm Node.js)
- Git

---

## Cách 1: Chạy bằng Docker (nhanh nhất)

Chỉ cần 1 lệnh, Docker sẽ tự build và chạy cả Backend lẫn Frontend:

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

Xóa sạch dữ liệu (reset DB):

```bash
docker-compose down
rm backend/portfolio_cv_hub.db
```

---

## Cách 2: Chạy thủ công (development)

### Backend (FastAPI)

```bash
cd backend
```

Tạo môi trường ảo:

```bash
# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate

# Windows (PowerShell)
py -m venv .venv
.venv\Scripts\Activate.ps1
```

Cài thư viện và chạy:

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

- API server: **http://localhost:8000**
- Swagger docs: **http://localhost:8000/docs**
- Lần chạy đầu tiên, Alembic tự động tạo database + tất cả bảng + tài khoản admin mặc định.

### Frontend (Next.js)

Mở terminal mới (giữ backend chạy):

```bash
cd frontend
npm install
npm run dev
```

- Giao diện web: **http://localhost:3000**

---

## Tài khoản mặc định

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | `admin@portfoliocvhub.com` | `admin123` |

Ứng viên và Nhà tuyển dụng tự đăng ký qua giao diện.

---

## Luồng sử dụng cơ bản

1. **Ứng viên** → Đăng ký → Đăng nhập → Tạo portfolio (thông tin, kỹ năng, kinh nghiệm, dự án, upload CV) → Bật công khai
2. **Nhà tuyển dụng** → Đăng ký doanh nghiệp → Chờ Admin duyệt → Đăng nhập → Tìm kiếm ứng viên → Gửi lời mời
3. **Admin** → Đăng nhập → Dashboard tổng quan → Duyệt doanh nghiệp → Quản lý ứng viên / khóa tài khoản

---

## Database Migration (Alembic)

Project sử dụng **Alembic** để quản lý schema database. Migration tự động chạy khi khởi động server (cả Docker lẫn thủ công).

Khi thay đổi model (thêm cột, sửa kiểu dữ liệu...):

```bash
cd backend

# Tạo migration file tự động
python3 -m alembic revision --autogenerate -m "mô tả thay đổi"

# Áp dụng vào database (giữ nguyên dữ liệu)
python3 -m alembic upgrade head
```

Các lệnh hữu ích:

```bash
python3 -m alembic current       # Xem revision hiện tại
python3 -m alembic history       # Xem lịch sử migration
python3 -m alembic downgrade -1  # Rollback 1 bước
python3 -m alembic check         # Kiểm tra model có thay đổi chưa migrate
```

---

## Cấu trúc dự án

```text
portfolio-cv-hub/
├── docker-compose.yml           # Orchestration (1 lệnh chạy cả hệ thống)
│
├── backend/
│   ├── Dockerfile               # Container image cho Backend
│   ├── app/
│   │   ├── api/                 # Endpoints (auth, candidate, recruiter, admin)
│   │   ├── core/                # Config, Security (JWT, hashing)
│   │   ├── db/                  # Database connection (SQLAlchemy)
│   │   ├── models/              # ORM Models (User, CandidateProfile, Company, ...)
│   │   ├── repositories/        # Data access layer (queries)
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # Business logic layer
│   │   └── main.py              # App entry point + Alembic auto-migrate
│   ├── alembic/
│   │   ├── env.py               # Alembic config (đọc DB URL từ app settings)
│   │   ├── script.py.mako       # Template migration file
│   │   └── versions/            # Migration files (theo thứ tự thời gian)
│   ├── alembic.ini              # Alembic config chính
│   └── requirements.txt         # Python dependencies
│
└── frontend/
    ├── Dockerfile               # Container image cho Frontend
    ├── src/
    │   ├── app/
    │   │   ├── admin/           # Admin pages (dashboard, users, companies, settings)
    │   │   ├── (dashboard)/     # Candidate dashboard
    │   │   ├── recruiter/       # Recruiter pages (dashboard, search, login, register)
    │   │   ├── login/           # Login page (chọn vai trò)
    │   │   ├── register/        # Candidate registration
    │   │   └── portfolio/       # Public portfolio view
    │   ├── components/
    │   │   ├── admin/           # AdminSidebar
    │   │   ├── auth/            # Login/Register forms
    │   │   ├── dashboard/       # Profile, Skills, Experiences, Projects, CV managers
    │   │   ├── layout/          # Navbar
    │   │   └── recruiter/       # Company profile, search, invitations
    │   ├── hooks/               # AuthContext, ProfileContext, useAuth
    │   ├── services/            # API client (axios)
    │   └── types/               # TypeScript type definitions
    ├── package.json
    └── tailwind.config.js
```

---

## API Endpoints

| Module | Prefix | Chức năng |
|--------|--------|-----------|
| Auth | `/api/auth` | Đăng ký, đăng nhập, đăng ký recruiter, lấy user hiện tại |
| Candidate | `/api/candidate` | CRUD profile, skills, experiences, projects, CVs, public portfolio |
| Recruiter | `/api/recruiter` | Profile công ty, tìm kiếm ứng viên, gửi/quản lý lời mời |
| Admin | `/api/admin` | Dashboard stats, quản lý users, duyệt doanh nghiệp |

Chi tiết đầy đủ tại **http://localhost:8000/docs** (Swagger UI).
