---
context: Portfolio CV Hub Phase 2
---

# Ranh giới backend/frontend

## Backend (FastAPI)

- Auth + phân quyền theo vai trò.
- CRUD portfolio: profile, skills, experiences, projects, CVs.
- Tìm kiếm/lọc ứng viên, so sánh và tính điểm phù hợp.
- Lời mời tuyển dụng, analytics, quản trị admin.

## Frontend (React/Next)

- Màn hình theo vai trò candidate/recruiter/admin.
- Form nhập liệu, dashboard, so sánh ứng viên.
- Gọi REST API và xử lý trạng thái UI.

## Database cốt lõi (Môi trường PostgreSQL)

`users`, `social_accounts` (OAuth), `candidate_profiles` (Hỗ trợ JSONB Đa ngôn ngữ), `skills`, `experiences`, `projects`, `cvs`, `companies`, `job_requirements` (Tiêu chí tuyển dụng/Radar, gồm `required_role` và `customer_facing`), `invitations`, `profile_views`, `comparisons`, `comparison_candidates`, `templates`, `system_settings`.

### Lưu ý riêng cho `job_requirements`

- `required_role`: gợi ý vai trò (VD: Backend/Frontend) để match theo title và kinh nghiệm.
- `customer_facing`: đánh dấu công việc có yêu cầu giao tiếp với khách hàng, dùng trong logic đánh giá phù hợp.

## Quy tắc

- API contract phải rõ request/response JSON.
- Endpoint bảo vệ phải kiểm tra quyền.
- Business logic chính để ở backend.
