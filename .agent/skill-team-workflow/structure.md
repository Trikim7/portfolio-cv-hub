---
context: Portfolio CV Hub Phase 2
---

# Cấu trúc thư mục chuẩn

## Cấu trúc đề xuất

```text
portfolio-cv-hub/
  backend/
    app/
      api/
      core/
      models/
      schemas/
      services/
      repositories/
      db/
    tests/
    requirements.txt
    Dockerfile
    .env.example
  frontend/
    src/
      components/
      pages/
      features/
      services/
      hooks/
      layouts/
      utils/
    public/
    package.json
    Dockerfile
    .env.example
  infra/
    docker-compose.yml
    .env.example
  docs/
    api/
    architecture/
  .gitignore
  README.md
```

## Quy tắc tổ chức

- Backend tách lớp rõ theo mô hình Router -> Service -> Repository.
- Frontend gom theo `features` để tránh dồn logic vào `pages`.
- Tài liệu kỹ thuật để trong `docs/` (API, kiến trúc, setup, workflow).
- File hạ tầng để trong `infra/` thay vì để rải rác ở root.
