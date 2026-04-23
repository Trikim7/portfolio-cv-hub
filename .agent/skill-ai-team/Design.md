# Hướng dẫn giao diện — Portfolio CV Hub

*(Nằm trong skill `skill-ai-team`; mọi đường dẫn file là từ **thư mục gốc repo**.)*

Tài liệu này giúp đồng bộ UI giữa dashboard, mục **Kỹ năng** và các section quản lý khác. Khi thêm màn hình mới, bám các token và pattern dưới đây; implementation tham chiếu `frontend/src/components/layout/DashboardShell.tsx` và các manager trong `frontend/src/components/dashboard/`.

---

## 1. Thanh hero (header dashboard)

- **Nền:** gradient ngang `bg-gradient-to-r` theo accent (mặc định candidate: `from-blue-600 via-indigo-600 to-violet-600`).
- **Chữ trên nền gradient:** chủ yếu `text-white`, phụ `text-white/80`, brand link `text-white/90` + `hover:text-white`.
- **Khoảng đệm (compact):** container `pt-3 pb-4 sm:pb-5`, khoảng cách giữa hàng brand/logout và hàng nội dung chính `mb-3 sm:mb-3.5` (tránh `pb-10` + `mb-8` — quá cao).
- **Hàng trên:** logo chữ `text-base sm:text-lg font-bold`; nút phụ (Đăng xuất / Quay lại) `bg-white/10`, `backdrop-blur`, `ring-1 ring-white/20`, `rounded-lg`, `px-2.5 py-1`, `text-xs sm:text-sm`.
- **Hàng user:** layout `flex` + trên `sm` căn `sm:items-center sm:justify-between`, `gap-3 sm:gap-4`.
- **Avatar:** `w-11 h-11 sm:w-12 sm:h-12`, `rounded-xl`, viền `ring-2 ring-white/30`–`white/40`, `shadow-md`.
- **Phân cấp chữ:**
  - Nhãn phụ (ví dụ “Xin chào”): `text-[11px] sm:text-xs font-medium uppercase tracking-wider text-white/80`.
  - Tên: `text-xl sm:text-2xl font-extrabold leading-snug truncate` (không dùng `text-3xl` trên header dashboard).
- **Badge trạng thái (Công khai / …):** pill `rounded-full`, nền `bg-white`, chữ `text-gray-800 text-xs font-semibold`, chấm màu theo accent (`ACCENT_STYLES` → `dot`).
- **CTA chính trên hero (ví dụ “Xem portfolio công khai”):** nền trắng, chữ `text-blue-700`, `rounded-lg`, `px-3 py-1.5`, `text-xs sm:text-sm`, `shadow-sm`; mobile có thể `w-full sm:w-auto`.

**Accent thay thế** (recruiter / admin nếu dùng): `purple` và `emerald` — cùng cấu trúc class, đổi gradient + màu chip trong `ACCENT_STYLES`.

---

## 2. Nền trang và layout

- **Nền body dashboard:** `bg-slate-50` (`min-h-screen` trên shell).
- **Khung nội dung:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8`.
- **Sidebar (desktop):** cột `lg:grid-cols-[260px_1fr]`, nav `rounded-2xl`, `border border-gray-200`, item active dùng `activeNav` từ accent (nền pastel + viền).

---

## 3. Thẻ section (`SectionCard`)

- Thẻ: `bg-white rounded-2xl shadow-sm border border-gray-200`.
- Header thẻ: `px-6 py-4 border-b border-gray-100`; tiêu đề `text-lg font-bold text-gray-900`; mô tả `text-sm text-gray-500`.
- Vùng body: `p-6`.

Khi một section không cần header/description có thể dùng pattern tương đương như `SkillsManager`: một khối `bg-white p-6 rounded-2xl shadow-sm border` nhưng **ưu tiên** `SectionCard` nếu có tiêu đề + mô tả chuẩn để đồng nhất.

---

## 4. Mục Kỹ năng (`SkillsManager`) và form trong dashboard

- **Khối bọc section:** đồng bộ với thẻ trắng: `rounded-2xl`, `shadow-sm`, `border border-gray-200`.
- **Tiêu đề block:** `text-lg font-bold text-gray-900`, margin dưới ~`mb-6`.
- **Form thêm (vùng nổi nhẹ):** `bg-gray-50 rounded-xl border border-gray-100 p-4`.
- **Label:** `text-sm font-medium text-gray-700`, `mb-1`.
- **Input / select:** `w-full px-4 py-2 border border-gray-300 rounded-lg`, focus `focus:outline-none focus:ring-2 focus:ring-blue-500` (hoặc `focus:ring-*` trùng accent nếu section dùng màu khác).
- **Lưới field:** `grid grid-cols-1 md:grid-cols-3 gap-4` (hoặc 2 cột tùy mật độ).
- **Nút hành động chính:** `bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700` (hoặc `disabled:opacity-50` khi cần).
- **Toast:** dùng `Toast` / `useToast` từ `@/components/Toast` cho phản hồi thao tác.

Người làm UI mới: khi thêm field hoặc bảng trong dashboard, **copy spacing và class focus ring** từ `SkillsManager` hoặc `ExperiencesManager` / `ProjectsManager` để tránh lệch “một kiểu input một kiểu”.

---

## 5. Màu và trạng thái

| Vai trò | Gợi ý Tailwind |
|--------|-----------------|
| Chữ body | `text-gray-900` / `text-gray-700` / `text-gray-500` |
| Viền nhẹ | `border-gray-100`–`200` |
| Cảnh báo / lỗi toast | theo component Toast (giữ một mapping duy nhất) |
| Gradient hero | chỉ dùng trong shell, không lặp gradient ngẫu nhiên trong thẻ nội dung |

---

## 6. Checklist trước khi merge UI

- [ ] Header dashboard không phình chiều cao (padding dọc và `mb` giữa các hàng trong giới hạn mục 1).
- [ ] Thẻ trắng dùng cùng bán kính `rounded-2xl` + `shadow-sm` + `border`.
- [ ] Input có cùng pattern focus ring.
- [ ] CTA trên hero đọc được trên nền gradient (tương phản đủ, không chồng chữ).

---

## 7. File tham chiếu nhanh

| Thành phần | File |
|-------------|------|
| Shell + hero + sidebar + `SectionCard` | `frontend/src/components/layout/DashboardShell.tsx` |
| Trang dashboard + CTA portfolio | `frontend/src/app/(dashboard)/dashboard/page.tsx` |
| Kỹ năng | `frontend/src/components/dashboard/SkillsManager.tsx` |

Cập nhật tài liệu này khi thay đổi có chủ đích các token ở trên (ví dụ đổi scale typography toàn app).
