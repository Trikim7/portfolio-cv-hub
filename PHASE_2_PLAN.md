# Kế hoạch Phase 2 - Portfolio CV Hub

## 📋 Tổng quan Phase 2

**Mục đích:** Mở rộng nền tảng với các tính năng nâng cao cho nhà tuyển dụng và người quản trị, bao gồm khớp ứng viên thông minh, trực quan hóa dữ liệu, xác thực xã hội và triển khai trên đám mây.

---

## 🎯 Các yêu cầu Phase 2

### 1. Logic Tính Điểm & Khớp Ứng Viên (Từ CV/Portfolio)

**Mô tả:**
- Cung cấp giao diện cho Doanh nghiệp nhập các tiêu chí tuyển dụng (Job Requirements) cho một vị trí cụ thể.
- Xây dựng hệ thống chấm điểm thông minh để tính phần trăm khớp dựa trên tiêu chí đã nhập.
- **Workflow:** Doanh nghiệp nhập yêu cầu → Hệ thống lấy dữ liệu ứng viên từ DB → So sánh & Tính toán → Xếp hạng ứng viên.
- Tính 6 yếu tố Radar (0-10 mỗi cái) → Tính Overall Match Score (0-100).
- Hỗ trợ so sánh hàng loạt nhiều ứng viên dựa trên cùng một bộ yêu cầu.
- **LƯU Ý:** Yêu cầu 1 & 3 dùng CÙNG một hệ thống tính điểm.

**Chi tiết triển khai:**

**Bước 0:** Lấy dữ liệu từ DB (Dựa trên cấu trúc Database hiện tại):
```
Từ hồ sơ Portfolio `CandidateProfile`:
- skills[] → `name`, `level` (entry/junior/mid/senior/lead), `endorsements` (tín hiệu mạnh từ LinkedIn)
- experiences[] → `job_title`, `description`, `start_date` tới `end_date` (tính ra số năm)
- projects[] → `title`, `description`, `url` (có link thực tế không?), `technologies`
- profile → `bio`, `views` (độ hot/tương tác), `updated_at` (độ active)
*Lưu ý: System hiện không có Education, Certification hay Project Scale. Sẽ dùng các keyword và độ chi tiết của profile để đánh giá.*
```

**Bước 1:** Tính 6 yếu tố Radar Chart (0-10 mỗi cái) học theo tư duy LinkedIn (áp dụng bộ lọc AI + Tín hiệu mạnh):

1. **Technical Skills Match (Từ Skills + Mức độ chứng thực):**
   - Lấy từ: Bảng `skills` (`name`, `level`, và `endorsements`) liên kết với `candidate_profiles`
   - So sánh với: `job_requirements.required_skills`
   - Formula: Mức độ match keyword + Điểm thưởng level (Senior/Lead) + **Bonus cực mạnh** nếu có `endorsements` cao (Recommendation signal từ LinkedIn).

2. **Experience & Role Match (Từ Experiences):**
   - Lấy từ: Bảng `experiences` (`start_date`, `end_date`, `job_title`) liên kết với `candidate_profiles`
   - So sánh với: `job_requirements.years_experience`, `required_role`
   - Formula: Tổng số năm KN thực + Mức độ khớp keyword vị trí trong `job_title` (vd: Senior Dev có chứa chữ Dev).

3. **Portfolio & Practical Evidence (Từ Projects):**
   - Lấy từ: Bảng `projects` (`technologies`, `description`, `url`) liên kết với `candidate_profiles`
   - So sánh với: `job_requirements.tech_stack`
   - Formula: Match công nghệ trong project + Điểm "Thực tế" (Dự án có URL live / source code để xem chi tiết không, thay vì tính scale ảo).

4. **Soft Skills & Communication (Từ Bio & Description):**
   - Lấy từ: Quét NLP/Keyword trên cột `bio` của bảng `candidate_profiles` và cột `description` của bảng `experiences`
   - So sánh với: Yêu cầu giao tiếp
   - Formula: Đếm mật độ Semantic Keywords liên quan (teamwork, communicate, present, client, agile...).

5. **Leadership & Ownership (Từ Titles & Levels):**
   - Lấy từ: `experiences.job_title` (chứa các từ Lead, Manager, Head), hoặc `skills.level` == 'LEAD'
   - So sánh với: `job_requirements.is_management_role`
   - Formula: Tồn tại kinh nghiệm quản lý thực tế trong title.

