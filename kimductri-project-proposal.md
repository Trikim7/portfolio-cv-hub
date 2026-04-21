# 
    Project Proposal

## THÔNG TIN

### Nhóm

- Thành viên 1: Nguyễn Anh Huy - 23670201
- Thành viên 2: Nguyễn Văn Hùng - 23668291
- Thành viên 3: Trần Nhựt Hào - 23674431
- Thành viên 4: Kim Đức Trí - 23673721

### Git

Git repository: `<`https://github.com/Trikim7/portfolio-cv-hub `>`

```
Lưu ý: 
- chỉ tạo git repository một lần, nếu đổi link repo nhóm sẽ bị trừ điểm.
```

## MÔ TẢ DỰ ÁN

### 1. Ý tưởng

#### 1.1 Tên dự án

**Portfolio CV Hub** - Hệ Thống Portfolio CV Đa Người Dùng

#### 1.2 Mô tả

Xây dựng một hệ thống web cho phép **Ứng viên** (lập trình viên, sinh viên IT) tạo và quản lý portfolio cá nhân trực tuyến, đồng thời cung cấp công cụ cho **Doanh nghiệp** tìm kiếm, so sánh và liên hệ trực tiếp với ứng viên phù hợp.

#### 1.3 Vấn đề cần giải quyết

- Đối với **ứng viên**: Tạo portfolio bằng HTML/CSS tĩnh, mỗi lần cập nhật phải sửa code và deploy lại, mất thời gian và rủi ro lỗi
- Đối với **doanh nghiệp**: Khó tìm kiếm ứng viên phù hợp, phải xem từng CV riêng lẻ, không có công cụ so sánh trực quan

#### 1.4 Giải pháp đề xuất

| Đối tượng           | Giải pháp                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Ứng viên**    | Tạo portfolio qua giao diện trực quan, cập nhật dễ dàng không cần code, xem thống kê lượt xem      |
| **Doanh nghiệp** | Tìm kiếm ứng viên theo kỹ năng/kinh nghiệm, so sánh nhiều ứng viên cùng lúc, liên hệ trực tiếp |
| **Admin**         | Quản lý users, duyệt tài khoản doanh nghiệp, thống kê hệ thống                                        |

---

### 2. Lý do chọn project

- Nhu cầu thực tế: Bản thân là sinh viên trong lĩnh vực CNTT, nhận thấy việc tạo và duy trì portfolio rất tốn thời gian
- Học hỏi công nghệ: Dự án giúp thực hành đầy đủ các kỹ năng Full-stack (Frontend, Backend, Database)
- Giá trị sử dụng: Sản phẩm có thể sử dụng thực tế sau khi hoàn thành

---

### 3. Điểm khác biệt so với phần mềm hiện có

#### 3.1 So sánh

| Tiêu chí                      | LinkedIn         | GitHub Pages        | Portfolio CV Hub      |
| ------------------------------- | ---------------- | ------------------- | --------------------- |
| **Tạo portfolio**        | Hạn chế format | Cần biết code     | Giao diện trực quan |
| **Cập nhật**            | Dễ dàng        | Phải commit/deploy | Dễ dàng, realtime   |
| **Tìm kiếm ứng viên** | Có (trả phí)  | Không có          | Có (miễn phí)      |
| **So sánh ứng viên**   | ❌               | ❌                  | ✅ Radar Chart        |
| **Analytics cá nhân**   | Cơ bản         | ❌                  | ✅ Chi tiết          |

#### 3.2 Tính năng mới (Innovation)

#### Innovation #1: Analytics Dashboard

- Thống kê lượt xem, tải CV, lời mời từ doanh nghiệp
- Biểu đồ trực quan theo thời gian

#### Innovation #2: Profile Comparison

- Doanh nghiệp so sánh 2-3 ứng viên cùng lúc
- Trực quan hóa kỹ năng
- Tính điểm phù hợp tự động
- Export PDF/Excel để báo cáo

## Chi tiết

### 1. Tổng Quan Hệ Thống

Hệ thống được xây dựng nhằm kết nối **Ứng viên** và **Doanh nghiệp**
thông qua một nền tảng portfolio trực tuyến. Ứng viên có thể là sinh viên CNTT, lập trình viên junior/mid cần xây dựng portfolio online. Có nhu cầu cập nhật thông tin nhanh, theo dõi lượt xem, và dễ dàng chia sẻ cho nhà tuyển dụng để giới thiệu kỹ năng và dự án, trong khi doanh nghiệp có thể
tìm kiếm và liên hệ với các ứng viên phù hợp.

Quá trình hoạt động của hệ thống được quản lý và kiểm soát bởi
**Admin**, có thể quản lý người dùng, phê duyệt kiểm soát chất lượng nội dung portfolio và thống kê vận hành hệ thống.

```text
                         +----------------------+
                         |        ADMIN         |
                         | Quan ly va phe duyet |
                         +----------+-----------+
                                    |
                                    v
+----------------------+    +----------------------+    +----------------------+
|      UNG VIEN        |<-->|       HE THONG       |<-->|   DOANH NGHIEP       |
| - Tao portfolio      |    |  Portfolio CV Hub    |    | - Tim ung vien       |
| - Nhan loi moi       |    |                      |    | - So sanh ho so      |
| - Theo doi luot xem  |    |                      |    | - Lien he            |
+----------------------+    +----------------------+    +----------------------+
```

> He thong dong vai tro nen tang trung gian ket noi **Ung vien** va **Doanh nghiep**, dong thoi chiu su quan ly cua **Admin**.

---

### 2. Các Loại Người Dùng

```text
+----------------------+  +----------------------+  +----------------------+
|      UNG VIEN        |  |   DOANH NGHIEP       |  |        ADMIN         |
| Dang ky: Tu do       |  | Dang ky: Can duyet   |  | Tai khoan tao san    |
| Tao va quan ly ho so |  | Tim, loc, lien he    |  | Quan tri he thong    |
+----------------------+  +----------------------+  +----------------------+
```

