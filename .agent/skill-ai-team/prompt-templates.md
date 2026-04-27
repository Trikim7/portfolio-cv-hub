---
context: Portfolio CV Hub Phase 2
---

# Mẫu prompt theo tác vụ

## 1) Tạo tính năng mới

```text
Context:
- Project: Portfolio CV Hub
- Module: <backend/frontend>
- Rule: tuân theo skill-team-workflow

Task:
- Hãy tạo <tính năng cụ thể> với phạm vi nhỏ, có thể review nhanh.
- Không đổi kiến trúc tổng thể.

Output yêu cầu:
1. Danh sách file cần sửa
2. Code đề xuất
3. Rủi ro có thể phát sinh
4. Test cases tối thiểu
```

## 2) Sửa bug

```text
Bug:
- Hiện tượng:
- Cách tái hiện:
- Kết quả mong muốn:

Yêu cầu:
- Tìm nguyên nhân gốc.
- Đề xuất fix tối thiểu, không ảnh hưởng module khác.
- Kèm test/steps verify.
```

## 3) Review PR

```text
Bạn là reviewer kỹ thuật cho team 4 người.
Hãy review theo thứ tự:
1. Bug logic
2. Security risk
3. Khả năng gây regression
4. Thiếu test

Trả kết quả theo mức độ: Critical / Major / Minor.
```

## 4) Viết test

```text
Viết test cho <module/hàm>:
- Bao gồm happy path, edge cases, error cases.
- Không mock quá mức nếu có thể test integration nhỏ.
- Ưu tiên test bảo vệ bug vừa fix.
```