6. **Profile Readiness & Signals (Tín hiệu tuyển dụng theo chuẩn LinkedIn):**
   - Lấy từ: Cấu trúc bảng `candidate_profiles` (kiểm tra `avatar_url`, `bio`, số `views`, thời gian `updated_at`)
   - So sánh với: N/A (Chấm độ readiness tuyệt đối)
   - Formula: Profile đầy đủ (`avatar_url` + `bio` không NULL) + Gần đây có hoạt động (`updated_at` < 30 ngày) + Có `views` cao → Recruiter ưu tiên.

**Bước 2:** Ánh xạ 6 yếu tố Radar → Tổng % Overall Match:
```
Score = (Technical_Skills × 0.25) + (Experience × 0.25) + (Portfolio × 0.20) 
      + (Soft_Skills × 0.10) + (Leadership × 0.10) + (Readiness_Signals × 0.10)
= 0-100 điểm

**Ví dụ cụ thể từ DB:**

Ứng viên: Nguyễn An
Dữ liệu từ Database:
- Skills: Python (Level=SENIOR, Endorsements=5), React (Level=MID, Endorsements=0), PostgreSQL (Level=JUNIOR, Endorsements=1)
- Experiences: 
  * "Senior Backend Engineer" @ Tech Corp (2023-nay: 3 năm, mô tả: "Leading team 5, communicating with clients...")
  * "Junior Developer" @ StartUp (2021-2023: 2 năm)
- Projects:
  * Project A: Python, React (Có URL live, description dài 500 ký tự)
- Profile: Bio chi tiết, có Avatar, Views=150, updated 2 ngày trước.

Job Requirements:
- Required skills: [Python, React, PostgreSQL]
- Years experience: 3 năm
- Role hint: "Backend"
- Management role: false
- Customer facing: true

Tính toán:

1. Technical Skills Match:
   - Khớp 3/3 skill → 6 điểm
   - Level Senior Python > required → 1.5 điểm
   - Tín hiệu mạnh (5 endorsements vào Python) → 2.5 điểm
   - Result: 10 điểm

2. Experience Match:
   - Tổng năm: 5 năm >= 3 required = 6 điểm
   - Title match: Có chữ "Backend" trong past job = 4 điểm
   - Result: 10 điểm

3. Portfolio Match:
   - Match công nghệ dự án: Python + React (2 max) = 5 điểm
   - Dự án có live URL (có chứng cứ thực tế) = 3 điểm
   - Description đầy đủ = 2 điểm
   - Result: 10 điểm

4. Soft / Communication Match:
   - Quét description thấy "communicating with clients" → 8 điểm
   - Bio hoàn chỉnh dễ đọc → 2 điểm
   - Result: 10 điểm

5. Leadership Match:
   - Job không yêu cầu quản lý, nhưng ứng viên có "Leading team" trong mô tả và level SENIOR = 10 điểm (Bonus)
   - Result: 10 điểm

6. Readiness & Signals (Chuẩn LinkedIn):
   - Đang active (Updated 2 ngày trước) = 5 điểm
   - Tương tác cao (150 views) = 3 điểm
   - Profile hoàn thiện (Avatar, bio) = 2 điểm
   - Result: 10 điểm

Overall Match Score (Ví dụ hoàn hảo 100/100). Đảm bảo chuẩn xác với AI Ranking của hệ thống tuyển dụng.
```

**Các trường hợp đặc biệt:**
- Nếu job KHÔNG yêu cầu quản lý: Leadership score cộng vào Communication (×2 weight)
- Nếu job là remote: Không cần kiểm tra vị trí địa lý
- Nếu không có Portfolio: Portfolio weight phân bố sang Technical Skills
- Nếu ứng viên có skills THỪA không yêu cầu: Được khuyến khích (không bị trừ)

---

### 2. Quản lý Nhiều Người Dùng & Dữ liệu Giả

