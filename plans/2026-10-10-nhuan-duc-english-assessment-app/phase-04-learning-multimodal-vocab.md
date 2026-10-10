---
phase: 4
title: "Learning Support & Multimodal Vocabulary Module"
status: in-progress
priority: P2
effort: 2.5h
tags: [vocab, flashcards, speech-synthesis, audio, pronunciation]
files:
  - index.html
  - js/app.js
  - css/style.css
---

# Phase 04: Learning Support & Multimodal Vocabulary Module

## 1. Mục tiêu (Objective)
Bổ sung không gian ôn tập từ vựng đa phương tiện trước khi vào làm bài thi, giúp học sinh nắm vững 16 từ vựng trọng tâm của Unit 3 (Healthy Living for Teens) cả về ngữ nghĩa, cách dùng và phát âm chuẩn bản ngữ.

## 2. Nhiệm vụ cụ thể (Actionable Tasks)
1. **Thẻ từ vựng thông minh (Interactive Flashcards):**
   - Trưng bày 16 từ/cụm từ cốt lõi dưới dạng thẻ bài học hiện đại.
   - Thể hiện rõ: Từ vựng, từ loại (`n.phr`, `v.phr`, `phr.v`, `adj`), phiên âm quốc tế IPA, giải nghĩa tiếng Việt và câu ví dụ hoàn chỉnh.
2. **Tích hợp phát âm Audio giọng bản ngữ (Web Speech API):**
   - Nút phát âm 🔊 cho từng từ vựng.
   - Sử dụng giọng đọc tiếng Anh chuẩn Mỹ (`en-US`) với tốc độ phát âm chuẩn hóa (`rate: 0.88`) để học sinh dễ nghe và bắt chước.
3. **Mở rộng (Future enhancement):**
   - Mini-game nối từ vựng với định nghĩa tiếng Việt để khởi động trước khi vào bài thi chính thức.

## 3. Tiêu chí kiểm chứng (Verification Criteria)
- [x] Đủ 16 thẻ từ vựng hiển thị đẹp mắt, tự động co giãn theo kích thước màn hình.
- [x] Bấm nút loa phát ra âm thanh phát âm từ vựng rõ ràng trên trình duyệt hỗ trợ.