| Người dùng                       | Vai trò                                                              | Hình thức đăng ký | Quyền sử dụng chính                                                 |
| ----------------------------------- | --------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------- |
| **Ứng viên (Candidate)**    | Tạo portfolio cá nhân để giới thiệu kỹ năng và kinh nghiệm | Đăng ký tự do      | Quản lý hồ sơ, CV, lời mời và thống kê cá nhân               |
| **Doanh nghiệp (Recruiter)** | Tìm kiếm và liên hệ ứng viên phù hợp                         | Cần Admin phê duyệt | Tìm kiếm, xem, so sánh ứng viên và gửi lời mời                 |
| **Admin**                     | Quản lý hệ thống và kiểm duyệt doanh nghiệp                   | Tài khoản tạo sẵn  | Quản lý người dùng, template, cấu hình và thống kê hệ thống |

---

### 3. Nghiệp Vụ Của Ứng Viên

#### 3.1 Đăng ký, đăng nhập và quản lý tài khoản

- Ứng viên đăng ký tài khoản bằng email và mật khẩu.
- Hệ thống gửi email xác nhận (nếu có).
- Ứng viên đăng nhập, có thể:
  - Cập nhật thông tin cá nhân (tên, vị trí công việc, mô tả ngắn).
  - Đổi mật khẩu, quản lý bảo mật tài khoản.

#### 3.2 Tạo và quản lý Portfolio

- Ứng viên tạo **hồ sơ portfolio** mới qua giao diện form:
  - Thông tin cá nhân: họ tên, vị trí mong muốn, tóm tắt bản thân.
  - Kỹ năng (skills): frontend, backend, devops, ngôn ngữ lập trình, framework… kèm mức độ (Beginner/Intermediate/Advanced) hoặc điểm số.
  - Kinh nghiệm làm việc: công ty, vị trí, mô tả công việc, thời gian.
  - Dự án: tên dự án, vai trò, công nghệ sử dụng, link demo/GitHub.
  - Học vấn, chứng chỉ, hoạt động ngoại khóa (nếu có).
- Ứng viên chọn **template giao diện** (theme) có sẵn để hiển thị portfolio.
- Mỗi lần chỉnh sửa nội dung, portfolio được cập nhật **ngay lập tức (realtime)**, không cần sửa code hay deploy.

#### 3.3 Quản lý CV và liên kết chia sẻ

- Ứng viên có thể upload file CV (PDF) hoặc để hệ thống **tự sinh CV** từ dữ liệu đã nhập.
- Hệ thống tạo **đường link công khai** cho portfolio (ví dụ: `/u/ten-ung-vien`), có thể copy và gửi cho nhà tuyển dụng.
- Cho phép:
  - Bật/tắt chế độ công khai portfolio.
  - Tùy chọn thông tin nào được hiển thị công khai (email, số điện thoại, LinkedIn, GitHub,…).

#### 3.4 Theo dõi thống kê (Analytics)

- Ứng viên có trang **Dashboard** hiển thị:
  - Tổng lượt xem portfolio
  - Doanh nghiệp đã xem hồ sơ
  - Số lần CV được tải
  - Số lượng lời mời/đề nghị từ doanh nghiệp.

---

### 4. Nghiệp Vụ Doanh Nghiệp

#### 4.1 Đăng ký, xác thực và quản lý hồ sơ doanh nghiệp

- Doanh nghiệp đăng ký tài khoản với:
  - Tên công ty, email công ty, website, mô tả ngắn.
- Admin duyệt tài khoản doanh nghiệp trước khi cho phép sử dụng đầy đủ chức năng (chống spam/giả mạo).
- Sau khi được duyệt, doanh nghiệp có thể:
  - Cập nhật thông tin công ty.
  - Thêm thông tin liên hệ (email HR, số điện thoại, LinkedIn,…).

#### 4.2 Tìm kiếm và lọc ứng viên

- Doanh nghiệp vào trang **Tìm kiếm ứng viên**, có thể:
  - Tìm theo từ khóa (tên kỹ năng, vị trí, công nghệ: “React”, “Node.js”, “Intern Frontend”,…).
  - Lọc theo:
    - Mức kinh nghiệm (Fresher/Junior/Mid).
    - Kỹ năng chính (frontend/backend/devops…).
    - Địa điểm (nếu có).
- Kết quả hiển thị dạng danh sách, mỗi ứng viên có card tóm tắt:
  - Tên, vị trí, kỹ năng nổi bật, link vào portfolio chi tiết.

#### 4.3 So sánh ứng viên (Profile Comparison)

- Doanh nghiệp có thể chọn **2–3 ứng viên** để so sánh:
  - Hệ thống hiển thị biểu đồ **Radar Chart** so sánh các nhóm kỹ năng (VD: Frontend, Backend, Database, DevOps, Soft skills…).
  - Hiển thị bảng so sánh:
    - Số năm kinh nghiệm.
    - Số lượng dự án liên quan.
    - Công nghệ trùng khớp với yêu cầu.
- Hệ thống tính điểm phù hợp tự động dựa trên mức độ khớp giữa yêu cầu tuyển dụng và kỹ năng/kinh nghiệm của từng ứng viên.
- Doanh nghiệp có thể **export kết quả so sánh** dạng PDF/Excel phục vụ báo cáo nội bộ.

#### 4.4 Liên hệ ứng viên

- Tại trang portfolio, doanh nghiệp có nút **“Liên hệ”**:
  - Gửi message trực tiếp qua form (nội dung, vị trí tuyển dụng, mức lương dự kiến…).
  - Hệ thống gửi email thông báo cho ứng viên và lưu lại lịch sử lời mời trong hệ thống.
- Ứng viên có thể xem danh sách **lời mời từ doanh nghiệp** trong dashboard cá nhân.

