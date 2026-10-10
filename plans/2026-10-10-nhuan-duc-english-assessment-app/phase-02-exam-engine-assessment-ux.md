---
phase: 2
title: "Exam Engine & Assessment UX (Azota Core)"
status: in-progress
priority: P1
effort: 4h
tags: [exam-engine, timer, ui-ux, quiz, keyboard-shortcuts]
files:
  - index.html
  - css/style.css
  - js/app.js
---

# Phase 02: Exam Engine & Assessment UX (Azota Core)

## 1. Mục tiêu (Objective)
Xây dựng trải nghiệm phòng thi trực tuyến tương tự Azota nhưng mượt mà, trực quan và tối ưu cho bài thi trắc nghiệm hội thoại Tiếng Anh, đảm bảo tính công bằng và dễ sử dụng cho học sinh cấp 2.

## 2. Nhiệm vụ cụ thể (Actionable Tasks)
1. **Giao diện xác thực thí sinh:**
   - Dropdown chọn lớp `9.2C` hoặc `9.5C`.
   - Dropdown tìm kiếm học sinh kèm STT, ngày sinh.
   - Thẻ định danh thí sinh (Avatar, họ tên, phái, thông báo nếu đã từng làm bài trước đó).
   - Tùy chọn chế độ làm bài: Đề đầy đủ (40 câu - 45 phút), Set 1 (20 câu - 20 phút), Set 2 (20 câu - 20 phút).
2. **Bộ máy phòng thi (Exam Runner):**
   - Đồng hồ đếm ngược với trạng thái cảnh báo khẩn cấp khi còn dưới 5 phút.
   - Trình bày câu hỏi hội thoại bằng bong bóng thoại (Speech bubble) định dạng rõ người nói và chỗ trống điền từ `_____`.
   - Thẻ đáp án A, B, C, D to, rõ, có hiệu ứng chọn mượt mà.
   - Hỗ trợ phím tắt bàn phím: bấm phím `1, 2, 3, 4` hoặc `A, B, C, D` để chọn đáp án; phím `ArrowLeft` / `ArrowRight` để chuyển câu.
   - Chức năng gắn cờ câu hỏi phân vân (🚩 Flag for review).
3. **Bảng ma trận câu hỏi (Question Palette):**
   - Grid 40 ô số hiển thị trực quan trạng thái: Đã làm (xanh), Đang xem (viền sáng), Chưa làm (xám), Có cờ (vàng).
   - Bấm vào bất kỳ ô số nào để nhảy ngay đến câu hỏi đó.
4. **Nộp bài & Chống rớt mạng:**
   - Hộp thoại cảnh báo số câu chưa hoàn thành trước khi xác nhận nộp.
   - Tự động nộp bài khi đồng hồ đếm ngược về `00:00`.
   - Tính điểm chuẩn xác trên thang điểm 10.0 của Bộ GD&ĐT: `(số câu đúng / tổng số câu) * 10`.
   - Màn hình kết quả rực rỡ kèm xếp loại học lực và bảng xem lại từng câu có lời giải chi tiết.
5. **Nâng cao: Phát hiện chuyển tab (Anti-Cheat / Focus Detection):**
   - Lắng nghe sự kiện `visibilitychange` hoặc `window.blur` để cảnh báo học sinh khi rời khỏi màn hình làm bài thi (tương tự Azota).

## 3. Tiêu chí kiểm chứng (Verification Criteria)
- [x] Đồng hồ đếm ngược chạy chính xác từng giây.
- [x] Bảng ma trận câu hỏi cập nhật trạng thái ngay lập tức khi học sinh chọn đáp án.
- [x] Điểm số tính toán chính xác và hiển thị đầy đủ đáp án đúng/sai.
- [x] Tính năng chống gian lận (Anti-Cheat): Tự động bắt sự kiện chuyển tab/rời cửa sổ, hiện modal cảnh báo rung và gửi số lần vi phạm vào sổ điểm giáo viên.
- [x] Bảng câu hỏi dạng Bottom Sheet Drawer trên điện thoại mở mượt mà và nhảy câu tức thì.
