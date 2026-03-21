# Kế Hoạch Thực Hiện MVP - Portfolio CV Hub

> **Chiến lược làm việc với AI Agent**: Do AI Agent có khả năng sinh code nhanh cho cả Frontend và Backend, việc phân chia công việc theo **Luồng nghiệp vụ (Module/Feature)** - tức mỗi người làm Fullstack cho một nhóm tính năng - sẽ hiệu quả hơn việc cắt ngang Frontend và Backend. Điều này giúp Agent có context đầy đủ từ Database, API, cho đến UI của một feature cụ thể, hạn chế xung đột (conflict) logic khi ghép nối.

---

## 2. Phân công nhiệm vụ cụ thể

### 👨‍💻 1.(CANDIDATE MODULE)

- **Nhiệm vụ chính**: Phát triển toàn bộ luồng nghiệp vụ liên quan đến quản lý của Ứng viên.
- **Backend (FastAPI)**:
  - API Auth (Đăng ký, Đăng nhập) cho Ứng viên.
  - API CRUD quản lý Portfolio: Cập nhật thông tin cá nhân, Skills, Experiences, Projects.
  - API xử lý Upload file CV (Lưu tại local hoặc S3/MinIO).
- **Frontend (React/Next)**:
  - Màn hình Auth (Đăng nhập/Đăng ký) cho Ứng viên.
  - Dashboard Ứng viên: Giao diện Form thêm, sửa, xóa thông tin profile.

### 👨‍💻 2. (RECRUITER MODULE)

- **Nhiệm vụ chính**: Luồng người dùng Doanh nghiệp và tính năng Tìm kiếm ứng viên.
- **Backend (FastAPI)**:
  - API Auth Doanh nghiệp (Đăng ký chờ Admin duyệt, Đăng nhập).
  - API Cập nhật thông tin công ty.
  - API Query Tìm kiếm & Lọc (Search & Filter) ứng viên theo từ khóa/kỹ năng.
  - API xử lý Gửi Lời mời / Liên hệ tuyển dụng.
- **Frontend (React/Next)**:
  - Màn hình Auth và Profile của Doanh nghiệp.
  - Landing page (Tìm kiếm): Thanh search, bộ lọc ứng viên.
  - Chức năng So sánh: Bảng dữ liệu cơ bản (Basic table so sánh 2-3 ứng viên).

### 👨‍💻 3. (ADMIN & INFRASTRUCTURE)

- **Nhiệm vụ chính**: Thiết lập nền tảng kiến trúc (DevOps, CSDL) và hệ thống Quản trị (Admin).
- **Backend, DB & DevOps**:
  - Khởi tạo repo Base (Frontend, Backend).
  - Setup cấu trúc Database, Base ORM Models (SQLAlchemy), và công cụ Migration (Alembic).
  - Khởi tạo cấu hình Docker & `docker-compose.yml` chuẩn để cả team run local dễ dàng.
  - API Admin: Danh sách users, Duyệt / Từ chối Doanh nghiệp, Khóa tài khoản.
- **Frontend (React/Next)**:
  - Giao diện Admin Dashboard.
  - Màn hình quản lý người dùng và Duyệt Doanh nghiệp.

### 👨‍💻 4.  (PUBLIC VIEW & ANALYTICS)

- **Nhiệm vụ chính**: Trải nghiệm xem Portfolio và Hệ thống Thống kê.
- **Backend (FastAPI)**:
  - Base API phục vụ trang Public: Lấy dữ liệu chi tiết Portfolio bằng đường dẫn (slug) public.
  - Cơ chế tracking: API Ghi nhận "Lượt xem" hồ sơ.
  - API Thống kê chuyên biệt: Tổng lượt xem, Số lời mời của ứng viên; API số liệu tổng quan cho Admin.
- **Frontend (React/Next)**:
  - Giao diện **Trang Portfolio Public** (Template chuẩn hiển thị cho Doanh nghiệp/Khách vãng lai xem).
  - Component hiển thị thống kê (Lượt xem/Lời mời) cho Dashboard Ứng viên.
  - Biểu đồ/bảng số liệu tổng quan cho trang Admin.

