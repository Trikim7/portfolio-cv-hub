---
name: skill-team-workflow
description: Áp dụng chuẩn Agent Skill cho dự án Portfolio CV Hub: cấu trúc thư mục, ranh giới backend-frontend, quy trình Git theo nhóm và lệnh chạy tương thích macOS + Windows.
---

# Agent Skill: Team Workflow

## Mục tiêu

Skill này là bộ quy định dùng chung cho team, tách nhiều file để dễ tra cứu:

- [Quy ước tổng quan](reference.md)
- [Cấu trúc thư mục chuẩn](structure.md)
- [Kiến trúc hệ thống](architecture.md)
- [Ranh giới backend/frontend](backend-frontend.md)
- [Quy trình Git theo nhóm](git-workflow.md)
- [Lệnh chạy macOS + Windows](run-commands.md)
- [Phạm vi MVP & giới hạn](mvp-scope.md)
- [Checklist trước khi merge/demo](checklist.md)

## Cách dùng nhanh

1. Đọc `reference.md`.
2. Chọn file chuyên đề theo nhu cầu.
3. Nếu làm tính năng **trong giai đoạn MVP** (trước hoặc đến **12.04.2026**), đối chiếu `mvp-scope.md` để tránh vượt phạm vi. **Sau mốc đó** không cần bắt buộc đối chiếu file này cho tính năng mới (ưu tiên quy ước/phase hiện tại của team).
4. Nếu đụng logic hệ thống, đọc `architecture.md` trước khi sửa.
5. Trước khi chốt, đối chiếu `checklist.md`.

## Nguyên tắc bắt buộc

1. Không đổi URL repository đã nộp.
2. Không làm việc trực tiếp trên `main`.
3. Luôn có hướng dẫn chạy cho cả macOS và Windows.
4. Không commit secrets; chỉ commit `.env.example`.
