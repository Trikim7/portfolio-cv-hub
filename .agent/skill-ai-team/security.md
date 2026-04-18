---
context: Portfolio CV Hub Phase 2
---

# Bảo mật và giới hạn khi dùng AI

## Không gửi lên AI

- Password, API keys, JWT secret, DB credentials
- File `.env` thật
- Dữ liệu cá nhân nhạy cảm của người dùng
- Thông tin nội bộ không cần thiết cho task

## Cách làm an toàn

- Dùng placeholder khi cần minh họa (`<API_KEY>`, `<EMAIL>`).
- Chỉ gửi đoạn code tối thiểu đủ ngữ cảnh.
- Ưu tiên mô tả vấn đề bằng text trước, tránh dán toàn bộ codebase.

## Quy tắc bản quyền/chất lượng

- Không copy nguyên văn output AI mà không hiểu.
- Nếu AI gợi ý thư viện mới, phải kiểm tra license và nhu cầu thật.
- Nếu output thiếu chắc chắn, yêu cầu AI nêu giả định và rủi ro.

## Trước khi merge

- Đối chiếu lại với `review-checklist.md`.
- Đảm bảo không còn dữ liệu nhạy cảm trong commit history/PR.