---

### 5. Nghiệp Vụ Admin

#### 5.1 Quản lý người dùng

- Xem danh sách tất cả tài khoản:
  - Ứng viên, doanh nghiệp, trạng thái (active/banned/pending).
- Thực hiện: Duyệt hoặc từ chối tài khoản doanh nghiệp.

#### 5.2 Quản lý nội dung và cấu hình hệ thống

- Quản lý các **template portfolio**:
  - Thêm/sửa/xóa template, thay đổi trạng thái (public/ẩn).
- Cấu hình các tham số chung:
  - Giới hạn số portfolio/ứng viên (nếu có).
  - Cấu hình email server, logo, tên hệ thống,…

#### 5.3 Thống kê hệ thống

- Admin có trang **System Analytics**:
  - Số lượng người dùng đăng ký theo thời gian.
  - Số lượng portfolio đang hoạt động.
  - Số lượt tìm kiếm/so sánh/ liên hệ từ doanh nghiệp.
- Hỗ trợ export dữ liệu phục vụ báo cáo.

---

## 6. Luồng Hoạt Động Chính

### 6.1 Ứng viên tạo Portfolio

```text
[Dang ky] --> [Dien profile] --> [Them skills] --> [Them projects] --> [Cong khai portfolio]
```

### 6.2 Doanh nghiệp tìm ứng viên

```text
[Dang ky] --> [Admin duyet] --> [Tim kiem] --> [So sanh] --> [Gui loi moi]
```

### 6.3 Kết nối tuyển dụng

```text
+----------------+      +----------------+      +----------------------+
| DOANH NGHIEP   |----->|    HE THONG    |----->|       UNG VIEN       |
| Gui loi moi    |      | Gui thong bao  |      | Xem va phan hoi      |
+----------------+      +----------------+      +----------------------+
  ^                         ^                         |
  |                         |                         |
  +------ Cap nhat ---------+------ Phan hoi --------+
```

---

## 7. Quy Tắc Hệ Thống

| Quy tắc                      | Mô tả                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| **Email unique**        | Mỗi email chỉ được đăng ký một tài khoản                                        |
| **DN cần duyệt**      | Doanh nghiệp phải được Admin phê duyệt trước khi sử dụng đầy đủ chức năng |
| **Ẩn/Hiện hồ sơ**   | Ứng viên có thể chủ động bật hoặc tắt trạng thái công khai của portfolio     |
| **So sánh ứng viên** | Mỗi lần so sánh chỉ được chọn tối đa 3 ứng viên                                |

---

## 8. Các Tính Năng Innovation

### Innovation 1: Portfolio Analytics

- Thống kê lượt xem
- Theo dõi lượt tải CV
- Xem doanh nghiệp đã xem hồ sơ

### Innovation 2: Candidate Comparison

- So sánh kỹ năng bằng Radar Chart
- Bảng so sánh chi tiết
- Export báo cáo PDF/Excel

---

## 9. Tổng Kết

Hệ thống giúp:

- Ứng viên xây dựng **portfolio chuyên nghiệp**
- Doanh nghiệp **tìm đúng ứng viên nhanh hơn**
- Admin **quản lý và kiểm soát hệ thống**

Hai tính năng nổi bật: - **Portfolio Analytics** - **Candidate Comparison**

## PHÂN TÍCH & THIẾT KẾ

### 1. Phạm vi và yêu cầu hệ thống

- **Mục tiêu**:
  - Cung cấp nền tảng để **Ứng viên** tạo & quản lý portfolio online.
  - Hỗ trợ **Doanh nghiệp** tìm kiếm, so sánh và liên hệ ứng viên phù hợp.
  - Cho phép **Admin** quản lý người dùng, nội dung và thống kê hệ thống.
- **Yêu cầu chức năng chính**:
  - Quản lý tài khoản người dùng (ứng viên, doanh nghiệp, admin).
  - Ứng viên tạo/cập nhật portfolio, kỹ năng, kinh nghiệm, dự án.
  - Ứng viên upload hoặc sinh CV tự động từ dữ liệu đã nhập.
  - Ứng viên theo dõi thống kê (lượt xem, lượt tải CV, doanh nghiệp đã xem hồ sơ, số lời mời).
  - Doanh nghiệp đăng ký, được admin duyệt, quản lý thông tin công ty.
  - Doanh nghiệp tìm kiếm, lọc ứng viên; xem chi tiết portfolio.
  - Doanh nghiệp so sánh 2–3 ứng viên (Radar Chart, điểm phù hợp, export PDF/Excel).
  - Doanh nghiệp gửi lời mời/liên hệ đến ứng viên qua hệ thống.
  - Admin duyệt tài khoản doanh nghiệp, khóa/mở tài khoản.
  - Admin quản lý template portfolio, cấu hình hệ thống, xem thống kê.
- **Yêu cầu phi chức năng**:
  - Giao diện thân thiện, dễ sử dụng, hỗ trợ nhiều kích thước màn hình.
  - Bảo mật: mật khẩu mã hóa, phân quyền rõ ràng, ẩn thông tin nhạy cảm khi cần.
  - Hiệu năng đủ tốt cho số lượng người dùng vừa phải, dễ mở rộng sau này.
  - Dễ bảo trì, tách bạch frontend–backend–database.

---

### 2. Các tác nhân (Actors)

- **Ứng viên (Candidate)**:
  - Đăng ký, đăng nhập, tạo & quản lý portfolio.
  - Quản lý CV, cấu hình ẩn/hiện thông tin.
  - Xem thống kê, xem và phản hồi lời mời từ doanh nghiệp.
- **Doanh nghiệp (Recruiter/Company)**:
  - Đăng ký, được admin duyệt tài khoản.
  - Tìm kiếm, xem portfolio ứng viên.
  - So sánh ứng viên, export báo cáo, gửi lời mời.
