# Portfolio CV Hub

Nền tảng quản lý Portfolio và CV trực tuyến, kết nối Ứng viên, Nhà tuyển dụng và Quản trị viên trên một hệ thống duy nhất.

## Tổng quan

| Vai trò | Chức năng chính |
<<<<<<< HEAD
|---|---|
| Ứng viên | Tạo và quản lý portfolio cá nhân (kỹ năng, kinh nghiệm, dự án), upload CV, bật/tắt chế độ công khai hồ sơ |
| Nhà tuyển dụng | Đăng ký tài khoản doanh nghiệp (chờ Admin phê duyệt), tìm kiếm ứng viên, gửi lời mời tuyển dụng |
| Admin | Xem Dashboard tổng quan, quản lý người dùng, phê duyệt hoặc khóa tài khoản doanh nghiệp |

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | FastAPI, SQLAlchemy, Alembic, SQLite |
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Hạ tầng | Docker, Docker Compose |
=======
|---------|----------------|
| **Ứng viên** | Tạo portfolio, quản lý kỹ năng / kinh nghiệm / dự án, upload CV, xem CV inline, bật/tắt hồ sơ công khai |
| **Nhà tuyển dụng** | Đăng ký doanh nghiệp (chờ duyệt), tìm kiếm ứng viên full-text, gửi lời mời tuyển dụng, AI Ranking |
| **Admin** | Dashboard tổng quan, quản lý ứng viên, duyệt / từ chối / khóa doanh nghiệp |

**Tech Stack:** FastAPI · Next.js 14 · PostgreSQL · SQLAlchemy · Alembic · Cloudinary · TailwindCSS · TypeScript · Docker
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff

---

## Yêu cầu hệ thống

**Chạy bằng Docker (khuyên dùng):** Chỉ cần cài đặt Docker Desktop (đã bao gồm Docker Compose).

**Chạy thủ công:**
- Python 3.9 trở lên
- Node.js 18 trở lên
- npm (đi kèm Node.js)
- PostgreSQL 14+
- Git

---

## Hướng dẫn cài đặt và chạy

<<<<<<< HEAD
### Cách 1: Docker (nhanh nhất)

Chỉ cần một lệnh duy nhất để build và khởi động toàn bộ hệ thống:
=======
**Bước 1: Thiết lập biến môi trường (.env)**

```bash
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin thực của bạn (DB, Cloudinary, JWT secret...).

**Bước 2: Chạy hệ thống**
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff

```bash
docker-compose up --build
```

Sau khi khởi động:

| Dịch vụ | Địa chỉ |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

Dừng hệ thống:

```bash
docker-compose down
```

<<<<<<< HEAD
Xóa dữ liệu và reset database:

```bash
docker-compose down
rm backend/portfolio_cv_hub.db
```

=======
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff
---

### Cách 2: Chạy thủ công (môi trường phát triển)

#### Backend (FastAPI)

```bash
cd backend
cp .env.example .env
```

<<<<<<< HEAD
Tạo và kích hoạt môi trường ảo:
=======
Tạo môi trường ảo và cài dependencies:
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff

```bash
# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate

# Windows (PowerShell)
py -m venv .venv
.venv\Scripts\Activate.ps1
```

<<<<<<< HEAD
Cài đặt thư viện và khởi động server:

=======
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff
```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

<<<<<<< HEAD
Server sẽ chạy tại http://localhost:8000. Ở lần khởi động đầu tiên, Alembic sẽ tự động tạo database, các bảng và tài khoản Admin mặc định.
=======
- API server: **http://localhost:8000**
- Swagger docs: **http://localhost:8000/docs**
- Lần chạy đầu, Alembic tự động tạo database + tất cả bảng + tài khoản admin mặc định.
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff

#### Frontend (Next.js)

Mở một terminal mới (giữ backend đang chạy):

```bash
cd frontend
cp .env.example .env.local   # chỉnh NEXT_PUBLIC_API_URL nếu cần
npm install
npm run dev
```

Giao diện web sẽ chạy tại http://localhost:3000.

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
|---|---|---|
| Admin | admin@portfoliocvhub.com | admin123 |

Tài khoản Ứng viên và Nhà tuyển dụng được tạo thông qua chức năng đăng ký trên giao diện.

---

## Luồng sử dụng

