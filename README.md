# Portfolio CV Hub

Hệ thống quản lý Portfolio và CV dành cho ứng viên (Candidate) và giúp nhà tuyển dụng (Recruiter) tìm kiếm dễ dàng. Dự án bao gồm hai phần chính: **Backend** (FastAPI) và **Frontend** (Next.js).

---

## 🛠 Yêu cầu hệ thống (Prerequisites)

- **Python** 3.10 trở lên (code dùng cú pháp type `X | None`; nên dùng `python -m uvicorn` nếu máy có nhiều bản Python)
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
python -m uvicorn app.main:app --reload
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

## Git: làm chung một repository (nhóm 4 người)

Tài liệu này dùng cho dự án **Portfolio CV Hub**. Nguyên tắc: **một remote duy nhất**, cả nhóm đẩy code lên **cùng một repo** (theo yêu cầu đồ án: không đổi link repo sau khi đã nộp).

### 1. Chuẩn bị lần đầu (mỗi thành viên)

Chỉ **một người** tạo repo trên GitHub (hoặc đã có sẵn), các người còn lại **clone** về máy:

```bash
git clone <URL-repo-cua-nhom>.git
cd portfolio-cv-hub
```

Cấu hình tên/email để commit hiển thị đúng người làm:

```bash
git config user.name "Họ Tên"
git config user.email "email@example.com"
```

(Nếu muốn áp dụng cho mọi repo trên máy, thêm `--global`.)

### 2. Nhánh (branch) — tránh sửa trực tiếp lên `main`

#### 2.1 Cách nhóm đang dùng: **một nhánh cố định theo tên từng thành viên**

Nhóm đã tạo **4 nhánh** trùng tên (hoặc tên gọi) của từng người — cách này **ổn** cho đồ án nếu mỗi người chủ yếu code phần được phân công và **thường xuyên** đồng bộ với `main`.

| Nhánh | Mục đích |
| ----- | -------- |
| `main` | Code chung đã gộp, dùng để demo / nộp bài. |
| `<nhánh-của-bạn>` | Ví dụ tên theo người: `anh-huy`, `van-hung`, `nhat-hao`, `duc-tri` (tùy nhóm đặt) — **chỉ bạn** (hoặc thống nhất rõ) push lên nhánh này. |

**Lưu ý:**

- **Không checkout nhánh của người khác** để làm việc hộ (trừ khi cặp lập trình và đã báo nhau) — tránh đè commit lẫn nhau.
- Trước khi mở PR hoặc sau khi người khác merge vào `main`, hãy **merge `main` vào nhánh của mình** để giảm conflict (xem mục 4).
- Nếu một người làm **nhiều việc tách bạch** trong tuần, vẫn có thể tạo thêm nhánh ngắn `feature/...` rồi merge vào nhánh cá nhân hoặc PR thẳng `main` — không bắt buộc.

#### 2.2 Các kiểu nhánh khác (tùy chọn)

| Nhánh | Khi nào dùng |
| ----- | -------------- |
| `feature/…` | Tính năng lớn muốn tách khỏi nhánh cá nhân: `feature/auth-login`, … |
| `fix/…` | Sửa lỗi gấp: `fix/docker-db-connection` |

### 3. Quy trình làm việc hàng ngày (nhánh theo tên thành viên)

#### Lần đầu sau khi đã có nhánh trên GitHub

```bash
git fetch origin
git checkout ten-nhanh-cua-ban    # ví dụ: anh-huy
git pull origin ten-nhanh-cua-ban
```

#### Mỗi lần ngồi code (khuyến nghị)

```bash
git checkout main
git pull origin main
git checkout ten-nhanh-cua-ban
git merge main
# Nếu có conflict → sửa tay → commit merge
```

Sau đó code trên **nhánh của mình**, commit và push:

```bash
git add .
git commit -m "feat: mô tả ngắn"
git push origin ten-nhanh-cua-ban
```

#### Gộp code vào `main`

Trên GitHub: tạo **Pull Request** từ `ten-nhanh-cua-ban` → `main`, review rồi **Merge**.

#### Sau khi PR của mình (hoặc của bạn khác) đã merge vào `main`

Để nhánh cá nhân không tụt quá xa:

```bash
git checkout main
git pull origin main
git checkout ten-nhanh-cua-ban
git merge main
git push origin ten-nhanh-cua-ban
```

**Không xóa** nhánh theo tên thành viên (trừ khi cả nhóm đổi quy ước) — nhánh này dùng lặp lại suốt dự án.

### 4. Khi nhiều người sửa cùng file

- Ưu tiên **chia module rõ** (auth / candidate / recruiter / admin) để ít đụng nhau.
- File hay conflict: `package.json`, `docker-compose.yml`, `requirements.txt`, route tổng hợp → **thông báo nhóm** trước khi sửa, hoặc một người “owner” gộp thay đổi.
- Trước khi push PR, luôn:

```bash
git checkout main && git pull origin main
git checkout ten-nhanh-cua-ban
git merge main
# hoặc: git rebase main
```

Giải quyết conflict trong editor, rồi `commit` và `push` lại.

### 5. `.gitignore` — nên có từ đầu

**Không commit** các thứ sau (thêm vào `.gitignore`):

- Thư mục môi trường ảo Python: `venv/`, `.venv/`
- `node_modules/`
- File chứa bí mật: `.env` (chỉ commit `.env.example` mẫu, không có mật khẩu thật)
- Thư mục build/cache: `dist/`, `build/`, `.next/`, `__pycache__/`, `*.pyc`
- File IDE (tùy nhóm): `.idea/`, `.vscode/` (có nhóm vẫn commit settings chung — thống nhất một cách)

### 6. Commit message (gợi ý ngắn gọn)

- `feat:` tính năng mới
- `fix:` sửa lỗi
- `docs:` tài liệu
- `chore:` cấu hình, format, không đổi logic nghiệp vụ

Ví dụ: `feat(recruiter): API tìm kiếm ứng viên theo skill`

### 7. Nếu lỡ commit nhầm / cần hoàn tác (cơ bản)

- **Chưa push:** `git reset --soft HEAD~1` (bỏ commit, giữ thay đổi trong staging).
- **Đã push:** không rewrite history trên `main` nếu không thống nhất; dùng commit mới để sửa (`git revert`).

Chi tiết nâng cao nhóm có thể bổ sung sau; MVP ưu tiên **PR nhỏ, merge thường xuyên**.

### 8. Checklist trước khi demo / nộp bài

- [ ] `main` trên GitHub là bản **chạy được** (`docker compose up` hoặc lệnh nhóm đã thống nhất).
- [ ] Có `.env.example`, README hướng dẫn clone + chạy.
- [ ] Không có mật khẩu/API key trong repo.
- [ ] **Không đổi URL repository** sau khi đã nộp link cho giảng viên (theo quy định đồ án).

### 9. Tóm tắt một dòng

**Mỗi người: `pull main` → `merge main` vào nhánh tên mình → code → `push` nhánh mình → PR vào `main` → sau merge, kéo `main` về và merge lại vào nhánh mình.**

Nếu repo thực tế của nhóm khác tên thư mục, chỉ cần thay `cd` cho đúng; quy trình Git giữ nguyên.
