<div align="center">

  # 🌟 Portfolio CV Hub 🌟
  
  **Nền tảng kết nối ứng viên và nhà tuyển dụng toàn diện**
  
  *Quản lý Portfolio • CV • Tuyển dụng trong một hệ thống duy nhất*
  

  <p align="center">
    <a href="#gioi-thieu">Giới thiệu</a> •
    <a href="#tinh-nang-noi-bat">Tính năng</a> •
    <a href="#cong-nghe-su-dung">Công nghệ</a> •
    <a href="#huong-dan-cai-dat">Cài đặt</a> •
    <a href="#kien-truc-he-thong">Kiến trúc</a>
  </p>

  <p align="center">
    <a href="https://portfolio-cv-hub.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/🌍_Truy_cập_ngay_-_Link_Demo-2563EB?style=for-the-badge" alt="Link Demo" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/Frontend-Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
    <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
    <img src="https://img.shields.io/badge/ORM-SQLAlchemy-red?style=for-the-badge" alt="SQLAlchemy"/>
    <img src="https://img.shields.io/badge/Infra-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  </p>
</div>

---

<a id="gioi-thieu"></a>
## 🎯 Giới thiệu

**Portfolio CV Hub** là một hệ thống web full-stack hiện đại, được thiết kế để xóa bỏ khoảng cách giữa ứng viên và nhà tuyển dụng. Thay vì chỉ sử dụng những bản CV tĩnh nhàm chán, hệ thống của chúng tôi biến hồ sơ của bạn thành các trang **Portfolio** sinh động, có cấu trúc, giúp doanh nghiệp dễ dàng tìm kiếm, đánh giá và đưa ra quyết định chính xác nhất.

Hệ thống phục vụ 3 nhóm người dùng chính:
- 👨‍💻 **Ứng viên**: Quản lý hồ sơ, kỹ năng, dự án cá nhân, upload CV và chia sẻ Portfolio công khai dễ dàng.
- 🏢 **Nhà tuyển dụng**: Đăng ký hồ sơ doanh nghiệp, tìm kiếm ứng viên tiềm năng, gửi lời mời và sử dụng sức mạnh của **AI Ranking** để xếp hạng ứng viên.
- 🛠️ **Quản trị viên (Admin)**: Dashboard thống kê, kiểm duyệt doanh nghiệp và quản lý toàn bộ hệ thống.

---

<a id="tinh-nang-noi-bat"></a>
## ✨ Tính năng nổi bật

<table>
<tr>
<td width="33%">

### 👨‍💻 Dành cho Ứng viên
* **Quản lý Profile 360°:** Cập nhật thông tin cá nhân, kỹ năng, kinh nghiệm, và các dự án thực tế.
* **Smart CV Management:** Upload, lưu trữ và quản lý CV dễ dàng.
* **Public Portfolio:** Tạo link Portfolio cá nhân (theo định dạng `slug`) để chia sẻ tới bất kỳ ai chỉ với một cú click.

</td>
<td width="33%">

### 🏢 Dành cho Nhà Tuyển Dụng
* **Xác thực Doanh Nghiệp:** Quy trình đăng ký và xét duyệt minh bạch.
* **Advanced Search:** Lọc ứng viên cực nhanh theo từ khóa và kỹ năng chuyên môn.
* **AI Candidate Ranking:** 🤖 Tự động chấm điểm và xếp hạng ứng viên dựa trên mức độ phù hợp với yêu cầu công việc.
* **Direct Invitation:** Gửi lời mời tuyển dụng trực tiếp qua hệ thống.

</td>
<td width="33%">

### 🛡️ Dành cho Quản Trị Viên (Admin)
* **Tổng quan Hệ thống:** Bảng điều khiển (Dashboard) trực quan thống kê số liệu realtime.
* **Kiểm duyệt (Moderation):** Xem xét và phê duyệt hồ sơ doanh nghiệp.
* **User Management:** Quản lý, khóa/mở khóa tài khoản khi có dấu hiệu vi phạm.