**Mô tả:**
- Tạo hỗ trợ cho nhiều tài khoản người dùng với các vai trò khác nhau
- Xây dựng tạo dữ liệu giả/demo để kiểm tra và trình diễn
- Tạo hồ sơ người dùng với các cấp độ kỹ năng, phạm vi kinh nghiệm khác nhau
- Tạo danh mục dự án thực tế
- Khởi tạo cơ sở dữ liệu với các ứng viên và nhà tuyển dụng mẫu
- Bảng điều khiển quản lý người dùng cho quản trị viên

**Các tính năng chính:**
- Script khởi tạo dữ liệu demo: 1000+ ứng viên, 100+ nhà tuyển dụng, 1 quản trị viên
- Trình tạo hồ sơ giả: tên, email, kỹ năng, kinh nghiệm, dự án
- Chức năng khôi phục cơ sở dữ liệu để kiểm tra

---

### 3. Biểu đồ Radar

**Mô tả:**
- Hiển thị hồ sơ kỹ năng ứng viên bằng biểu đồ radar/spider với 6 yếu tố chính
- So sánh biểu đồ radar của nhiều ứng viên cạnh nhau
- Chỉ báo khớp trực quan: làm nổi bật các khoảng trống giữa yêu cầu công việc và kỹ năng ứng viên
- Tooltip tương tác khi di chuột hiển thị chi tiết kỹ năng
- Xuất biểu đồ radar dưới dạng hình ảnh
- **Tính toán động:** Biểu đồ thay đổi ngay lập tức khi Doanh nghiệp thay đổi/điều chỉnh trọng số yêu cầu (VD: tăng mức độ quan trọng của Kỹ năng kỹ thuật).
- **Cách tính điểm là TƯƠNG ĐỐI so với Job Requirements, không phải tuyệt đối**

**6 Yếu tố Radar Chart (Tích hợp Radar truyền thống và AI Signals của LinkedIn):**

1. **Kỹ năng Kỹ thuật (Technical Skills Match)** → 0-10
   - **Nguồn:** `skills` table (Name, Level, Endorsements)
   - **Logic tính toán:** Tỷ lệ % khớp (5đ) + Độ sâu Level (2.5đ) + Endorsements Signals (2.5đ nếu có ai đó endorse - giống LinkedIn Recommendation).

2. **Kinh nghiệm (Experience & Role Match)** → 0-10
   - **Nguồn:** `experiences` table (`start_date`, `end_date`, `job_title`)
   - **Logic tính toán:** Tính chính xác tổng thời gian làm việc (5đ) + Mức độ khớp keyword ngành/vị trí (5đ). Không dùng `industry` vì Schema không có.

3. **Thực chứng Dự án (Portfolio Match)** → 0-10
   - **Nguồn:** `projects` table (technologies, url, description)
   - **Logic tính toán:** Trùng khớp tech stack dự án (6đ) + Dự án có link live/URL (2đ) + Description viết đầy đủ/nghiêm túc (2đ) (Thay thế cho số users/complexity bị thiếu).

4. **Kỹ năng Mềm (Soft Skills Match)** → 0-10
   - **Nguồn:** `CandidateProfile.bio` và `experiences.description`
   - **Logic tính toán:** (AI Feature) Đếm mật độ Semantic Keywords về giao tiếp, thuyết trình, teamwork. Càng nhiều từ khóa tích cực, điểm càng cao.

5. **Lãnh đạo & Quản lý (Leadership Match)** → 0-10
   - **Nguồn:** `experiences.job_title` hoặc `Skill.level` == 'LEAD'
   - **Logic tính toán:** Nếu Job ko cần, bonus trực tiếp hoặc match theo cấp độ. Lấy mốc Title chứa "Lead/Manager" = 10, Level LEAD = 8.

6. **Tín hiệu Tuyển dụng (Readiness & Signals)** → 0-10
   - **Nguồn:** `views`, `updated_at`, Full completeness.
   - **Logic tính toán chuẩn LinkedIn:** 
     - "Mức độ sẵn sàng" (Active within 30 days) = 4 điểm.
     - "Sức hút profile" (Profile views > x) = 3 điểm.
     - "Độ hoàn thiện" (Bio dài, avatar, >3 skills, >1 exp) = 3 điểm.

**API Endpoints để Tính Toán Điểm:**