<<<<<<< HEAD
1. **Ứng viên:** Đăng ký tài khoản → Đăng nhập → Tạo portfolio (thông tin cá nhân, kỹ năng, kinh nghiệm, dự án, upload CV) → Bật chế độ công khai hồ sơ.
2. **Nhà tuyển dụng:** Đăng ký tài khoản doanh nghiệp → Chờ Admin phê duyệt → Đăng nhập → Tìm kiếm ứng viên → Gửi lời mời tuyển dụng.
3. **Admin:** Đăng nhập → Xem Dashboard tổng quan → Phê duyệt hoặc từ chối doanh nghiệp → Quản lý người dùng.
=======
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
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff

---

## Quản lý Database Migration (Alembic)

<<<<<<< HEAD
Migration được cấu hình tự động chạy khi khởi động server. Khi thay đổi model (thêm cột, sửa kiểu dữ liệu...), thực hiện các bước sau:
=======
Migration tự động chạy khi khởi động server.

Khi thay đổi model:
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff

```bash
cd backend

<<<<<<< HEAD
# Tạo file migration tự động dựa trên thay đổi model
python3 -m alembic revision --autogenerate -m "mô tả thay đổi"

# Áp dụng migration vào database
=======
# Tạo migration file
python3 -m alembic revision --autogenerate -m "mô tả thay đổi"

# Áp dụng vào database
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff
python3 -m alembic upgrade head
```

Các lệnh hữu ích khác:

```bash
<<<<<<< HEAD
python3 -m alembic current      # Xem revision đang áp dụng
python3 -m alembic history      # Xem toàn bộ lịch sử migration
python3 -m alembic downgrade -1 # Rollback về migration trước đó
python3 -m alembic check        # Kiểm tra model có thay đổi chưa được migrate
=======
python3 -m alembic current       # Revision hiện tại
python3 -m alembic history       # Lịch sử migration
python3 -m alembic downgrade -1  # Rollback 1 bước
python3 -m alembic check         # Kiểm tra model chưa migrate
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff
```

---

## Cấu trúc dự án

```
portfolio-cv-hub/
├── docker-compose.yml
<<<<<<< HEAD
├── backend/
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   └── app/
│       ├── main.py              # Entry point, tự động chạy Alembic khi khởi động
│       ├── api/                 # Các endpoint (auth, candidate, recruiter, admin)
│       ├── core/                # Cấu hình, bảo mật (JWT, password hashing)
│       ├── db/                  # Kết nối database (SQLAlchemy)
│       ├── models/              # ORM Models (User, CandidateProfile, Company,...)
│       ├── repositories/        # Data access layer
│       ├── schemas/             # Pydantic schemas (request/response)
│       └── services/            # Business logic
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── app/
        │   ├── admin/           # Trang Admin (dashboard, users, companies)
        │   ├── (dashboard)/     # Trang dashboard Ứng viên
        │   ├── recruiter/       # Trang Nhà tuyển dụng (dashboard, search, register)
        │   ├── login/           # Trang đăng nhập
        │   ├── register/        # Trang đăng ký Ứng viên
        │   └── portfolio/       # Trang public portfolio
        ├── components/
        │   ├── admin/
        │   ├── auth/
        │   ├── dashboard/
        │   ├── layout/
        │   └── recruiter/
        ├── hooks/               # AuthContext, ProfileContext, useAuth
        ├── services/            # API client (axios)
        └── types/               # TypeScript type definitions
=======
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
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff
```

---

## API Endpoints

<<<<<<< HEAD
| Module | Prefix | Mô tả |
|---|---|---|
| Auth | `/api/auth` | Đăng ký, đăng nhập, lấy thông tin người dùng hiện tại |
| Candidate | `/api/candidate` | Quản lý profile, kỹ năng, kinh nghiệm, dự án, CV, public portfolio |
| Recruiter | `/api/recruiter` | Profile công ty, tìm kiếm ứng viên, gửi và quản lý lời mời |
| Admin | `/api/admin` | Thống kê dashboard, quản lý người dùng, phê duyệt doanh nghiệp |
=======
| Module | Prefix | Chức năng |
|--------|--------|-----------|
| Auth | `/api/auth` | Đăng ký, đăng nhập, recruiter register |
| Candidate | `/api/candidate` | Profile CRUD, skills, experiences, projects, CV view/download |
| Recruiter | `/api/recruiter` | Tìm kiếm ứng viên (full-text + skill), lời mời, AI ranking |
| Admin | `/api/admin` | Stats, quản lý users, duyệt doanh nghiệp |
| Public | `/api/public` | Stats trang chủ, danh sách ứng viên nổi bật (no auth) |
>>>>>>> 411602cf80c9732fb4fcd4ae8ba7ae8ca7af73ff

Xem chi tiết đầy đủ tại Swagger UI: http://localhost:8000/docs
