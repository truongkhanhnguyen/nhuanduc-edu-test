---
phase: 1
title: "Core Data Architecture & Student Model"
status: completed
priority: P1
effort: 3h
tags: [data, schema, student, xlsx, docx]
files:
  - js/data.js
  - student/9.2C.xlsx
  - student/9.5C.xlsx
  - test/class9.docx
---

# Phase 01: Core Data Architecture & Student Model

## 1. Mục tiêu (Objective)
Xây dựng mô hình dữ liệu lõi kết nối giữa các tệp quản lý học sinh Excel ([9.2C.xlsx](file:///c:/Users/X13/Desktop/mtdp/student/9.2C.xlsx), [9.5C.xlsx](file:///c:/Users/X13/Desktop/mtdp/student/9.5C.xlsx)) và tệp đề thi Word ([class9.docx](file:///c:/Users/X13/Desktop/mtdp/test/class9.docx)) thành cấu trúc đối tượng JSON chuẩn hóa phục vụ ứng dụng.

## 2. Nhiệm vụ cụ thể (Actionable Tasks)
1. **Trích xuất danh sách học sinh:**
   - Đọc danh tính học sinh từ sheet `9 2C Ngoai ngu 1` và `9 5C Ngoai ngu 1`.
   - Thu thập đầy đủ các trường: `stt`, `code` (mã định danh 10 số), `name`, `dob`, `gender`.
   - Kết quả: 43 học sinh lớp 9.2C, 29 học sinh lớp 9.5C (tổng cộng 72 học sinh).
2. **Cấu trúc hóa đề thi Tiếng Anh 9 (Unit 3):**
   - Trích xuất 16 từ vựng chủ đề *Healthy Living for Teens* kèm phiên âm IPA, từ loại, nghĩa tiếng Việt và câu ví dụ.
   - Trích xuất 40 câu hỏi trắc nghiệm dạng hội thoại 2 nhân vật kèm 4 lựa chọn (A, B, C, D).
   - Thiết lập bảng đáp án đúng 100% chuẩn xác và câu giải thích chi tiết ngữ cảnh.
3. **Mô hình hóa dữ liệu phiên làm bài & kết quả:**
   - Định dạng kết quả lưu trữ: `{ classId, studentCode, studentName, score, correctCount, totalQuestions, answers, submittedAt }`.
   - Cơ chế lưu trữ dự phòng: LocalStorage với khóa định danh duy nhất theo từng học sinh.

## 3. Tiêu chí kiểm chứng (Verification Criteria)
- [x] Tệp [`js/data.js`](file:///c:/Users/X13/Desktop/mtdp/js/data.js) hợp lệ cú pháp JavaScript (không có lỗi cú pháp khi kiểm tra với Node.js).
- [x] Toàn bộ 72 học sinh được ánh xạ chính xác họ tên và mã số.
- [x] Đủ 40 câu hỏi trắc nghiệm với đáp án được kiểm định.
