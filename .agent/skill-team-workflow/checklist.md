---
context: Portfolio CV Hub Phase 2
---

# Checklist trước khi merge/demo

## Trước khi tạo PR

- [ ] Đã pull `main` mới nhất và merge vào nhánh đang làm.
- [ ] Chức năng chính liên quan thay đổi chạy ổn.
- [ ] Đảm bảo thiết kế Database tuân thủ tài liệu `database-design.md` (Sử dụng PostgreSQL/JSONB) cho mọi thay đổi ở Backend trong **Phase 2**.
- [ ] Đối chiếu acceptance criteria và playbook trong `phase2-execution.md`.
- [ ] Không có secrets trong commit.
- [ ] Nếu đổi lệnh chạy/cấu trúc thì đã cập nhật tài liệu.

## Trước khi merge vào `main`

- [ ] PR mô tả rõ phạm vi thay đổi.
- [ ] File dễ conflict đã trao đổi với team.
- [ ] Không phá luồng candidate/recruiter/admin.

## Trước khi demo/nộp

- [ ] `main` chạy được bằng Docker Compose (`docker compose -f infra/docker-compose.yml up --build`).
- [ ] Có hướng dẫn cho cả macOS và Windows.
- [ ] Có `.env.example` và README đầy đủ.
- [ ] URL repository giữ nguyên theo quy định môn học.
- [ ] Demo được ít nhất một flow Phase 2 end-to-end (job requirement -> score/compare -> radar/export hoặc flow tương đương).
