---
context: Portfolio CV Hub Phase 2
---

# Thiết kế Cơ Sở Dữ Liệu Phase 2 (PostgreSQL)

Tài liệu này xác định cấu trúc toàn bộ các bảng database cho Phase 2. Cấu trúc này kế thừa ERD trong proposal (`kimductri-project-proposal.md`), đồng thời bổ sung và điều chỉnh kiểu dữ liệu (JSONB, các bảng mới) để tối ưu PostgreSQL, phục vụ i18n, social auth và trực quan hóa biểu đồ radar.

---

## 1. Phân Hệ Người Dùng & Quản Trị (User & Admin Core)

### Bảng `USERS` (Kế thừa từ Proposal có điều chỉnh)
Khung tài khoản chính của toàn hệ thống. Cho phép `password_hash` rỗng nếu người dùng chỉ sử dụng mạng xã hội.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID người dùng |
| email | varchar(255) | Unique | Email đăng nhập (duy nhất) |
| password_hash | varchar(255) | Nullable | Mật khẩu mã hóa (Null nếu chỉ dùng Social) |
| full_name | varchar(255) | | Họ tên hiển thị (dùng cho Admin/DN) |
| role | enum | | `candidate` / `recruiter` / `admin` |
| status | enum | | `active` / `locked` / `pending` |
| created_at | datetime | | Ngày tạo tài khoản |
| updated_at | datetime | | Ngày cập nhật |

### Bảng `SOCIAL_ACCOUNTS` (BẢNG MỚI - Phase 2)
Tách rời danh tính mạng xã hội, giữ cho bảng USERS sạch sẽ thay vì phải thêm quá nhiều cột null cho người dùng thường.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID bản ghi |
| user_id | FK (Integer) | Ref: `users.id` | Trỏ về tài khoản đang sở hữu |
| provider | varchar(50) | | Tên dịch vụ: `google`, `facebook`, `github` |
| provider_account_id | varchar(255) | | ID định danh do Google/Github trả về |
| access_token | text | Nullable | Token truy cập tài nguyên (nếu có) |
| created_at | datetime | | Ngày liên kết |

### Bảng `TEMPLATES` (Kế thừa y hệt Proposal)
Quản lý các giao diện của Portfolio.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID template |
| name | varchar(255) | | Tên template |
| description | text | | Mô tả chi tiết |
| config_json | text | | Cấu hình tham số màu, layout (dạng text/json) |
| status | enum | | `active` / `inactive` |
| created_at | datetime | | Ngày tạo |

### Bảng `SYSTEM_SETTINGS` (Kế thừa y hệt Proposal)
Cấu hình linh tinh của hệ thống.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID cấu hình |
| key | varchar(255) | Unique | Tên biến (key) |
| value | text | | Giá trị biến (value) |
| description | text | | Mô tả ý nghĩa của biến cấu hình này |

---

## 2. Phân Hệ Hồ Sơ Ứng Viên (Candidate Portfolio)

### Bảng `CANDIDATE_PROFILES` (Kế thừa & Chuyển Bio sang JSONB)
Thông tin tổng quan hiển thị trên portfolio public.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID hồ sơ ứng viên |
| user_id | FK (Integer) | Ref: `users.id` | Tài khoản sở hữu hồ sơ này |
| full_name | varchar(255) | | Tên hiển thị trên portfolio |
| headline | varchar(255) | | Tiêu đề ngắn (VD: Frontend Developer) |
| bio | **JSONB** | **NÂNG CẤP** | Giới thiệu (Format Đa ngôn ngữ: `{"vi": "...", "en": "..."}`) |
| avatar_url | varchar(255) | Nullable | Link ảnh đại diện |
| is_public | boolean | Default: false | Trạng thái hiển thị ra ngoài |
| public_slug | varchar(255) | Unique | Đường dẫn URL public mặc định |
| template_id | FK (Integer) | Ref: `templates.id` | Giao diện đang dùng |
| created_at | datetime | | Thời điểm tạo |
| updated_at | datetime | | Thời điểm cập nhật |

### Bảng `SKILLS` (Kế thừa y hệt Proposal + Cột endorsements)
Danh sách kỹ năng của thẻ Candidate.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID môn kỹ năng |
| candidate_id | FK (Integer) | Ref: `candidate_profiles.id` | Thuộc hồ sơ nào |
| skill_name | varchar(255) | | Tên hiển thị công nghệ / kỹ năng |
| level | enum | | `entry` / `junior` / `mid` / `senior` / `lead` |
| category | varchar(255) | | Frontend / Backend / DevOps... |
| endorsements | int | MỚI | Điểm chứng thực tín hiệu radar Phase 2 (Mặc định: 0) |

### Bảng `EXPERIENCES` (Kế thừa & Chuyển Description sang JSONB)

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID bản ghi kinh nghiệm |
| candidate_id | FK (Integer) | Ref: `candidate_profiles.id` | Thuộc hồ sơ nào |
| company_name | varchar(255) | | Tên nơi từng làm việc |
| position | varchar(255) | | Vai trò, chức danh |
| start_date | date | | Ngày làm ngày đầu |
| end_date | date | Nullable | Ngày nghỉ (null nếu vẫn đang làm) |
| description | **JSONB** | **NÂNG CẤP** | Mô tả việc làm (Format Đa ngôn ngữ `{"vi": "...", "en": "..."}`) |

