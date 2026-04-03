# Portfolio CV Hub

Hệ thống quản lý Portfolio và CV dành cho ứng viên (Candidate) và giúp nhà tuyển dụng (Recruiter) tìm kiếm dễ dàng. Dự án bao gồm hai phần chính: **Backend** (FastAPI) và **Frontend** (Next.js).

---

## 🛠 Yêu cầu hệ thống (Prerequisites)

- **Python** 3.9 trở lên
- **Node.js** 18.x trở lên
- **npm** (đi kèm với Node.js)
- **Git**

---

## 1. Hướng dẫn cài đặt Backend (FastAPI)

Backend cung cấp các API xử lý dữ liệu, xác thực người dùng và lưu trữ hồ sơ. Mình sử dụng **SQLite** mặc định cho development.

### Bước 1: Khởi tạo môi trường ảo (Virtual Environment)

Mở terminal tại thư mục gốc của dự án:
```bash
cd backend
```

**Trên Windows (PowerShell):**
```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
```

**Trên macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Bước 2: Cài đặt thư viện phụ thuộc

```bash
pip install -r requirements.txt
```

### Bước 3: Chạy server Backend

Database SQLite sẽ được tự động tạo ở lần chạy đầu tiên.
```bash
uvicorn app.main:app --reload
```

Server backend sẽ chạy tại: **http://localhost:8000**  
Bạn có thể xem API Documentation (Swagger UI) tại: **http://localhost:8000/docs**

---

## 2. Hướng dẫn cài đặt Frontend (Next.js)

Frontend cung cấp giao diện hiển thị cho Ứng viên (quản lý CV/kỹ năng/dự án) và nhà tuyển dụng.

### Bước 1: Di chuyển vào thư mục frontend 

Mở một tab Terminal mới (giữ backend tiếp tục chạy ở tab kia):
```bash
cd frontend
```

### Bước 2: Cài đặt các gói thư viện Node (Dependencies)

```bash
npm install
```

### Bước 3: Chạy Frontend server

```bash
npm run dev
```

Giao diện web sẽ được khởi chạy tại: **http://localhost:3000**

---

## 3. Cách sử dụng (Luồng cơ bản)

1. Đảm bảo cả hai server (Backend ở Port `8000` và Frontend ở Port `3000`) đang hoạt động.
2. Truy cập Frontend: `http://localhost:3000`
3. Nhấn **Đăng ký (Register)** để tạo tài khoản Ứng viên mới.
   - Có thể test với:
     - Email: `test@example.com`
     - Password: `password123`
4. Sau khi **Đăng nhập**, bạn sẽ được chuyển hướng tới **Dashboard Ứng viên**, nơi có thể:
   - Cập nhật thông tin cá nhân.
   - Quản lý Kỹ Năng (Skills) & Dự Án (Projects).
   - Quản lý Kinh Nghiệm Làm Việc (Experiences).

*(Lưu ý: Auth Token mặc định đã được thiết lập hết hạn sau 7 ngày trong môi trường ảo development, giúp bạn không bị văng ra ngoài (lỗi 401 Unauthorized) khi đang thao tác).*

---

## Cấu trúc dự án

```text
portfolio-cv-hub/
├── backend/                  # Chứa toàn bộ logic API (FastAPI)
│   ├── app/
│   │   ├── api/              # Định nghĩa các Endpoints (Auth, Candidate...)
│   │   ├── core/             # Config, Security (JWT, Password Hashing)
│   │   ├── db/               # Kết nối Database (SQLAlchemy)
│   │   ├── models/           # Các Model cho Database
│   │   ├── schemas/          # Pydantic Schemas (Request/Response format)
│   │   └── services/         # Logic nghiệp vụ xử lý tương tác
│   ├── requirements.txt      # Danh sách packages Python
│   └── portfolio_cv_hub.db   # Database SQLite (Sinh ra khi chạy BE)
│
└── frontend/                 # Chứa giao diện (Next.js)
    ├── src/
    │   ├── app/              # Các routes giao diện (Dựa theo Next.js App Router)
    │   ├── components/       # Các thành phần tái sử dụng (UI, Form, Toast...)
    │   ├── hooks/            # Logic và Context kết nối API dùng chung
    │   ├── services/         # File định nghĩa API Client (gọi backend)
    │   └── types/            # Định nghĩa các Type (TypeScript)
    ├── package.json          # Danh sách packages Node
    └── tailwind.config.ts    # Cấu hình Tailwind CSS
```

---
