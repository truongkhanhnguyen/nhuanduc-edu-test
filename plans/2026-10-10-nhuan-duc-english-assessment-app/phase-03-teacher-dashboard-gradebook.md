---
phase: 3
title: "Teacher Dashboard & Gradebook Integration"
status: in-progress
priority: P1
effort: 4h
tags: [teacher, dashboard, gradebook, analytics, excel-export]
files:
  - index.html
  - js/app.js
  - css/style.css
---

# Phase 03: Teacher Dashboard & Gradebook Integration

## 1. Mục tiêu (Objective)
Cung cấp công cụ quản trị giảng dạy toàn diện cho giáo viên Mai Trần Diễm Phúc: theo dõi tiến độ nộp bài của học sinh cả 2 lớp, phân tích phổ điểm, xem bài làm chi tiết và xuất điểm trực tiếp vào mẫu bảng điểm Excel của trường THCS Nhuận Đức.

## 2. Nhiệm vụ cụ thể (Actionable Tasks)
1. **Thống kê thời gian thực (KPI Overview):**
   - Tổng sĩ số 2 lớp (72 học sinh).
   - Số lượng học sinh đã hoàn thành / chưa hoàn thành.
   - Điểm trung bình toàn khối, tỷ lệ đạt yêu cầu (>= 5.0).
2. **Sổ điểm điện tử tương tác (Interactive Gradebook):**
   - Tab phân lớp: Tất cả (72), Lớp 9.2C (43), Lớp 9.5C (29).
   - Thanh tìm kiếm học sinh theo họ tên hoặc mã định danh 10 số.
   - Bộ lọc trạng thái: Tất cả / Đã nộp bài / Chưa làm bài.
   - Xem chi tiết từng câu làm bài của học sinh qua Modal tương tác.
   - Nút Reset: Cho phép xóa bài làm để học sinh làm lại khi cần kiểm tra lại.
3. **Phân tích câu hỏi khó (Item & Mistake Analysis):**
   - Tính toán tỷ lệ % trả lời sai cho từng câu hỏi dựa trên toàn bộ bài nộp của học sinh.
   - Tự động hiển thị **Top 5 câu hỏi học sinh sai nhiều nhất** kèm ngữ cảnh từ vựng để cô giáo Phúc kịp thời ôn tập củng cố lại trên lớp.
4. **Xuất bảng điểm Excel chuẩn mẫu trường THCS Nhuận Đức:**
   - Tạo file bảng điểm CSV/Excel UTF-8 có BOM tương thích 100% với Microsoft Excel.
   - Điền sẵn điểm số vào cột **`ĐĐGtx`** (Điểm Đánh Giá Thường Xuyên) khớp đúng với tệp [9.2C.xlsx](file:///c:/Users/X13/Desktop/mtdp/student/9.2C.xlsx) và [9.5C.xlsx](file:///c:/Users/X13/Desktop/mtdp/student/9.5C.xlsx).
   - Tự động phân loại xếp loại học lực: Xuất sắc (>= 9.0), Giỏi (>= 8.0), Khá (>= 6.5), Đạt (>= 5.0), Chưa đạt (< 5.0).

## 3. Tiêu chí kiểm chứng (Verification Criteria)
- [x] Lọc danh sách học sinh theo lớp và trạng thái hiển thị tức thì không bị giật lag.
- [x] Xuất file bảng điểm mở được trực tiếp bằng Microsoft Excel mà không bị lỗi font tiếng Việt.
- [x] Modal xem bài làm chi tiết hiển thị đúng từng đáp án học sinh đã chọn.