### Bảng `PROJECTS` (Kế thừa & Chuyển Description sang JSONB)

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID dự án |
| candidate_id | FK (Integer) | Ref: `candidate_profiles.id` | Thuộc hồ sơ nào |
| project_name | varchar(255) | | Tên đồ án / phần mềm / dự án |
| role | varchar(255) | | Vai trò phụ trách |
| technologies | text | | Các công nghệ đã dùng (string phẩy hoặc json) |
| description | **JSONB** | **NÂNG CẤP** | Cấu trúc tính năng (Format Đa ngôn ngữ `{"vi": "...", "en": "..."}`) |
| project_url | varchar(255)| Nullable | Link web/app đang chạy thực tế |
| github_url | varchar(255)| Nullable | Git repo tĩnh (chỉ public access) |

### Bảng `CVS` (Kế thừa y hệt Proposal)

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID file nộp |
| candidate_id | FK (Integer) | Ref: `candidate_profiles.id` | File CV thuộc ứng viên nào |
| cv_url | varchar(255) | | Khóa tải trực tiếp / Cloud URI |
| created_at | datetime | | Thời điểm đẩy lên |

---

## 3. Phân Hệ Doanh Nghiệp & Tuyển Dụng (Recruiter & ATS)

### Bảng `COMPANIES` (Kế thừa y hệt Proposal)

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID bảng danh sách định danh cty |
| user_id | FK (Integer) | Ref: `users.id` | Tài khoản sở hữu |
| company_name | varchar(255) | | Tên pháp nhân công ty |
| website | varchar(255) | Nullable | Website công ty |
| logo_url | varchar(255) | Nullable | Link cdn cho ảnh logo |
| description | text | Nullable | Mô tả lĩnh vực, phúc lợi công ty |
| is_approved | boolean | Default: false | Trạng thái (Phải do Admin cấp duyệt mới sử dụng được) |
| created_at | datetime | | Ngày khởi tạo account |

### Bảng `JOB_REQUIREMENTS` (BẢNG MỚI - Core Radar Score Phase 2)
Nền tảng của các lưới search thông minh, thuật toán AI khớp Match Score, tái sử dụng template công việc doanh nghiệp.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID thông tin nhu cầu |
| company_id | FK (Integer) | Ref: `companies.id` | Doanh nghiệp nào đăng tin / lưu mẫu |
| title | varchar(255) | | Tên nhãn mô tả nhu cầu (Vd: Senior Backend Go) |
| required_skills | JSONB | | Mảng công nghệ `[{"name": "Golang", "level": "SENIOR"}]` |
| years_experience | int | Nullable | Yêu cầu số năm kinh nghiệm tối thiểu |
| required_role | varchar(255) | Nullable | Gợi ý vai trò (VD: `Backend`, `Frontend`) để match title/experience |
| customer_facing | boolean | Default: false | Công việc cần giao tiếp với khách hàng |
| tech_stack | JSONB | Nullable | Mảng tags mảng text công nghệ môi trường |
| is_management_role| boolean | Default: false | Quy định bắt buộc có kinh nghiệm Lead/Manager |
| weights_config | JSONB | Nullable | Cấu hình trọng số Radar (Doanh nghiệp kéo thủ công) |
| is_active | boolean | Default: true | Đang theo dõi / đóng tin |
| created_at | datetime | | |
| updated_at | datetime | | |

### Bảng `INVITATIONS` (Kế thừa y hệt Proposal)
Thư ngỏ tuyển dụng từ Recruiter đến Candidates.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID thư đi |
| company_id | FK (Integer) | Ref: `companies.id` | Cty nào ném ping |
| candidate_id | FK (Integer) | Ref: `candidate_profiles.id` | Đích đến là Profile nào |
| position | varchar(255) | | Tên vị trí mong muốn ứng viên xem xét |
| message | text | Nullable | Text mô tả cá nhân hóa từ nhà TD |
| status | enum | | `sent` / `viewed` / `accepted` / `rejected` |
| created_at | datetime | | Ngày ping |

### Bảng `PROFILE_VIEWS` (Kế thừa y hệt Proposal)
Khối Tracking dành cho tab Analytics của ứng viên.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID view hit |
| candidate_id | FK (Integer) | Ref: `candidate_profiles.id` | Xem ở hồ sơ nào |
| viewer_type | enum | | `anonymous` / `company` |
| company_id | FK (Integer) | Ref: `companies.id` (Nullable) | Record truy vết xem nặc danh hay định danh |
| viewed_at | datetime | | Dấu vân thời gian |

### Bảng `COMPARISONS` (Kế thừa y hệt Proposal)
Ghi dấu Log Phiên so sánh và tính điểm của doanh nghiệp đối chứng.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | ID phiên compare session |
| company_id | FK (Integer) | Ref: `companies.id` | Phục vụ công ty nào |
| criteria_json | text | | Snapshot json yêu cầu/điểm để đóng băng tiêu chí lịch sử so sánh |
| created_at | datetime | | Ngày thực hiện log phiên |

### Bảng `COMPARISON_CANDIDATES` (Kế thừa y hệt Proposal)
Mapping Candidate nào nằm trong Phiên so sánh lưới nào.

| Field | Type | Constraint | Description |
|---|---|---|---|
| id | PK (Integer) | | N/A |
| comparison_id | FK (Integer) | Ref: `comparisons.id` | Lịch sử log nào |
| candidate_id | FK (Integer) | Ref: `candidate_profiles.id` | Áp với hồ sơ ứng viên nào |