```python
# POST /api/v1/candidates/score
# Tính điểm Radar cho 1 ứng viên dựa trên job requirements

Request:
{
  "candidate_id": 123,
  "job_id": 456
}

Response:
{
  "candidate_id": 123,
  "job_id": 456,
    "radar_scores": {
      "technical_skills": 7.5,
      "experience": 8.0,
      "portfolio": 6.5,
      "soft_skills": 9.0,
      "leadership": 7.0,
      "readiness_signals": 8.5
    },
  "overall_match_percentage": 77.5,
  "match_details": {
    "technical_skills": {
      "matched": ["Python", "React"],
      "missing": ["PostgreSQL"],
      "extra": ["Kubernetes"],
      "score": 7.5
    },
    "experience": {
      "candidate_years": 5,
      "required_years": 3,
      "industry_match": "Finance",
      "score": 8.0
    }
  }
}
```

```python
# POST /api/v1/candidates/compare
# So sánh nhiều ứng viên với cùng 1 công việc

Request:
{
  "candidate_ids": [123, 124, 125],
  "job_id": 456
}

Response:
{
  "job_id": 456,
  "candidates": [
    {
      "candidate_id": 123,
      "full_name": "Nguyễn An",
      "radar_scores": {
        "technical_skills": 8.5,
        "experience": 9.0,
        "portfolio": 7.5,
        "soft_skills": 8.0,
        "leadership": 7.5,
        "readiness_signals": 8.0
      },
      "overall_match": 82.5,
      "ranking": 1
    },
    {
      "candidate_id": 124,
      "full_name": "Trần Bình",
      "radar_scores": {...},
      "overall_match": 75.0,
      "ranking": 2
    }
  ],
  "comparison": {
    "best_match": 123,
    "average_match": 75.8,
    "highest_skill": "Nguyễn An (8.5)"
  }
}
```

**Ngăn xếp công nghệ:**
- Frontend: Recharts hoặc Chart.js để vẽ radar chart
- Backend: FastAPI endpoint tính toán điểm so sánh
- Thư viện: `recharts`, `chart.js`
- Caching: Redis lưu kết quả tính toán (5 phút)
- Tính năng: Cập nhật thời gian thực, thiết kế đáp ứng, thân thiện với in
- Màu sắc động: Xanh (tốt ≥8), Vàng (trung bình 5-7), Đỏ (yếu <5)
- So sánh: Overlay 2-3 ứng viên trên cùng biểu đồ, hiển thị bóng mờ

**Dữ liệu sử dụng:**
```json
{
  "job_requirements": {
    "required_skills": ["Python", "React", "PostgreSQL"],
    "years_experience": 3,
    "industry": "Finance",
    "degree_level": "Đại học",
    "required_certifications": ["AWS"],
    "is_management_role": false,
    "customer_facing": true,
    "tech_stack": ["Python", "React", "PostgreSQL", "AWS"]
  },
  "candidate_profiles": {
    "full_name": "Nguyễn An",
    "skills": [
      {"name": "Python", "level": "SENIOR", "endorsements": 5},
      {"name": "React", "level": "MID", "endorsements": 0},
      {"name": "Kubernetes", "level": "JUNIOR", "endorsements": 1}
    ],
    "experiences": [
      {"job_title": "Senior Backend Engineer", "company_name": "Tech Corp", "start_date": "2023-01-01", "end_date": null}
    ],
    "projects": [
      {"title": "Project A", "technologies": "Python, React", "url": "https://url.com", "description": "Backend services for finance"}
    ],
    "views": 150,
    "updated_at": "2026-04-10T12:00:00Z"
  }
}
```

---

### 4. Tự động Sinh CV từ Dữ liệu Portfolio (Auto-generate CV)

**Mô tả:**
- Cho phép ứng viên tự động sinh CV từ dữ liệu portfolio hiện có
- Hệ thống tích hợp tất cả thông tin: Skills, Experience, Projects, Education
- Hỗ trợ nhiều định dạng xuất (PDF, Word, HTML)
- Tùy chỉnh template CV (chọn style, layout, màu sắc)
- Tự động cập nhật CV khi hồ sơ thay đổi
- Tải xuống CV và gửi qua email

**Các tính năng chính:**
- Tự động gom thông tin từ: Skills, Experiences, Projects, Education, Certifications
- Các template CV có sẵn: Traditional, Modern, Creative, Minimal
- Tỷ lệ: 1 trang, 2 trang
- Tùy chỉnh: Logo, Header, Footer, Màu sắc, Font
- Xem trước real-time khi chỉnh sửa

