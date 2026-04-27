# Portfolio CV Hub

Nền tảng quản lý Portfolio và CV trực tuyến, kết nối Ứng viên, Nhà tuyển dụng và Quản trị viên trên một hệ thống duy nhất.

## Tổng quan

| Vai trò | Chức năng chính |
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

---

## Yêu cầu hệ thống

**Chạy bằng Docker (khuyên dùng):** Chỉ cần cài đặt Docker Desktop (đã bao gồm Docker Compose).

**Chạy thủ công:**
- Python 3.9 trở lên
- Node.js 18 trở lên
- npm (đi kèm Node.js)
- Git

---

## Hướng dẫn cài đặt và chạy

### Cách 1: Docker (nhanh nhất)

Chỉ cần một lệnh duy nhất để build và khởi động toàn bộ hệ thống:

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

Xóa dữ liệu và reset database:

```bash
docker-compose down
rm backend/portfolio_cv_hub.db
```

---

### Cách 2: Chạy thủ công (môi trường phát triển)

#### Backend (FastAPI)

```bash
cd backend
```

Tạo và kích hoạt môi trường ảo:

```bash
# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate

# Windows (PowerShell)
py -m venv .venv
.venv\Scripts\Activate.ps1
```

Cài đặt thư viện và khởi động server:

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Server sẽ chạy tại http://localhost:8000. Ở lần khởi động đầu tiên, Alembic sẽ tự động tạo database, các bảng và tài khoản Admin mặc định.

#### Frontend (Next.js)

Mở một terminal mới (giữ backend đang chạy):

```bash
cd frontend
npm install
npm run dev
```

Giao diện web sẽ chạy tại http://localhost:3000.

---

## Tài khoản mặc định

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@portfoliocvhub.com | admin123 |

Tài khoản Ứng viên và Nhà tuyển dụng được tạo thông qua chức năng đăng ký trên giao diện.

---

## Luồng sử dụng

1. **Ứng viên:** Đăng ký tài khoản → Đăng nhập → Tạo portfolio (thông tin cá nhân, kỹ năng, kinh nghiệm, dự án, upload CV) → Bật chế độ công khai hồ sơ.
2. **Nhà tuyển dụng:** Đăng ký tài khoản doanh nghiệp → Chờ Admin phê duyệt → Đăng nhập → Tìm kiếm ứng viên → Gửi lời mời tuyển dụng.
3. **Admin:** Đăng nhập → Xem Dashboard tổng quan → Phê duyệt hoặc từ chối doanh nghiệp → Quản lý người dùng.

---

## Quản lý Database Migration (Alembic)

Migration được cấu hình tự động chạy khi khởi động server. Khi thay đổi model (thêm cột, sửa kiểu dữ liệu...), thực hiện các bước sau:

```bash
cd backend

# Tạo file migration tự động dựa trên thay đổi model
python3 -m alembic revision --autogenerate -m "mô tả thay đổi"

# Áp dụng migration vào database
python3 -m alembic upgrade head
```

Các lệnh hữu ích khác:

```bash
python3 -m alembic current      # Xem revision đang áp dụng
python3 -m alembic history      # Xem toàn bộ lịch sử migration
python3 -m alembic downgrade -1 # Rollback về migration trước đó
python3 -m alembic check        # Kiểm tra model có thay đổi chưa được migrate
```

---

## Cấu trúc dự án

```
portfolio-cv-hub/
├── docker-compose.yml
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
```

---

## API Endpoints

| Module | Prefix | Mô tả |
|---|---|---|
| Auth | `/api/auth` | Đăng ký, đăng nhập, lấy thông tin người dùng hiện tại |
| Candidate | `/api/candidate` | Quản lý profile, kỹ năng, kinh nghiệm, dự án, CV, public portfolio |
| Recruiter | `/api/recruiter` | Profile công ty, tìm kiếm ứng viên, gửi và quản lý lời mời |
| Admin | `/api/admin` | Thống kê dashboard, quản lý người dùng, phê duyệt doanh nghiệp |

Xem chi tiết đầy đủ tại Swagger UI: http://localhost:8000/docs