- **Admin**:
  - Đăng nhập vào trang quản trị.
  - Duyệt / từ chối tài khoản doanh nghiệp, khóa/mở tài khoản.
  - Quản lý template, cấu hình hệ thống, xem thống kê toàn hệ thống.

```text
                         +----------------------+
                         |        ADMIN         |
                         | - Duyet doanh nghiep |
                         | - Quan ly he thong   |
                         +----------+-----------+
                                    |
                                    v
+----------------------+    +----------------------+    +----------------------+
|      UNG VIEN        |--->|       HE THONG       |<---|   DOANH NGHIEP       |
| - Dang nhap          |    | Portfolio CV Platform|    | - Tim ung vien       |
| - Quan ly portfolio  |    |                      |    | - So sanh ung vien   |
| - Xem thong ke       |    |                      |    | - Gui loi moi        |
+----------------------+    +----------------------+    +----------------------+
```

---

### 3. Danh sách Use Case chính

#### 3.1 Ứng viên

- **UC1 – Quản lý tài khoản ứng viên**Đăng ký, đăng nhập/đăng xuất, cập nhật thông tin cá nhân.
- **UC2 – Quản lý Portfolio**Tạo / cập nhật nội dung portfolio (kỹ năng, kinh nghiệm, dự án, học vấn, chứng chỉ) và chọn template hiển thị.
- **UC3 – Quản lý CV & liên kết chia sẻ**Upload hoặc sinh CV tự động, bật/tắt chế độ public, cấu hình ẩn/hiện thông tin, lấy link portfolio.
- **UC4 – Xem thống kê cá nhân (Analytics)**Xem lượt xem portfolio, lượt tải CV, doanh nghiệp đã xem hồ sơ, số lời mời nhận được.
- **UC5 – Quản lý lời mời từ doanh nghiệp**
  Xem danh sách lời mời, xem chi tiết và phản hồi.

---

#### 3.2 Doanh nghiệp

- **UC6 – Quản lý tài khoản doanh nghiệp**Đăng ký tài khoản, đăng nhập, cập nhật thông tin công ty (sau khi được Admin duyệt).
- **UC7 – Tìm kiếm & lọc ứng viên**Tìm theo từ khóa, lọc theo kỹ năng, kinh nghiệm, vị trí,… và xem danh sách kết quả.
- **UC8 – Xem chi tiết hồ sơ ứng viên**Mở portfolio đầy đủ của ứng viên từ danh sách tìm kiếm.
- **UC9 – So sánh ứng viên & tính điểm phù hợp**Chọn 2–3 ứng viên, hệ thống hiển thị Radar Chart, bảng so sánh và điểm phù hợp tự động.
- **UC10 – Gửi lời mời / liên hệ tuyển dụng**
  Gửi lời mời làm việc hoặc trao đổi đến ứng viên qua hệ thống (form/contact).

---

#### 3.3 Admin

- **UC11 – Quản lý & duyệt tài khoản**Đăng nhập Admin, duyệt/từ chối tài khoản doanh nghiệp, khóa/mở tài khoản người dùng.
- **UC12 – Quản lý cấu hình & template**Quản lý template portfolio, cấu hình tham số hệ thống (trọng số điểm phù hợp, giới hạn so sánh,…).
- **UC13 – Xem thống kê hệ thống**
  Xem số lượng người dùng, số portfolio, lượt xem, lượt so sánh, số lời mời,… để theo dõi hoạt động toàn hệ thống.

### 4. Thiết kế cơ sở dữ liệu (Database Design)

#### 4.1 Các thực thể chính

Dựa trên các Use Case đã xác định, hệ thống cần các thực thể dữ liệu chính sau:

- **Users**: lưu thông tin tài khoản người dùng (ứng viên, doanh nghiệp, admin).
- **CandidateProfiles**: thông tin hồ sơ ứng viên (headline, bio, trạng thái public…).
- **Skills**: kỹ năng của ứng viên.
- **Experiences**: kinh nghiệm làm việc.
- **Projects**: các dự án đã thực hiện.
- **CVs**: file CV của ứng viên (link tới file lưu trên server/cloud).
- **Companies**: thông tin doanh nghiệp.
- **Invitations**: lời mời/lời đề nghị từ doanh nghiệp gửi tới ứng viên.
- **ProfileViews**: lịch sử lượt xem hồ sơ (phục vụ Analytics).
- **Comparisons**: dữ liệu các phiên so sánh ứng viên.
- **Templates**: template giao diện portfolio.
- **SystemSettings**: cấu hình hệ thống (trọng số, giới hạn so sánh,…).

---

#### 4.2 Thiết kế bảng dữ liệu

##### Bảng `USERS`

| Field         | Type     | Description                               |
| ------------- | -------- | ----------------------------------------- |
| id            | PK       | ID người dùng                          |
| email         | varchar  | Email đăng nhập (duy nhất)            |
| password_hash | varchar  | Mật khẩu đã mã hóa                  |
| full_name     | varchar  | Họ tên (dùng cho admin/doanh nghiệp)  |
| role          | enum     | `candidate` / `recruiter` / `admin` |
| status        | enum     | `active` / `locked` / `pending`     |
| created_at    | datetime | Ngày tạo tài khoản                    |
| updated_at    | datetime | Ngày cập nhật cuối                    |

---

##### Bảng `CANDIDATE_PROFILES`

| Field       | Type          | Description                                   |
| ----------- | ------------- | --------------------------------------------- |
| id          | PK            | ID hồ sơ ứng viên                         |
| user_id     | FK→Users     | Tham chiếu tới tài khoản ứng viên       |
| full_name   | varchar       | Tên hiển thị trên portfolio               |
| headline    | varchar       | Tiêu đề ngắn (vd: "Frontend Developer")   |
| bio         | text          | Giới thiệu bản thân                       |
| avatar_url  | varchar       | Link ảnh đại diện                         |
| is_public   | boolean       | Portfolio công khai hay không               |
| public_slug | varchar       | Đường dẫn public (vd:`/u/nguyen-van-a`) |
| template_id | FK→Templates | Template đang sử dụng cho portfolio        |
| created_at  | datetime      | Ngày tạo                                    |
| updated_at  | datetime      | Ngày cập nhật cuối                        |