---

## 3. Timeline

### 🗓️ Tuần 1: Nền Tảng Khung & Cơ Sở Dữ Liệu (21/03 - 28/03)

- Hoàn thiện Github repo cho FE/BE, đẩy lên Docker compose. Viết 100% schema và migration các bảng DB cơ bản `Users, Companies, CandidateProfiles, Skills, Experiences, Projects`.
- Cùng hợp tác định nghĩa API Specs (JSON Schema) dùng chung, đảm bảo backend trả về đúng model UI cần. Bắt đầu build hệ thống Component UI base (Button, Inputs, Table).
-  Design/Code cấu trúc thư mục UI cho trang Public Portfolio và component Thống kê.
- 🎯 **Mục tiêu cuối Tuần 1**: Môi trường Docker hoạt động trơn tru trên máy 4 người. Auth đăng nhập/đăng ký sơ bộ chạy được (API gọi Database thành công).

### 🗓️ Tuần 2: Hoàn Thiện MVP Core Flow (29/03 - 04/04)

- Ứng viên vào giao diện tạo thành công Portfolio cá nhân, sửa, quản lý kỹ năng, upload PDF CV thành công.
- Hoàn tất thuật toán/API Search ứng viên và giao diện danh sách kết quả. Test được tính năng nhấn nút Gửi lời mời.
- Hoàn tất module Admin. Doanh nghiệp khi đăng ký lúc này sẽ bị trạng thái `Pending`, Admin duyệt qua UI thì Doanh nghiệp mới đăng nhập được.
- Màn hình Public Map được 100% data từ API của Huy trả ra. Tracking views chạy thông mạch (mỗi lượt truy cập gọi API tăng count).
- 🎯 **Mục tiêu cuối Tuần 2**: Vòng lặp cơ bản được nối. Doanh nghiệp (đã duyệt) -> Vào trang Tìm kiếm -> Thấy ứng viên -> Click xem trang Public của Trí -> Trí tăng View -> Doanh nghiệp gửi thư mời bằng API của Hùng -> Huy check Data hiển thị lời mời.

### 🗓️ Tuần 3: Tích Hợp, Thống Kê & Bug Fix (05/04 - 12/04)

- **Toàn Team**: Thường xuyên Pull/Merge Code. Giải quyết các Conflict giữa các Module thông qua Review code của nhau. Cố gắng Freeze (đóng gói) tính năng vào khoảng 09-10/04.
- Màn hình Data Analytics được ráp giao diện và hiển thị chuẩn số cho cả Ứng Viên và Admin.
- Bảng So sánh 2-3 User lên thiết kế hiển thị chuẩn lưới ngang.
- Viết Tool/Script Seed Fake Data: 10 ứng viên (kèm data đầy đủ skill), 3 doanh nghiệp, 20 lượt xem, để lúc demo có đầy đủ Data.
- 🎯 **Mục tiêu cuối Tuần 3**: Launch hệ thống nội bộ ổn định. Thử nghiệm demo thực tế từ Đăng ký, Duyệt, Tạo CV, Tìm kiếm đến Liên hệ để quay video/trình bày trước lớp.

---

## 4. Gợi ý Tối ưu hóa với AI Agent

1. **Chuẩn hóa Context (Rules)**: Hãy tạo một file `.cursprompt` hoặc `rules.md` tại root dự án chứa các rule như: tech stack sử dụng (`FastAPI`, `PostgreSQL`, `TailwindCSS`), naming convention, thiết kế architecture (Router-Service-Repository). Nhét file này vào Context mỗi khi chat với AI để các Agent sinh code tuân thủ cùng một pattern, dễ review và merge.
2. **Review Code chéo bằng AI**: Thay vì tự đọc, Hùng có thể đẩy PR code mình làm qua cho Hào - Hào lấy AI Agent của mình quét qua PR của Hùng để check logic hổng trước khi Merge.
3. **Mô tả DB thật rõ**: Cấp toàn bộ file schema DB SQL/Alembic cho AI lúc request làm tính năng, vì AI sẽ tạo code API rất chính xác nếu biểu cấu trúc bảng.
