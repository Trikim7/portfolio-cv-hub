---
context: Portfolio CV Hub Phase 2
---

# Quy trình Git theo nhóm

## Nhánh

- `main`: nhánh ổn định để demo/nộp.
- `<nhanh-ca-nhan>`: nhánh làm việc chính của từng thành viên.
- Tùy chọn: `feature/...` hoặc `fix/...` cho tác vụ tách bạch.

## Luồng hằng ngày

1. Cập nhật `main`.
2. Merge `main` vào nhánh đang làm.
3. Code -> commit -> push nhánh cá nhân.
4. Tạo PR vào `main`.
5. Sau merge, đồng bộ lại nhánh cá nhân.

## Lệnh mẫu

```bash
git checkout main
git pull origin main
git checkout ten-nhanh-cua-ban
git merge main
git add .
git commit -m "feat: mo ta ngan"
git push origin ten-nhanh-cua-ban
```

## Commit message

- `feat:`, `fix:`, `docs:`, `chore:`
- Ví dụ: `feat(recruiter): them API tim ung vien theo skill`

## File dễ conflict

`package.json`, `infra/docker-compose.yml`, `requirements.txt`, file tổng hợp route/import.
