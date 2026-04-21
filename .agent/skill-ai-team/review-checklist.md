---
context: Portfolio CV Hub Phase 2
---

# Checklist review đầu ra AI

## Correctness

- [ ] Code chạy đúng yêu cầu nghiệp vụ.
- [ ] Không phá luồng `candidate` / `recruiter` / `admin`.
- [ ] Không đổi hành vi cũ ngoài phạm vi task.

## Code quality

- [ ] Tên biến/hàm rõ nghĩa, không rối.
- [ ] Không copy logic lặp lại nhiều nơi.
- [ ] Error handling đủ cho tình huống lỗi phổ biến.

## Security

- [ ] Không hardcode key, mật khẩu, token.
- [ ] Có kiểm tra auth/permission ở endpoint cần bảo vệ.
- [ ] Validate input cơ bản trước khi xử lý.

## Verification

- [ ] Đã chạy lint.
- [ ] Đã chạy test liên quan.
- [ ] Đã test tay luồng chính.

## PR hygiene

- [ ] PR mô tả rõ phần AI hỗ trợ.
- [ ] Kèm cách verify ngắn gọn cho reviewer.