</td>
</tr>
</table>

---

<a id="cong-nghe-su-dung"></a>
## 🛠 Công nghệ sử dụng

Được xây dựng trên nền tảng các công nghệ hiện đại và mạnh mẽ nhất:

| Thành phần | Công nghệ |
| :--- | :--- |
| **Giao diện (Frontend)** | `Next.js 14`, `TypeScript`, `TailwindCSS` |
| **Máy chủ (Backend)** | `FastAPI`, `Python`, `Pydantic` |
| **Cơ sở dữ liệu (DB)** | `PostgreSQL` |
| **Quản lý DB (ORM & Migration)**| `SQLAlchemy`, `Alembic` |
| **Lưu trữ tệp (Storage)** | `Cloudinary` (Có hỗ trợ fallback local) |
| **Xác thực (Authentication)** | `JWT`, `OAuth 2.0` (Google/GitHub) |
| **Triển khai (DevOps)** | `Docker`, `Docker Compose` |

---

<a id="huong-dan-cai-dat"></a>
## 🚀 Hướng dẫn cài đặt

### 🐳 Cách 1: Chạy bằng Docker (Khuyên dùng)

Cách nhanh nhất để khởi chạy toàn bộ hệ thống mà không cần lo lắng về môi trường.

1. **Chuẩn bị biến môi trường:**
   ```bash
   cp .env.example .env
   ```
   > 💡 *Nhớ cập nhật các thông tin cấu hình cần thiết (DB, JWT, OAuth, Cloudinary) bên trong file `.env`.*

2. **Build và khởi động:**
   ```bash
   docker compose up --build
   ```

