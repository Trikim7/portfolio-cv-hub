# Kiến trúc hệ thống

## Mục đích

Tài liệu này mô tả **hệ thống chạy như thế nào** và ranh giới giữa các lớp/module.  
`structure.md` chỉ mô tả **đặt file ở đâu**.

## System context

Hệ thống phục vụ 3 vai trò:
- `candidate`
- `recruiter`
- `admin`

Luồng tổng quát:

```text
Browser (Candidate/Recruiter/Admin)
  -> Frontend (React/Next)
  -> Backend API (FastAPI)
  -> Database (MySQL/PostgreSQL)
```

## Request flow chuẩn

Mọi request nghiệp vụ đi theo chuỗi:

```text
Route (frontend)
  -> API client
  -> FastAPI Router
  -> Service
  -> Repository
  -> Database
  -> JSON response
```

Nguyên tắc:
- Router: nhận request, validate schema, map endpoint.
- Service: xử lý business logic.
- Repository: truy vấn dữ liệu.

## Backend module map

- **Auth/User**
  - Đăng ký, đăng nhập, JWT, role, trạng thái tài khoản.
- **Candidate Portfolio**
  - Hồ sơ, kỹ năng, kinh nghiệm, dự án, CV, public visibility.
- **Recruiter Search**
  - Tìm kiếm/lọc ứng viên theo skill, kinh nghiệm, từ khóa.
- **Comparison**
  - So sánh tối đa 2-3 ứng viên.
  - MVP: chỉ bảng thông tin; Radar Chart và tính điểm phù hợp để phase sau (xem `mvp-scope.md`).
- **Invitation**
  - Gửi và theo dõi lời mời tuyển dụng.
- **Analytics**
  - Lượt xem hồ sơ, số lời mời, thống kê cho dashboard.
- **Admin**
  - Duyệt doanh nghiệp, khóa/mở tài khoản, quản lý template/cấu hình.

## Data ownership (tránh sửa chéo)

- Auth/User: `users`
- Candidate Portfolio: `candidate_profiles`, `skills`, `experiences`, `projects`, `cvs`
- Recruiter: `companies`
- Invitation: `invitations`
- Analytics: `profile_views`
- Comparison: `comparisons`, `comparison_candidates`
- Admin config: `templates`, `system_settings`

## Quy tắc kiến trúc

1. Không đặt business logic phức tạp ở frontend.
2. Endpoint có dữ liệu riêng tư phải có auth + role check.
3. Không để Router truy cập DB trực tiếp, phải qua Service/Repository.
4. Module nào sở hữu dữ liệu thì module đó chịu trách nhiệm validate nghiệp vụ.
5. Thay đổi kiến trúc lớn phải thảo luận team trước khi code.

## Khi nào cần thảo luận kiến trúc trước

- Thêm module backend mới.
- Thay đổi mô hình dữ liệu cốt lõi.
- Đổi cơ chế auth/permission.
- Tách service hoặc thay đổi flow chính giữa các module.

## Kiểm tra nhanh trước merge

- [ ] Luồng request vẫn theo Router -> Service -> Repository.
- [ ] Không phá boundary giữa module.
- [ ] Role `candidate/recruiter/admin` vẫn tách rõ.
- [ ] Thay đổi DB đã cập nhật tài liệu liên quan.
