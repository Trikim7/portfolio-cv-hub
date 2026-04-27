---
name: skill-team-workflow
context: Portfolio CV Hub Phase 2
description: Skill vận hành team bằng AI cho Phase 2 Portfolio CV Hub, bám sát proposal và PHASE_2_PLAN.md.
---

# Agent Skill: Team Workflow

## Mục tiêu

Skill này là bộ quy định + playbook triển khai để cả team làm việc bằng AI theo đúng proposal và kế hoạch Phase 2.  
Nó trả lời 4 câu hỏi: làm gì, ai làm, làm theo thứ tự nào, kiểm tra ra sao.

## Nguồn chuẩn bắt buộc

Mọi quyết định nghiệp vụ phải đối chiếu 2 nguồn sau:

- `PHASE_2_PLAN.md`
- `kimductri-project-proposal.md`

## Cấu phần của skill

- [Quy ước tổng quan](reference.md)
- [Cấu trúc thư mục chuẩn](structure.md)
- [Kiến trúc hệ thống](architecture.md)
- [Ranh giới backend/frontend](backend-frontend.md)
- [Quy trình Git theo nhóm](git-workflow.md)
- [Lệnh chạy macOS + Windows](run-commands.md)
- [Thiết kế Cơ sở dữ liệu Phase 2](database-design.md)
- [Workflow team với AI](ai-team-execution.md)
- [Playbook thực thi Phase 2 (gộp)](phase2-execution.md)
- [Checklist trước khi merge/demo](checklist.md)

## Cách dùng nhanh

1. Đọc `reference.md`.
2. Đọc `phase2-execution.md` để map task vào đúng scope và playbook.
3. Nếu làm backend hoặc DB, **bắt buộc đối chiếu** `database-design.md`.
4. Nếu task liên quan phối hợp người, đọc `ai-team-execution.md` để chia việc theo role.
5. Trước khi chốt PR/demo, tick đủ `checklist.md`.

## Quy tắc làm việc với AI (bắt buộc)

1. Mỗi task phải mở đầu bằng: mục tiêu + phạm vi + file sẽ sửa.
2. Không code khi chưa xác định rõ acceptance criteria trong `phase2-execution.md`.
3. API phải có request/response mẫu trước khi implement.
4. Mọi thay đổi schema phải cập nhật lại `database-design.md` cùng PR.
5. Không merge nếu chưa tự verify bằng checklist kỹ thuật và checklist nghiệp vụ.

## Nguyên tắc bắt buộc

1. Không đổi URL repository đã nộp.
2. Không làm việc trực tiếp trên `main`.
3. Luôn có hướng dẫn chạy cho cả macOS và Windows.
4. Không commit secrets; chỉ commit `.env.example`.