**Workflow:**
1. Ứng viên truy cập "Generate CV"
2. Chọn template CV
3. Tùy chỉnh bố cục và style
4. Xem trước
5. Tải xuống (PDF/Word/HTML) hoặc gửi email

**Dữ liệu sử dụng:**
```json
{
  "cv": {
    "personal_info": {
      "full_name": "Nguyễn An",
      "email": "nguyen@example.com",
      "phone": "0987654321",
      "location": "Hà Nội",
      "summary": "Senior Developer với 5 năm kinh nghiệm"
    },
    "skills": ["Python", "React", "PostgreSQL"],
    "experiences": [
      {
        "title": "Senior Dev",
        "company": "Tech Corp",
        "duration": "3 years",
        "description": "..."
      }
    ],
    "projects": [
      {
        "name": "Project A",
        "description": "...",
        "technologies": ["Python", "React"]
      }
    ],
    "education": {
      "degree": "Đại học",
      "major": "CNTT"
    }
  }
}
```

**Công nghệ:**
- Backend: Python (reportlab, python-docx, weasyprint)
- Frontend: React component để custom template
- Thư viện: `jsPDF`, `pdfkit`, `html2pdf`

---

### 5. Xác thực Xã hội (Google, GitHub)

**Mô tả:**
- Xây dựng đăng nhập OAuth2 với Google, GitHub
- Chuyển hướng người dùng đến nhà cung cấp OAuth, xử lý gọi lại
- Tạo tài khoản tự động khi đăng nhập lần đầu
- Liên kết tài khoản xã hội với hồ sơ hiện có
- Thêm chức năng đăng xuất cho tất cả các nhà cung cấp
- Lưu trữ token nhà cung cấp một cách an toàn cho các cuộc gọi API trong tương lai
- Xử lý lỗi xác thực một cách linh hoạt

**Chi tiết triển khai:**
```
Các nhà cung cấp:
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- GitHub OAuth: https://docs.github.com/en/developers/apps/building-oauth-apps

Quy trình:
1. Người dùng nhấp vào "Đăng nhập bằng [Nhà cung cấp]"
2. Chuyển hướng đến URL xác thực của nhà cung cấp
3. Người dùng cho phép ứng dụng
4. Gọi lại ứng dụng với mã xác thực
5. Trao đổi mã để có token truy cập
6. Lấy hồ sơ người dùng từ nhà cung cấp
7. Tạo/cập nhật người dùng trong cơ sở dữ liệu
8. Tạo token phiên
9. Chuyển hướng đến bảng điều khiển
```

---

### 6. Triển khai Đám mây & Cơ sở hạ tầng (Vercel & Modern Stack)

**Mô tả:**
- Triển khai Frontend và Backend Serverless trên nền tảng **Vercel**.
- Sử dụng Database được quản lý (Neon PostgreSQL hoặc Supabase) để tối ưu hóa kết nối serverless.
- Thiết lập quy trình CI/CD tự động qua Vercel GitHub Integration.
- Định cấu hình Enviroment Variables và Edge Caching cho hiệu suất cao.

**Danh sách kiểm tra triển khai:**
- [ ] Cấu hình `vercel.json` cho cả Frontend và Backend.
- [ ] Thiết lập Managed PostgreSQL (Neon/Supabase).
- [ ] Tối ưu hóa API Routes để chạy dưới dạng serverless functions.
- [ ] Chứng chỉ SSL/TLS tự động qua Vercel.
- [ ] Cấu hình Custom Domain.

---

## 📊 Hệ thống Yêu cầu Công việc (Job Requirements Management)

**Mô tả:**
- Doanh nghiệp có thể tạo, lưu và quản lý các bộ tiêu chí tìm kiếm (Job Requirements).
- Hệ thống hỗ trợ "Templates" cho các vị trí phổ biến (VD: Java Dev Senior, React Junior).
- **Tính năng chính:**
  - Form nhập yêu cầu chi tiết: Kỹ năng, số năm kinh nghiệm, vai trò.
  - Quản lý danh sách các Job đã tạo.
  - Tái sử dụng yêu cầu cũ cho các đợt tìm kiếm mới.
  - Tùy chỉnh trọng số (Weight) cho từng tiêu chí để thay đổi cách tính Overall Score.

