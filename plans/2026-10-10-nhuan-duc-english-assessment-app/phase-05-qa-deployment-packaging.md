---
phase: 5
title: "Testing, Responsive Quality & Deployment"
status: pending
priority: P2
effort: 2.5h
tags: [testing, responsive, deployment, packaging, performance]
files:
  - index.html
  - css/style.css
  - js/app.js
---

# Phase 05: Testing, Responsive Quality & Deployment

## 1. Mục tiêu (Objective)
Đảm bảo toàn bộ ứng dụng hoạt động ổn định trên nhiều kích thước màn hình (điện thoại thông minh, máy tính bảng, máy tính để bàn), tối ưu hóa hiệu năng và cung cấp tài liệu hướng dẫn triển khai cho giáo viên.

## 2. Nhiệm vụ cụ thể (Actionable Tasks)
1. **Kiểm thử đa thiết bị (Responsive Testing):**
   - Tối ưu giao diện trên thiết bị di động (màn hình dọc của học sinh khi làm bài ở nhà).
   - Đảm bảo ma trận câu hỏi và bảng hội thoại không bị tràn viền hay vỡ bố cục trên màn hình nhỏ.
2. **Kiểm thử logic & độ bền dữ liệu:**
   - Kiểm tra trường hợp học sinh F5 hoặc tắt tab khi đang làm dở bài thi.
   - Kiểm tra việc tính điểm với nhiều tổ hợp đáp án khác nhau (đúng hết 40/40, đúng 0/40, nộp bài sớm).
3. **Đóng gói & Hướng dẫn triển khai:**
   - Ứng dụng hoạt động độc lập (Zero-dependency), chỉ gồm HTML/CSS/JS thuần, không cần cài đặt Node.js hay cơ sở dữ liệu phức tạp.
   - Có thể chạy cục bộ trên máy tính phòng máy của trường hoặc đưa lên các nền tảng miễn phí (GitHub Pages, Vercel, Netlify, Cloudflare Pages) để gửi link cho học sinh toàn trường làm bài qua Zalo.

## 3. Tiêu chí kiểm chứng (Verification Criteria)
- [ ] Giao diện co giãn hoàn hảo trên màn hình điện thoại (375px - 414px) và màn hình máy tính (1366px - 1920px).
- [ ] Tốc độ tải trang dưới 1 giây, phản hồi thao tác tức thì.
- [ ] Có tài liệu hướng dẫn giáo viên cách sử dụng và chia sẻ link bài thi cho học sinh.
