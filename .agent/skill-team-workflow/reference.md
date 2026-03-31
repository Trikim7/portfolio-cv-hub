# Quy ước tổng quan

## Phạm vi

Áp dụng cho toàn bộ dự án Portfolio CV Hub khi setup, code, review và demo.

## Nguyên tắc

1. Giữ nguyên một URL repository đã nộp.
2. `main` luôn là nhánh ổn định để chạy demo.
3. Không làm việc trực tiếp trên `main` cho tính năng mới.
4. Không commit secrets; chỉ commit `.env.example`.
5. Ưu tiên Docker Compose để giảm lệch môi trường giữa máy macOS/Windows.

## Vai trò hệ thống

- `candidate`: quản lý portfolio, CV, analytics cá nhân.
- `recruiter`: tìm kiếm, lọc, so sánh ứng viên, gửi lời mời.
- `admin`: duyệt doanh nghiệp, quản lý template/cấu hình, xem thống kê.