---

##### Bảng `SKILLS`

| Field        | Type                  | Description                         |
| ------------ | --------------------- | ----------------------------------- |
| id           | PK                    | ID kỹ năng                        |
| candidate_id | FK→CandidateProfiles | Hồ sơ ứng viên                  |
| skill_name   | varchar               | Tên kỹ năng                      |
| level        | int                   | Mức độ (0–100 hoặc thang 1–5) |
| category     | varchar               | Nhóm (Frontend/Backend/Soft…)     |

---

##### Bảng `EXPERIENCES`

| Field        | Type                  | Description                 |
| ------------ | --------------------- | --------------------------- |
| id           | PK                    | ID kinh nghiệm             |
| candidate_id | FK→CandidateProfiles | Hồ sơ ứng viên          |
| company_name | varchar               | Tên công ty               |
| position     | varchar               | Vị trí                    |
| start_date   | date                  | Ngày bắt đầu            |
| end_date     | date                  | Ngày kết thúc (nullable) |
| description  | text                  | Mô tả công việc         |

---

##### Bảng `PROJECTS`

| Field        | Type                  | Description            |
| ------------ | --------------------- | ---------------------- |
| id           | PK                    | ID dự án             |
| candidate_id | FK→CandidateProfiles | Hồ sơ ứng viên     |
| project_name | varchar               | Tên dự án           |
| role         | varchar               | Vai trò trong dự án |
| technologies | text                  | Công nghệ sử dụng  |
| description  | text                  | Mô tả dự án        |
| project_url  | varchar               | Link demo (nếu có)   |
| github_url   | varchar               | Link GitHub (nếu có) |

---

##### Bảng `CVS`

| Field        | Type                  | Description           |
| ------------ | --------------------- | --------------------- |
| id           | PK                    | ID CV                 |
| candidate_id | FK→CandidateProfiles | Hồ sơ ứng viên    |
| cv_url       | varchar               | Đường dẫn file CV |
| created_at   | datetime              | Ngày upload/tạo     |

---

##### Bảng `COMPANIES`

| Field        | Type      | Description                         |
| ------------ | --------- | ----------------------------------- |
| id           | PK        | ID doanh nghiệp                    |
| user_id      | FK→Users | Tài khoản đăng nhập            |
| company_name | varchar   | Tên công ty                       |
| website      | varchar   | Website                             |
| logo_url     | varchar   | Logo (nếu có)                     |
| description  | text      | Mô tả ngắn về công ty          |
| is_approved  | boolean   | Đã được Admin duyệt hay chưa |
| created_at   | datetime  | Ngày tạo                          |

---

##### Bảng `INVITATIONS`

| Field        | Type                  | Description                                         |
| ------------ | --------------------- | --------------------------------------------------- |
| id           | PK                    | ID lời mời                                        |
| company_id   | FK→Companies         | Doanh nghiệp gửi lời mời                        |
| candidate_id | FK→CandidateProfiles | Ứng viên nhận lời mời                          |
| position     | varchar               | Vị trí tuyển dụng                               |
| message      | text                  | Nội dung lời mời                                 |
| status       | enum                  | `sent` / `viewed` / `accepted` / `rejected` |
| created_at   | datetime              | Thời điểm gửi                                   |

---

##### Bảng `PROFILE_VIEWS`

| Field        | Type                     | Description                 |
| ------------ | ------------------------ | --------------------------- |
| id           | PK                       | ID lượt xem               |
| candidate_id | FK→CandidateProfiles    | Hồ sơ được xem         |
| viewer_type  | enum                     | `anonymous` / `company` |
| company_id   | FK→Companies (nullable) | DN xem hồ sơ (nếu có)   |
| viewed_at    | datetime                 | Thời điểm xem            |

---

##### Bảng `COMPARISONS`

| Field         | Type          | Description                               |
| ------------- | ------------- | ----------------------------------------- |
| id            | PK            | ID phiên so sánh                        |
| company_id    | FK→Companies | DN thực hiện so sánh                   |
| criteria_json | text          | Lưu tiêu chí & điểm chi tiết (JSON) |
| created_at    | datetime      | Thời điểm so sánh                     |

---

##### Bảng `COMPARISON_CANDIDATES`

| Field         | Type                  | Description                               |
| ------------- | --------------------- | ----------------------------------------- |
| id            | PK                    | ID bản ghi                               |
| comparison_id | FK→COMPARISONS       | Phiên so sánh mà ứng viên thuộc về |
| candidate_id  | FK→CandidateProfiles | Ứng viên được so sánh               |

> Mỗi bản ghi trong `COMPARISON_CANDIDATES` tương ứng một ứng viên tham gia vào một phiên so sánh.

---

##### Bảng `TEMPLATES`

| Field       | Type     | Description                         |
| ----------- | -------- | ----------------------------------- |
| id          | PK       | ID template                         |
| name        | varchar  | Tên template                       |
| description | text     | Mô tả                             |
| config_json | text     | Cấu hình chi tiết (màu, layout) |
| status      | enum     | `active` / `inactive`           |
| created_at  | datetime | Ngày tạo                          |

---

##### Bảng `SYSTEM_SETTINGS`

| Field       | Type    | Description                  |
| ----------- | ------- | ---------------------------- |
| id          | PK      | ID cấu hình                |
| key         | varchar | Tên key cấu hình          |
| value       | text    | Giá trị                    |
| description | text    | Mô tả ý nghĩa cấu hình |

