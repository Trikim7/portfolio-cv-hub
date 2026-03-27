# Phạm vi MVP — Portfolio CV Hub

## Mốc hoàn thành

**12.04.2026**

---

## Chức năng MVP theo vai trò

### Ứng viên (Candidate)

| Chức năng | Use Case | Ghi chú |
|---|---|---|
| Đăng ký / đăng nhập / đăng xuất | UC1 | Email + password, email phải unique |
| Cập nhật thông tin cá nhân cơ bản | UC1 | Tên, vị trí, mô tả ngắn |
| Tạo & chỉnh sửa portfolio | UC2 | Giới thiệu, kỹ năng, kinh nghiệm, dự án, học vấn |
| Upload CV dạng PDF | UC3 | Chỉ upload, **chưa** tự sinh CV |
| Bật/tắt public portfolio | UC3 | Hệ thống tạo link `/u/<slug>` |
| Xem thống kê cơ bản | UC4 | Chỉ tổng lượt xem + số lời mời đã nhận |
| Xem danh sách lời mời từ doanh nghiệp | UC5 | Xem chi tiết, phản hồi |

### Doanh nghiệp (Recruiter)

| Chức năng | Use Case | Ghi chú |
|---|---|---|
| Đăng ký tài khoản + chờ Admin duyệt | UC6 | Không dùng được chức năng tuyển dụng khi chưa duyệt |
| Đăng nhập sau khi được duyệt | UC6 | |
| Cập nhật thông tin công ty cơ bản | UC6 | Tên, website, mô tả |
| Tìm kiếm ứng viên | UC7 | Từ khóa + lọc theo kỹ năng, vị trí, mức kinh nghiệm |
| Xem chi tiết portfolio công khai | UC8 | |
| So sánh 2–3 ứng viên (bảng thông tin) | UC9 | **Chưa** có Radar Chart, **chưa** tính điểm phù hợp |
| Gửi lời mời / liên hệ ứng viên | UC10 | Form trong hệ thống |

### Admin

| Chức năng | Use Case | Ghi chú |
|---|---|---|
| Đăng nhập trang quản trị | UC11 | Tài khoản tạo sẵn |
| Xem danh sách người dùng | UC11 | Ứng viên + doanh nghiệp, trạng thái |
| Duyệt / từ chối tài khoản doanh nghiệp | UC11 | |
| Khóa / mở tài khoản | UC11 | |
| Xem thống kê tổng quan cơ bản | UC13 | Số ứng viên, số DN, số portfolio công khai |

---

## Giới hạn MVP — KHÔNG làm trong phase này

| Tính năng | Lý do trì hoãn |
|---|---|
| Radar Chart so sánh ứng viên | Đội còn ít kinh nghiệm biểu đồ, để phase sau |
| Tính điểm phù hợp tự động (Score = S_k + S_e + S_p) | Phụ thuộc Radar Chart, để phase sau |
| Export PDF/Excel kết quả so sánh | Chưa ưu tiên |
| Analytics nâng cao (biểu đồ theo thời gian, lượt tải CV, DN đã xem) | MVP chỉ cần chỉ số cơ bản |
| Tự sinh CV từ dữ liệu portfolio | Phức tạp, chỉ hỗ trợ upload PDF |
| Nhiều template portfolio | MVP dùng 1 template mặc định hoặc vài template đơn giản |
| Quản lý template cho Admin | Gắn với multi-template |
| Email notification tự động | Chưa ưu tiên |
| Gợi ý ứng viên bằng AI (Gemini API) | Ngoài phạm vi MVP |
| CI/CD production nâng cao | Docker ở mức cơ bản (Dockerfile + docker-compose) |

---

## Quy tắc cho AI khi code MVP

1. **Không sinh code cho tính năng ngoài bảng "Giới hạn MVP"** trừ khi được chỉ định rõ.
2. **Template portfolio**: chỉ cần 1 template mặc định, không cần hệ thống chọn template phức tạp.
3. **So sánh ứng viên**: chỉ hiển thị bảng thông tin side-by-side, không cần biểu đồ.
4. **Analytics**: chỉ trả về 2 con số: tổng lượt xem + tổng lời mời. Không cần biểu đồ.
5. **CV**: chỉ upload PDF, lưu link file. Không sinh CV tự động.
6. Nếu task yêu cầu tính năng ở phase sau, **hỏi lại** trước khi làm.

---

## Phase kế tiếp (sau MVP, trước Beta 10.05.2026)

- Radar Chart cho so sánh ứng viên
- Thuật toán tính điểm phù hợp (S_k + S_e + S_p)
- Export PDF/Excel
- Analytics nâng cao: biểu đồ, lượt tải CV, danh sách DN đã xem
- Tự sinh CV từ portfolio data
- Thêm nhiều template + quản lý template cho Admin
- Email notification
- Bộ lọc tìm kiếm nâng cao (địa điểm, công nghệ chi tiết, số năm kinh nghiệm)
- Tích hợp Gemini API hỗ trợ so sánh (nếu còn thời gian)