---

## 📈 Xuất & Tính năng Báo cáo

**Mô tả:**
- Xuất so sánh ứng viên sang định dạng CSV/Excel
- Tạo báo cáo PDF với các ứng viên phù hợp
- Chức năng xuất hàng loạt cho nhiều ứng viên
- Báo cáo phân tích so sánh
- Báo cáo phân tích khoảng trống kỹ năng
- Hỗ trợ API cho xuất theo chương trình
- Tạo báo cáo theo lịch trình và gửi qua email

---

### 7. Hỗ trợ Đa ngôn ngữ (Multilingual Support - VI/EN)

**Mô tả:**
- Cho phép người dùng chuyển đổi ngôn ngữ toàn bộ hệ thống (Tiếng Việt & Tiếng Anh).
- Hỗ trợ xuất CV đa ngôn ngữ dựa trên lựa chọn của người dùng.
- Tự động dịch các label và nội dung tĩnh.

---

## 👥 Phân chia Nhiệm vụ cho 4 Thành viên (Phiên bản 2)

### Thành viên 1: Full-stack - Hệ thống Tính điểm & Xác thực

**Trách nhiệm:** Hoàn thiện trọn gói (Backend + Frontend) cho 2 chức năng:

1. **Hệ thống Tính điểm & Xếp hạng (Scoring & Ranking):**
   - Backend: Xây dựng thuật toán chấm điểm 6 yếu tố, logic AI Matching và Ranking API.
   - Frontend: Bảng hiển thị xếp hạng ứng viên, bộ lọc ứng viên theo điểm số.

2. **Xác thực Xã hội (Social Auth):**
   - Backend: Cấu hình OAuth2 (Google, GitHub), xử lý Token.
   - Frontend: Giao diện đăng nhập xã hội, liên kết tài khoản và quản lý phiên đăng nhập.

---

### Thành viên 2: Full-stack - Quản lý Job & Tự động Sinh CV

**Trách nhiệm:** Hoàn thiện trọn gói (Backend + Frontend) cho 2 chức năng:

1. **Hệ thống Yêu cầu Công việc (Job Requirements):**
   - Backend: CRUD API cho Job Requirements, lưu trữ bộ tiêu chí và trọng số (weights).
   - Frontend: Form nhập liệu thông minh cho Doanh nghiệp, quản lý các Job đã tạo.

2. **Tự động Sinh CV (CV Generator):**
   - Backend: Engine xuất PDF/Word đa ngôn ngữ từ dữ liệu Portfolio.
   - Frontend: Giao diện CV Builder, Live Preview CV và chọn Template.

---

### Thành viên 3: Full-stack - Trực quan hóa & Đa ngôn ngữ

**Trách nhiệm:** Hoàn thiện trọn gói (Backend + Frontend) cho 2 chức năng:

1. **Biểu đồ Radar (Radar Chart Visualization):**
   - Backend: Logic tính toán Radar Map cho từng nhóm kỹ năng.
   - Frontend: Component Radar Chart tương tác, tính năng điều chỉnh trọng số điểm real-time.

2. **Hỗ trợ Đa ngôn ngữ (Multilingual - i18n):**
   - Backend: Xây dựng cấu trúc dữ liệu đa ngôn ngữ cho Bio, Kinh nghiệm, Dự án.
   - Frontend: Tích hợp thư viện i18n, nút chuyển đổi ngôn ngữ Việt/Anh toàn hệ thống.

---

### Thành viên 4: Infrastructure & Frontend Polish

**Trách nhiệm:** Hoàn thiện hạ tầng và chịu trách nhiệm thẩm mỹ tổng thể:

1. **Triển khai & Hạ tầng (Deployment & DevOps):**
   - Cấu hình triển khai hệ thống lên **Vercel** (Frontend & Backend Serverless).
   - Quản lý Database Neon/Supabase, CI/CD Pipeline.
   - Viết Integration Tests cho toàn bộ quy trình từ Nhập yêu cầu -> Xếp hạng.