#### 4.3 Mô hình dữ liệu (ERD khái niệm)

```text
USERS
|-- CANDIDATE_PROFILES
|   |-- SKILLS
|   |-- EXPERIENCES
|   |-- PROJECTS
|   |-- CVS
|   |-- PROFILE_VIEWS
|   `-- INVITATIONS
|
|-- COMPANIES
|   |-- INVITATIONS
|   |-- PROFILE_VIEWS
|   `-- COMPARISONS
|       `-- COMPARISON_CANDIDATES
|           `-- CANDIDATE_PROFILES
|
|-- TEMPLATES
|   `-- CANDIDATE_PROFILES
|
`-- SYSTEM_SETTINGS
```

> `USERS` la thuc the goc. Tu day he thong tach ra nhanh **ung vien** va **doanh nghiep**, sau do mo rong sang ky nang, du an, loi moi, luot xem va so sanh.

### 5. Kiến trúc hệ thống (System Architecture)

#### 5.1 Mô hình tổng thể

Hệ thống được thiết kế theo kiến trúc 3 lớp; lớp Backend API được đóng gói bằng Docker để đảm bảo môi trường phát triển và triển khai nhất quán:

- **Frontend (Presentation Layer)**

  - Ứng dụng web dành cho **Ứng viên**, **Doanh nghiệp**, **Admin**.
  - Hiển thị: form đăng ký/đăng nhập, trang quản lý portfolio, trang tìm kiếm ứng viên, màn hình so sánh, dashboard thống kê, màn hình quản trị.
  - Giao tiếp với backend thông qua **REST API (JSON)**.
- **Backend API (Business Layer - FastAPI)**

  - Cung cấp các API cho toàn bộ chức năng nghiệp vụ:
    - Xác thực & phân quyền (Auth, Roles).
    - Quản lý portfolio (CandidateProfiles, Skills, Experiences, Projects, CVs).
    - Tìm kiếm & lọc ứng viên, so sánh ứng viên, tính điểm phù hợp.
    - Ghi nhận lượt xem, quản lý lời mời, thống kê.
    - Quản trị hệ thống: duyệt doanh nghiệp, template, cấu hình.
  - Backend được xây dựng bằng **FastAPI (Python)** và đóng gói dưới dạng Docker image.
  - Tổ chức theo mô hình **Router – Service – Repository** (hoặc tương đương).
- **Database (Data Layer)**

  - Lưu trữ dữ liệu theo thiết kế chi tiết ở mục 4:
    - `USERS`, `CANDIDATE_PROFILES`, `SKILLS`, `EXPERIENCES`, `PROJECTS`, `CVS`
    - `COMPANIES`, `INVITATIONS`, `PROFILE_VIEWS`
    - `COMPARISONS`, `COMPARISON_CANDIDATES`
    - `TEMPLATES`, `SYSTEM_SETTINGS`
  - Tối ưu index cho các truy vấn: email, role, kỹ năng, vị trí, công ty,…

Tóm tắt kiến trúc tổng quát:

```text
+------------------------------+
|         FRONTEND WEB         |
| Candidate / Recruiter / Admin|
+--------------+---------------+
               |
               | HTTP / REST API
               v
+------------------------------+
|      FASTAPI BACKEND API     |
| - Auth & User Management     |
| - Portfolio Management       |
| - Candidate Search           |
| - Candidate Comparison       |
| - Invitations & Analytics    |
| - Admin Management           |
+--------------+---------------+
               |
               | SQL Query
               v
+------------------------------+
|          DATABASE            |
| MySQL / PostgreSQL           |
| USERS, PROFILES, SKILLS, ... |
+------------------------------+
```

#### 5.2 Các module chính phía Backend

- **Auth & User Management Module**

  - Đăng ký, đăng nhập/đăng xuất người dùng.
  - Mã hóa mật khẩu, quản lý token/session.
  - Phân quyền theo `role` (`candidate`, `recruiter`, `admin`).
- **Candidate Portfolio Module**

  - Quản lý hồ sơ ứng viên: `CandidateProfiles`, `Skills`, `Experiences`, `Projects`, `CVs`.
  - Chọn template (`template_id`), bật/tắt chế độ public, sinh link portfolio.
  - Cung cấp dữ liệu để frontend render portfolio theo template.
- **Recruiter & Search Module**

  - Quản lý thông tin doanh nghiệp (`COMPANIES`, trạng thái duyệt).
  - Tìm kiếm & lọc ứng viên theo kỹ năng, kinh nghiệm, vị trí, từ khóa công nghệ, địa điểm (nếu có).
  - Trả về danh sách ứng viên tóm tắt và API xem chi tiết.
- **Comparison & Scoring Module**

  - Tạo và quản lý phiên so sánh (`COMPARISONS`, `COMPARISON_CANDIDATES`).
  - Tính điểm phù hợp cho từng ứng viên để phục vụ so sánh.

  ##### Thuật toán tính điểm phù hợp (phiên bản đơn giản)


  - **Mục tiêu**: Tính điểm tổng \(Score\) từ 0–100 cho mỗi ứng viên theo mức độ khớp với yêu cầu tuyển dụng.
  - **Các thành phần điểm** (dựa trên CSDL đã thiết kế):
    - \(S_k\): điểm kỹ năng (0–70), đọc từ bảng `SKILLS`.
    - \(S_e\): điểm kinh nghiệm (0–20), đọc từ bảng `EXPERIENCES`.
    - \(S_p\): điểm dự án liên quan (0–10), đọc từ bảng `PROJECTS`.
      \[
      Score = S_k + S_e + S_p \quad (0 \le Score \le 100)
      \]
  - **Điểm kỹ năng \(S_k\)** – dùng bảng `SKILLS` + yêu cầu trong `COMPARISONS.criteria_json`:
    - Mỗi kỹ năng yêu cầu có dạng `{ name_skill, min_level }`.
    - Với mỗi kỹ năng yêu cầu:
      - Nếu ứng viên có kỹ năng đó trong `SKILLS`:
        - Nếu `level >= min_level` → +10 điểm.
        - Nếu `level < min_level` → +5 điểm.
      - Nếu không có kỹ năng → +0 điểm.
    - Giới hạn: `S_k = min(tổng_điểm, 70)`.
  - **Điểm kinh nghiệm \(S_e\)** – dùng bảng `EXPERIENCES`:
    - Tính tổng số năm kinh nghiệm từ `start_date`, `end_date`.(end-start)
    - Quy đổi:
      - 0–1 năm → 5 điểm.
      - 1–3 năm → 10 điểm.
      - > 3 năm → 20 điểm.
        >
  - **Điểm dự án \(S_p\)** – dùng bảng `PROJECTS`:
    - Từ `criteria_json` lấy danh sách công nghệ yêu cầu (`required_techs`).
    - Mỗi dự án trong `PROJECTS` có `technologies` (danh sách tech).
    - Nếu một dự án có ít nhất 1 tech trùng `required_techs` → +3 điểm.
    - Giới hạn: `S_p = min(tổng_điểm, 10)`.
