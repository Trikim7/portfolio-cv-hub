---
name: skill-ai-team
context: Portfolio CV Hub Phase 2
description: Quy chuẩn dùng AI cho team 4 người trong dự án Portfolio CV Hub với nhiều công cụ như Cursor, GitHub Copilot, Antigravity. Dùng khi phân công task, viết prompt, review code AI sinh ra, và kiểm soát bảo mật-chất lượng trước khi merge.
---

# Agent Skill: AI Team

## Mục tiêu

Thiết lập cách dùng AI thống nhất cho team 4 người để:
- tăng tốc làm việc
- giữ chất lượng code
- tránh lệ thuộc AI và rủi ro bảo mật

## Tài liệu trong skill

- [Quy tắc dùng AI](ai-policy.md)
- [Mẫu prompt theo tác vụ](prompt-templates.md)
- [Checklist review đầu ra AI](review-checklist.md)
- [Bảo mật và giới hạn](security.md)

## Cách áp dụng

1. Chọn task và người chịu trách nhiệm.
2. Dùng mẫu prompt trong `prompt-templates.md`.
3. Sinh code bằng AI nhưng bắt buộc review theo `review-checklist.md`.
4. Đối chiếu `security.md` trước khi commit/PR.

## Nguyên tắc cứng

1. AI hỗ trợ, con người chịu trách nhiệm cuối cùng.
2. Không paste secrets, token, dữ liệu nhạy cảm vào AI.
3. Không merge code AI sinh ra nếu chưa chạy test/chưa review.
4. Mọi thay đổi quan trọng phải có mô tả "AI hỗ trợ phần nào" trong PR.