3. **Truy cập ứng dụng:**
   - 🌐 **Frontend:** [http://localhost:3000](http://localhost:3000)
   - ⚡ **Backend API:** [http://localhost:8000](http://localhost:8000)
   - 📖 **Tài liệu API (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

*Để dừng hệ thống: `docker compose down` | Reset toàn bộ Database: `docker compose down -v`*

<details>
<summary><h3>💻 Cách 2: Chạy thủ công (Dành cho Development)</h3></summary>

**Khởi chạy Backend:**
```bash
cd backend
python3 -m venv .venv

# Kích hoạt môi trường ảo:
source .venv/bin/activate       # Trên macOS/Linux
# .venv\Scripts\Activate.ps1    # Trên Windows PowerShell

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Khởi chạy Frontend (Mở Terminal mới):**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

</details>

---

<a id="kien-truc-he-thong"></a>
## 🏗 Kiến trúc hệ thống

```text
  [ Người dùng ]
        │
        ▼
  [ Frontend (Next.js 14 + Tailwind) ]
        │
        ▼ (REST API / JWT)
  [ Backend API (FastAPI) ]
        │
        ├── CSDL ──────▶ [ PostgreSQL ]
        │
        └── Lưu trữ ───▶ [ Cloudinary / Local Storage ]
```

---

## 🔑 Biến môi trường quan trọng

Bạn cần thiết lập các biến sau trong file `.env`:

| Biến | Ví dụ | Mô tả |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://user:pass@db/dbname` | Chuỗi kết nối đến PostgreSQL |
| `SECRET_KEY` | `your-super-secret-key` | Khóa bí mật để ký JWT |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Cấu hình CORS cho frontend |
| `NEXT_PUBLIC_API_URL`| `http://localhost:8000` | Base URL của Backend dành cho Frontend |
| `GOOGLE_CLIENT_*` | `...` | Thông tin cấu hình đăng nhập qua Google |
| `GITHUB_CLIENT_*` | `...` | Thông tin cấu hình đăng nhập qua GitHub |
| `CLOUDINARY_*` | `...` | Cấu hình lưu trữ ảnh/CV trên Cloudinary |

---

## 📂 Quản lý Database (Alembic)

Dành cho nhà phát triển khi cần thay đổi cấu trúc bảng:

```bash
cd backend

# 1. Tạo file migration mới khi có thay đổi model
python3 -m alembic revision --autogenerate -m "Mô tả thay đổi"

# 2. Cập nhật thay đổi vào database
python3 -m alembic upgrade head
```
> **Các lệnh hữu ích khác:** `alembic current` (xem bản hiện tại), `alembic history` (lịch sử), `alembic downgrade -1` (hoàn tác 1 bước).

---

## 🗺 Cấu trúc thư mục

```text
portfolio-cv-hub/
├── 🐳 docker-compose.yml     # Khởi tạo toàn bộ services (DB, Backend, Frontend)
├── 🔐 .env.example           # File mẫu chứa các biến môi trường cấu hình
│
├── ⚙️ backend/               # 🐍 FastAPI Backend (Python)
│   ├── alembic/              # Quản lý Database Migrations (lịch sử cấu trúc bảng)
│   ├── app/                  # Chứa toàn bộ source code của Backend
│   │   ├── api/              # Định nghĩa các Endpoints (auth, candidate, recruiter...)
│   │   ├── core/             # Cấu hình chung (Config, Security, JWT)
│   │   ├── db/               # Kết nối Database và file Seed (dữ liệu mẫu)
│   │   ├── models/           # Định nghĩa các Database Models (SQLAlchemy ORM)
│   │   ├── repositories/     # Tầng xử lý truy vấn cơ sở dữ liệu (Data Access Layer)
│   │   ├── schemas/          # Xác thực dữ liệu đầu vào/ra (Pydantic Models)
│   │   ├── services/         # Xử lý Logic nghiệp vụ chính (Business Logic)
│   │   └── main.py           # Entry point khởi chạy ứng dụng FastAPI
│   ├── tests/                # Unit Tests & Integration Tests (Pytest)
│   ├── Dockerfile            # Kịch bản build Docker image cho backend
│   └── requirements.txt      # Khai báo các thư viện Python cần thiết
│
└── 🎨 frontend/              # ⚛️ Next.js 14 Frontend (React + TypeScript)
    ├── src/                  # Chứa toàn bộ source code của Frontend
    │   ├── app/              # Cấu trúc Routing của Next.js (App Router)
    │   │   ├── (dashboard)/  # Layout dùng chung cho các khu vực quản trị
    │   │   ├── admin/        # Giao diện dành riêng cho Admin
    │   │   ├── auth/         # Giao diện Xác thực (Đăng nhập, Đăng ký)
    │   │   ├── portfolio/    # Giao diện trang Profile công khai của Ứng viên
    │   │   ├── recruiter/    # Giao diện làm việc của Nhà Tuyển Dụng
    │   │   └── search/       # Giao diện tìm kiếm ứng viên công khai
    │   ├── components/       # Các React UI Component tái sử dụng (Button, Form, Table...)
    │   ├── config/           # File cấu hình ứng dụng (i18n, constants)
    │   ├── hooks/            # Custom Hooks & Context API (xử lý Global State, Auth)
    │   ├── locales/          # File đa ngôn ngữ (en.json, vi.json)
    │   ├── providers/        # Context Providers bao bọc toàn ứng dụng
    │   ├── services/         # Hàm kết nối, gửi requests tới Backend API
    │   └── types/            # Khai báo các TypeScript Interfaces/Types
    ├── Dockerfile            # Kịch bản build Docker image cho frontend
    ├── package.json          # Quản lý thư viện NPM và các Scripts
    └── tailwind.config.js    # Cấu hình CSS/Thiết kế hệ thống cho Tailwind
```

---

<div align="center">
  <b>Cảm ơn bạn đã ghé thăm và quan tâm đến dự án!</b> <br/>
  <i>Mọi đóng góp, báo lỗi (issue) hoặc ý kiến phản hồi đều được chúng tôi trân trọng đón nhận. ❤️</i>
</div>