- **Analytics & Tracking Module**

  - Ghi nhận lượt xem hồ sơ (`PROFILE_VIEWS`), lượt tải CV, tương tác lời mời.
  - Tổng hợp số liệu cho dashboard ứng viên (Analytics cá nhân).
  - Cung cấp thống kê phục vụ báo cáo hệ thống.
- **Admin & Configuration Module**

  - Quản lý & duyệt tài khoản doanh nghiệp, khóa/mở tài khoản người dùng.
  - Quản lý template (`TEMPLATES`) và cấu hình chung (`SYSTEM_SETTINGS`).
  - Sinh số liệu thống kê tổng hợp cho trang quản trị Admin.

#### 5.3 Công nghệ dự kiến sử dụng

- **Frontend**: React (hoặc Next.js/Vue...) – xây dựng UI cho Ứng viên, Doanh nghiệp, Admin.
- **Backend**: **FastAPI (Python)** – hiện thực REST API, xử lý nghiệp vụ và xác thực/phân quyền.
- **Database**: MySQL hoặc PostgreSQL – lưu trữ dữ liệu người dùng, portfolio, analytics, v.v.
- **Containerization**: **Docker + Docker Compose** – đóng gói backend và môi trường database để chạy đồng nhất giữa các máy.
- **Triển khai**: backend deploy dạng container trên Render/Railway/Fly.io, frontend deploy trên Vercel/Netlify, database ưu tiên dịch vụ managed.

#### 5.4 Phạm vi & Ngoài phạm vi

- **Trong phạm vi đồ án**:
  - Xây dựng web platform cho Ứng viên, Doanh nghiệp và Admin.
  - Hỗ trợ tạo portfolio, tìm kiếm ứng viên, so sánh cơ bản, gửi lời mời, thống kê ở mức cần thiết cho demo.
  - Sử dụng Docker để đóng gói backend và dựng môi trường local/demo ổn định.
- **Ngoài phạm vi đồ án (không thực hiện)**:
  - Không xây **app mobile native** (Android/iOS riêng).
  - Không tích hợp **thanh toán online** (Stripe, MoMo, ZaloPay,…).
  - Không xây **hệ thống gợi ý AI** (recommendation engine tự động).
  - Không triển khai hạ tầng phức tạp (microservices, Kubernetes, v.v.).

#### 5.5 Rủi ro & Hướng xử lý

- **Thiếu dữ liệu thực tế**:
  - Rủi ro: Không có đủ CV/portfolio thật để demo tính năng tìm kiếm, so sánh, analytics.
  - Cách xử lý: Tạo **data giả lập** (dummy data) đủ đa dạng về kỹ năng, kinh nghiệm, công ty để minh họa các tính năng.
- **Khác biệt môi trường giữa các máy trong nhóm**:
  - Rủi ro: Lỗi chạy dự án do khác phiên bản Python/package hoặc cấu hình DB.
  - Cách xử lý: Chuẩn hóa bằng Docker Compose (backend + database), thống nhất file `.env.example`.
- **Thời gian triển khai hạn chế**:
  - Rủi ro: Không kịp hoàn thành toàn bộ chức năng nâng cao (Radar Chart, export, analytics chi tiết).
  - Cách xử lý: Ưu tiên hoàn thành **MVP** trước (đăng ký/đăng nhập, tạo portfolio, tìm kiếm, gửi lời mời), các tính năng nâng cao để phase sau.
- **Độ phức tạp kỹ thuật của một số tính năng** (so sánh, analytics):
  - Rủi ro: Đội còn ít kinh nghiệm với biểu đồ, tối ưu truy vấn.
  - Cách xử lý: Bắt đầu với **phiên bản đơn giản** (bảng số liệu, biểu đồ cơ bản), sau đó nâng cấp dần nếu còn thời gian.

## KẾ HOẠCH

### MVP

MVP tập trung vào việc hoàn thiện các luồng nghiệp vụ cốt lõi để hệ thống có thể demo được trọn vẹn từ đầu đến cuối, đồng thời vẫn phù hợp với thời gian triển khai của nhóm. Mốc hoàn thành dự kiến của phiên bản MVP là **12.04.2026**.

#### 1. Chức năng mà sản phẩm MVP sẽ thực hiện

**Đối với Ứng viên**

- Đăng ký, đăng nhập, đăng xuất tài khoản.
- Cập nhật thông tin cá nhân cơ bản.
- Tạo và chỉnh sửa portfolio với các mục chính: giới thiệu bản thân, kỹ năng, kinh nghiệm, dự án, học vấn.
- Upload CV dạng PDF.
- Bật/tắt trạng thái công khai của portfolio.
- Hệ thống tạo đường link public để chia sẻ portfolio.
- Xem thống kê cơ bản gồm: tổng lượt xem portfolio và số lời mời đã nhận.

