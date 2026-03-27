# Checklist trước khi merge/demo

## Trước khi tạo PR

- [ ] Đã pull `main` mới nhất và merge vào nhánh đang làm.
- [ ] Chức năng chính liên quan thay đổi chạy ổn.
- [ ] **Nếu còn trong giai đoạn MVP (≤ 12.04.2026):** phạm vi không vượt `mvp-scope.md` (trừ khi đã thống nhất làm phase sau). **Sau mốc MVP** bỏ qua dòng này hoặc thay bằng quy ước phase hiện tại của nhóm.
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
