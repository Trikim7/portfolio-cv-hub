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

## Database cốt lõi

`users`, `candidate_profiles`, `skills`, `experiences`, `projects`, `companies`, `invitations`, `profile_views`, `comparisons`, `templates`, `system_settings`.

## Quy tắc

- API contract phải rõ request/response JSON.
- Endpoint bảo vệ phải kiểm tra quyền.
- Business logic chính để ở backend.
