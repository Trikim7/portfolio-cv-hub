---
context: Portfolio CV Hub Phase 2
---

# Workflow team với AI

## Mục tiêu

Chuẩn hóa cách cả nhóm dùng AI để tránh chồng chéo, lệch yêu cầu, và merge lỗi.

## Quy trình chuẩn cho mỗi task

1. **Intake**
   - Ghi rõ user story, actor (`candidate/recruiter/admin`), acceptance criteria.
   - Map task vào `phase2-execution.md`.
2. **Plan**
   - Xác định file dự kiến sửa.
   - Chỉ ra rủi ro (schema, auth, API contract, UI regression).
3. **Implement bằng AI**
   - Chia commit nhỏ theo mục tiêu.
   - Mọi endpoint mới phải kèm ví dụ request/response.
4. **Verify**
   - Chạy test/lint liên quan.
   - Tick checklist ở `checklist.md`.
5. **PR**
   - Mô tả: mục tiêu, phạm vi, test evidence, rủi ro còn lại.

## Phân công theo thành viên (bám kế hoạch Phase 2)

- **Thành viên 1**
  - Scoring/ranking + social auth.
- **Thành viên 2**
  - Job requirements CRUD + CV generator.
- **Thành viên 3**
  - Radar visualization + i18n.
- **Thành viên 4**
  - Deployment/infra + frontend polish + integration test.

## Nguyên tắc phối hợp

- Không ai sửa schema “âm thầm”; phải đồng bộ `database-design.md`.
- API thay đổi phải báo frontend owner trước khi merge.
- Với task chéo backend/frontend, merge theo thứ tự:
  1) API contract
  2) backend implementation
  3) frontend integration
  4) E2E verify

## Prompt template khuyến nghị cho AI

```text
Context:
- Repo: Portfolio CV Hub
- Tính năng: <ten-tinh-nang>
- Actor: <candidate/recruiter/admin>
- Ràng buộc: bám PHASE_2_PLAN.md + proposal

Goal:
- <muc-tieu-ro-rang>

Acceptance criteria:
- <criteria-1>
- <criteria-2>

Files expected to change:
- <path-1>
- <path-2>

Verification:
- <test-command>
- <manual-flow>
```
