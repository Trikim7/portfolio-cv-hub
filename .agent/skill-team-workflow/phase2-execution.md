---
context: Portfolio CV Hub Phase 2
---

# Phase 2 Execution Playbook

## Mục tiêu

Tài liệu một cửa để team triển khai Phase 2 bằng AI, bám sát:

- `PHASE_2_PLAN.md`
- `kimductri-project-proposal.md`

---

## 1) Scope + Definition of Done

Phase 2 gồm 7 khối:

1. Scoring & candidate matching (6 trục radar + overall score)
2. Quản lý nhiều user + dữ liệu demo
3. Radar chart so sánh ứng viên
4. Auto-generate CV
5. Social auth (Google/GitHub/Facebook)
6. Cloud deployment (Vercel + managed PostgreSQL)
7. Multilingual (VI/EN) + export/reporting

### DoD theo tính năng

- **Scoring + Radar**
  - Có API score 1 ứng viên theo 1 job requirement.
  - Có API compare nhiều ứng viên theo cùng requirement.
  - Trả về đủ 6 trục radar + overall + matched/missing/extra.
  - Dùng chung một scoring engine cho `score` và `compare`.
- **Demo data**
  - Có script seed dữ liệu lớn và script reset.
- **Auto CV**
  - Sinh được CV từ dữ liệu portfolio, ưu tiên PDF trước.
- **Social auth**
  - OAuth Google/GitHub/Facebook chạy được login lần đầu và đăng nhập lại.
- **Deployment**
  - Deploy frontend/backend ổn định với managed DB.
- **Multilingual (VI/EN)**
  - Có cơ chế chuyển ngôn ngữ cho UI chính và fallback ngôn ngữ.
- **Reporting**
  - Export compare results ra CSV/Excel hoặc PDF.

---

## 2) Scoring + Radar Playbook

### Input chuẩn

- `job_requirements` từ DB
- Dữ liệu từ `candidate_profiles`, `skills`, `experiences`, `projects`, `profile_views`

### 6 trục (0-10)

1. Technical Skills Match
2. Experience & Role Match
3. Portfolio & Practical Evidence
4. Soft Skills & Communication
5. Leadership & Ownership
6. Profile Readiness & Signals

### Overall (0-100)

```text
technical*0.25 + experience*0.25 + portfolio*0.20 +
soft_skills*0.10 + leadership*0.10 + readiness*0.10
```

### Case đặc biệt

- Job không yêu cầu quản lý: leadership xử lý theo rule sản phẩm (bonus hoặc dồn weight).
- Không có project: re-weight theo rule cấu hình.
- Có extra skills: không trừ điểm.

### Rule kiến trúc

- Logic score nằm ở service/domain, không để ở router.
- `compare` bắt buộc gọi cùng scoring function với `score`.
- Weight lấy từ `weights_config` nếu có, fallback default.

### Test

- Unit test từng trục.
- Unit test overall.
- Integration test 2 endpoint.

---

## 3) Social Auth Playbook

### Luồng chuẩn

1. Frontend gọi endpoint bắt đầu OAuth.
2. Redirect provider.
3. Callback với code.
4. Backend đổi token.
5. Backend lấy profile provider.
6. Check `(provider, provider_account_id)` ở `social_accounts`.
7. Tạo/link user.
8. Tạo session/JWT nội bộ.

### Bảo mật

- Bắt buộc `state` chống CSRF.
- Validate redirect URI.
- Không log token/secrets.
- Không hardcode secrets.

### Verify

- Login lần đầu, login lại, link account, logout.

---

## 4) CV Generator Playbook

### Workflow

1. Mở Generate CV
2. Chọn template
3. Preview
4. Export (ưu tiên PDF)

### Nguyên tắc

- Tách `data assembler` / `template renderer` / `export adapter`.
- Có fallback khi thiếu dữ liệu.
- Không để frontend xử lý business format phức tạp.

### Test

- Export thành công với dữ liệu đủ.
- Export không crash khi thiếu project/experience.

---

## 5) Deployment Playbook (Vercel)

### Checklist chính

- Cấu hình Vercel chuẩn.
- Managed PostgreSQL (Neon/Supabase).
- Env tách dev/staging/prod.
- Health check sau deploy.

### CI/CD tối thiểu

- PR -> preview deploy.
- Merge `main` -> production deploy.

### Hậu kiểm

- Auth chạy.
- Flow score/compare chạy.
- Frontend gọi đúng API domain.

---

## 6) Multilingual (VI/EN) Playbook

### Phạm vi tối thiểu

- Có language switch cho các màn hình chính.
- Chuẩn hóa translation keys theo module (auth, profile, recruiter, admin).
- Có fallback khi thiếu bản dịch (ưu tiên `vi` hoặc `en`, tùy cấu hình team).

### Rule kỹ thuật

- Text tĩnh UI đi qua i18n layer, không hardcode trong component chính.
- Dữ liệu đa ngôn ngữ từ DB phải có rule chọn locale rõ ràng.
- Không block render nếu thiếu translation key; phải fallback.

### Verify

- Test chuyển ngôn ngữ trên 1 flow end-to-end.
- Test fallback khi key bị thiếu.

---

## 7) Export & Reporting Playbook

### Phạm vi ưu tiên

1. Export compare ra CSV/Excel.
2. Export PDF summary.

### Dữ liệu tối thiểu

- Candidate info
- 6 điểm radar
- Overall score
- Ranking
- Timestamp + job requirement context

### Rule kỹ thuật

- Export từ backend data đã tính sẵn.
- Endpoint export phải có auth + role recruiter/admin.
- Test encoding tiếng Việt.

---

## 8) Quy tắc nghiệm thu chung

- Mỗi tính năng có demo flow end-to-end.
- Có test unit/integration phù hợp.
- Có hướng dẫn tái lập, không phụ thuộc máy dev cá nhân.