**Đối với Doanh nghiệp**

- Đăng ký tài khoản doanh nghiệp và chờ Admin phê duyệt.
- Đăng nhập sau khi được phê duyệt.
- Cập nhật thông tin công ty cơ bản.
- Tìm kiếm ứng viên theo từ khóa và lọc theo một số tiêu chí chính như kỹ năng, vị trí, mức kinh nghiệm.
- Xem danh sách ứng viên và xem chi tiết portfolio công khai.
- So sánh cơ bản từ 2 đến 3 ứng viên dưới dạng bảng thông tin.
- Gửi lời mời/liên hệ đến ứng viên thông qua form trong hệ thống.

**Đối với Admin**

- Đăng nhập trang quản trị.
- Xem danh sách tài khoản người dùng.
- Duyệt hoặc từ chối tài khoản doanh nghiệp.
- Khóa/mở tài khoản khi cần.
- Xem thống kê tổng quan cơ bản: số lượng ứng viên, số lượng doanh nghiệp, số portfolio công khai.

**Giới hạn phạm vi của MVP**

- Chỉ sử dụng 1 template portfolio mặc định hoặc 1 số template đơn giản.
- Chỉ hỗ trợ upload CV, chưa triển khai chức năng tự sinh CV tự động.
- Chức năng so sánh ở mức cơ bản bằng bảng thông tin, chưa triển khai Radar Chart.
- Analytics chỉ dừng ở các chỉ số cơ bản, chưa có biểu đồ chi tiết theo thời gian.
- Chưa triển khai export PDF/Excel, email notification tự động và gợi ý ứng viên bằng AI.
- Docker ở mức cơ bản cho backend + database (Dockerfile, docker-compose), chưa tối ưu CI/CD production nâng cao.

#### 2. Kế hoạch kiểm thử

Mục tiêu kiểm thử của MVP là đảm bảo các luồng nghiệp vụ chính hoạt động đúng, dữ liệu lưu chính xác và phân quyền giữa 3 vai trò được xử lý đúng trước khi demo.

- **Phương pháp kiểm thử**: kết hợp kiểm thử thủ công giao diện, kiểm thử API và kiểm thử tích hợp theo từng luồng nghiệp vụ chính.
- **Dữ liệu kiểm thử**: chuẩn bị dữ liệu mẫu gồm nhiều tài khoản ứng viên, ít nhất 1 tài khoản Admin và 2 đến 3 tài khoản doanh nghiệp để mô phỏng nghiệp vụ thực tế.
- **Kiểm thử xác thực và phân quyền**: kiểm tra đăng ký, đăng nhập, trùng email, sai mật khẩu, tài khoản doanh nghiệp chưa được duyệt không thể sử dụng chức năng tuyển dụng, người dùng không được truy cập sai vai trò.
- **Kiểm thử chức năng ứng viên**: kiểm tra tạo/sửa portfolio, thêm kỹ năng, kinh nghiệm, dự án, upload CV PDF, bật/tắt công khai hồ sơ, truy cập link public.
- **Kiểm thử chức năng doanh nghiệp**: kiểm tra tìm kiếm ứng viên theo từ khóa và bộ lọc, xem portfolio công khai, so sánh 2 đến 3 ứng viên, gửi lời mời thành công và dữ liệu được lưu lại.
- **Kiểm thử chức năng Admin**: kiểm tra duyệt/từ chối doanh nghiệp, khóa/mở tài khoản, xem danh sách người dùng và số liệu tổng quan.
- **Kiểm thử thống kê cơ bản**: kiểm tra khi portfolio được xem thì lượt xem tăng đúng, khi doanh nghiệp gửi lời mời thì ứng viên nhìn thấy trong danh sách lời mời.
- **Kiểm thử giao diện**: kiểm tra hiển thị trên desktop và mobile, kiểm tra validate form và thông báo lỗi rõ ràng.
- **Kiểm thử môi trường Docker**: chạy mới hệ thống bằng Docker Compose trên máy sạch, kiểm tra backend kết nối DB và chạy migration thành công.
- **Tiêu chí hoàn thành MVP**: toàn bộ luồng chính phải chạy ổn định, không còn lỗi nghiêm trọng ở chức năng đăng nhập, tạo portfolio, tìm kiếm ứng viên, gửi lời mời và duyệt doanh nghiệp.

#### 3. Các chức năng dự trù thực hiện ở phase kế tiếp

- Bổ sung **Radar Chart** để trực quan hóa việc so sánh ứng viên.
- Tính **điểm phù hợp tự động** giữa yêu cầu tuyển dụng và hồ sơ ứng viên.
- Export kết quả so sánh sang **PDF/Excel**.
- Bổ sung **Analytics nâng cao**: biểu đồ theo thời gian, số lượt tải CV, danh sách doanh nghiệp đã xem hồ sơ.
- Cho phép **tự sinh CV** từ dữ liệu portfolio.
- Thêm nhiều **template portfolio** và màn hình quản lý template cho Admin.
- Tích hợp **gửi email thông báo** khi có lời mời hoặc khi doanh nghiệp được duyệt.
- Mở rộng bộ lọc tìm kiếm nâng cao như địa điểm, công nghệ, số năm kinh nghiệm chi tiết.
- Dự kiến có thể tích hợp AI hỗ trợ so sánh ứng viên (Gemini API): tạo phần giải thích điểm mạnh/điểm thiếu và mức độ phù hợp theo JD dựa trên dữ liệu đã có.

### Beta Version

- Kết quả kiểm thử
- Viết báo cáo
- Thời hạn hoàn thành dự kiến: ... (Chậm nhất 10.05.2026)

## CÂU HỎI

```
Liệt kê các câu hỏi của bạn cho thầy ở đây:
```

- ...
- ...

---
