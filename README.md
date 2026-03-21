# Hướng dẫn làm chung một Git repository (nhóm 4 người)

Tài liệu này dùng cho dự án **Portfolio CV Hub**. Nguyên tắc: **một remote duy nhất**, cả nhóm đẩy code lên **cùng một repo** (theo yêu cầu đồ án: không đổi link repo sau khi đã nộp).

---

## 1. Chuẩn bị lần đầu (mỗi thành viên)

Chỉ **một người** tạo repo trên GitHub (hoặc đã có sẵn), các người còn lại **clone** về máy:

```bash
git clone <URL-repo-cua-nhom>.git
cd portfolio-cv-hub
```

Cấu hình tên/email để commit hiển thị đúng người làm:

```bash
git config user.name "Họ Tên"
git config user.email "email@example.com"
```

(Nếu muốn áp dụng cho mọi repo trên máy, thêm `--global`.)

---

## 2. Nhánh (branch) — tránh sửa trực tiếp lên `main`

### 2.1 Cách nhóm đang dùng: **một nhánh cố định theo tên từng thành viên**

Nhóm đã tạo **4 nhánh** trùng tên (hoặc tên gọi) của từng người — cách này **ổn** cho đồ án nếu mỗi người chủ yếu code phần được phân công và **thường xuyên** đồng bộ với `main`.

| Nhánh | Mục đích |
| ----- | -------- |
| `main` | Code chung đã gộp, dùng để demo / nộp bài. |
| `<nhánh-của-bạn>` | Ví dụ tên theo người: `anh-huy`, `van-hung`, `nhat-hao`, `duc-tri` (tùy nhóm đặt) — **chỉ bạn** (hoặc thống nhất rõ) push lên nhánh này. |

**Lưu ý:**

- **Không checkout nhánh của người khác** để làm việc hộ (trừ khi cặp lập trình và đã báo nhau) — tránh đè commit lẫn nhau.
- Trước khi mở PR hoặc sau khi người khác merge vào `main`, hãy **merge `main` vào nhánh của mình** để giảm conflict (xem mục 4).
- Nếu một người làm **nhiều việc tách bạch** trong tuần, vẫn có thể tạo thêm nhánh ngắn `feature/...` rồi merge vào nhánh cá nhân hoặc PR thẳng `main` — không bắt buộc.

### 2.2 Các kiểu nhánh khác (tùy chọn)

| Nhánh | Khi nào dùng |
| ----- | -------------- |
| `feature/…` | Tính năng lớn muốn tách khỏi nhánh cá nhân: `feature/auth-login`, … |
| `fix/…` | Sửa lỗi gấp: `fix/docker-db-connection` |

---

## 3. Quy trình làm việc hàng ngày (nhánh theo tên thành viên)

### Lần đầu sau khi đã có nhánh trên GitHub

```bash
git fetch origin
git checkout ten-nhanh-cua-ban    # ví dụ: anh-huy
git pull origin ten-nhanh-cua-ban
```

### Mỗi lần ngồi code (khuyến nghị)

```bash
git checkout main
git pull origin main
git checkout ten-nhanh-cua-ban
git merge main
# Nếu có conflict → sửa tay → commit merge
```

Sau đó code trên **nhánh của mình**, commit và push:

```bash
git add .
git commit -m "feat: mô tả ngắn"
git push origin ten-nhanh-cua-ban
```

### Gộp code vào `main`

Trên GitHub: tạo **Pull Request** từ `ten-nhanh-cua-ban` → `main`, review rồi **Merge**.

### Sau khi PR của mình (hoặc của bạn khác) đã merge vào `main`

Để nhánh cá nhân không tụt quá xa:

```bash
git checkout main
git pull origin main
git checkout ten-nhanh-cua-ban
git merge main
git push origin ten-nhanh-cua-ban
```

**Không xóa** nhánh theo tên thành viên (trừ khi cả nhóm đổi quy ước) — nhánh này dùng lặp lại suốt dự án.

---

## 4. Khi nhiều người sửa cùng file

- Ưu tiên **chia module rõ** (auth / candidate / recruiter / admin) để ít đụng nhau.
- File hay conflict: `package.json`, `docker-compose.yml`, `requirements.txt`, route tổng hợp → **thông báo nhóm** trước khi sửa, hoặc một người “owner” gộp thay đổi.
- Trước khi push PR, luôn:

```bash
git checkout main && git pull origin main
git checkout ten-nhanh-cua-ban
git merge main
# hoặc: git rebase main
```

Giải quyết conflict trong editor, rồi `commit` và `push` lại.

---

## 5. `.gitignore` — nên có từ đầu

**Không commit** các thứ sau (thêm vào `.gitignore`):

- Thư mục môi trường ảo Python: `venv/`, `.venv/`
- `node_modules/`
- File chứa bí mật: `.env` (chỉ commit `.env.example` mẫu, không có mật khẩu thật)
- Thư mục build/cache: `dist/`, `build/`, `.next/`, `__pycache__/`, `*.pyc`
- File IDE (tùy nhóm): `.idea/`, `.vscode/` (có nhóm vẫn commit settings chung — thống nhất một cách)

---

## 6. Commit message (gợi ý ngắn gọn)

- `feat:` tính năng mới  
- `fix:` sửa lỗi  
- `docs:` tài liệu  
- `chore:` cấu hình, format, không đổi logic nghiệp vụ  

Ví dụ: `feat(recruiter): API tìm kiếm ứng viên theo skill`

---

## 7. Nếu lỡ commit nhầm / cần hoàn tác (cơ bản)

- **Chưa push:** `git reset --soft HEAD~1` (bỏ commit, giữ thay đổi trong staging).  
- **Đã push:** không rewrite history trên `main` nếu không thống nhất; dùng commit mới để sửa (`git revert`).

Chi tiết nâng cao nhóm có thể bổ sung sau; MVP ưu tiên **PR nhỏ, merge thường xuyên**.

---

## 8. Checklist trước khi demo / nộp bài

- [ ] `main` trên GitHub là bản **chạy được** (`docker compose up` hoặc lệnh nhóm đã thống nhất).  
- [ ] Có `.env.example`, README hướng dẫn clone + chạy.  
- [ ] Không có mật khẩu/API key trong repo.  
- [ ] **Không đổi URL repository** sau khi đã nộp link cho giảng viên (theo quy định đồ án).

---

## 9. Tóm tắt một dòng

**Mỗi người: `pull main` → `merge main` vào nhánh tên mình → code → `push` nhánh mình → PR vào `main` → sau merge, kéo `main` về và merge lại vào nhánh mình.**

Nếu repo thực tế của nhóm khác tên thư mục, chỉ cần thay `cd` cho đúng; quy trình Git giữ nguyên.