2. **Tối ưu hóa Giao diện (Global Frontend Polish):**
   - Rà soát, chỉnh sửa CSS/UI toàn hệ thống đảm bảo tính nhất quán (Consistency).
   - Tối ưu hóa trải nghiệm người dùng (UX), Micro-animations.
   - Đảm bảo thiết kế đáp ứng (Responsive) trên tất cả thiết bị.

---

## 📅 Lịch trình & Cột mốc

| Tuần | Cột mốc | Trạng thái | 
|------|---------|-----------|
| Tuần 1-2 | Cấu hình Vercel, Neon DB & Xác thực OAuth2 | Chưa bắt đầu |
| Tuần 2-3 | Thiết lập Đa ngôn ngữ (i18n) & CRUD Job Requirements | Chưa bắt đầu |
| Tuần 3-4 | Xây dựng Scoring Engine & Logic AI Ranking | Chưa bắt đầu |
| Tuần 4-5 | Radar Chart Visualization & Live Preview CV | Chưa bắt đầu |
| Tuần 5-6 | Generator CV đa ngôn ngữ & Email Service | Chưa bắt đầu |
| Tuần 6-7 | Test tích hợp luồng Recruiter Search | Chưa bắt đầu |
| Tuần 7-8 | Tối ưu hóa UI/UX & Fix lỗi | Chưa bắt đầu |
| Tuần 8 | Final Deploy lên Vercel Production | Chưa bắt đầu |

---

## 🚀 Chiến lược Triển khai

### Danh sách kiểm tra trước triển khai

- [ ] Tất cả tính năng được kiểm tra cục bộ
- [ ] Mã được xem xét và hợp nhất vào nhánh chính
- [ ] Di chuyển cơ sở dữ liệu được kiểm tra trên staging
- [ ] Biến môi trường được cấu hình
- [ ] Chứng chỉ SSL được lấy
- [ ] Cảnh báo giám sát được cấu hình
- [ ] Quy trình sao lưu được xác minh
- [ ] Kiểm tra tải hoàn thành
- [ ] Kiểm tra bảo mật hoàn thành
- [ ] Tài liệu được cập nhật

### Danh sách kiểm tra sau triển khai

- [ ] URL sản xuất có thể truy cập
- [ ] Tất cả API phản hồi chính xác
- [ ] Sao lưu cơ sở dữ liệu đang chạy
- [ ] Bảng điều khiển giám sát hoạt động
- [ ] Ghi nhật ký hoạt động đúng
- [ ] Thông báo email hoạt động
- [ ] Đăng nhập xã hội được kiểm tra
- [ ] Số liệu hiệu suất chấp nhận được
- [ ] Tiêu đề bảo mật được cấu hình
- [ ] Tài liệu được triển khai

---

## 🔐 Các cân nhắc Bảo mật

- [ ] Mã hóa HTTPS/TLS cho tất cả lưu lượng
- [ ] Lưu trữ token OAuth an toàn
- [ ] Giới hạn tốc độ trên API
- [ ] Bảo vệ CSRF
- [ ] Ngăn chặn SQL injection
- [ ] Bảo vệ XSS
- [ ] Hashing mật khẩu an toàn
- [ ] Mã hóa cơ sở dữ liệu khi lưu trữ
- [ ] Kiểm toán bảo mật thường xuyên
- [ ] Tuân thủ các quy định bảo vệ dữ liệu (GDPR, CCPA, v.v.)

---

## 📝 Ghi chú

1. **Lược đồ cơ sở dữ liệu:** Đảm bảo khả năng tương thích với các mô hình hiện có trước khi phát hành phase 2

2. **Kiểm tra:** Mỗi tính năng nên có kiểm tra đơn vị, kiểm tra tích hợp và kiểm tra end-to-end

3. **Tài liệu:** Giữ tài liệu kỹ thuật cập nhật khi các tính năng được triển khai

4. **Giao tiếp:** Các cuộc họp standup hàng ngày để đồng bộ hóa tiến độ trên toàn đội

5. **Kiểm soát phiên bản:** Sử dụng nhánh tính năng và yêu cầu kéo để xem xét mã

---

**Được tạo:** 14 tháng 4, 2026  
**Phase:** 2  
**Trạng thái:** Lên kế hoạch  
**Cập nhật cuối cùng:** 14 tháng 4, 2026
