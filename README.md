# 🇬🇧 NHUẬN ĐỨC EDU TEST - HỆ THỐNG KHẢO SÁT & KIỂM TRA TIẾNG ANH 9 TRỰC TUYẾN
> **Trường THCS Nhuận Đức • Giáo viên bộ môn: Mai Trần Diễm Phúc**  
> Môn: Ngoại ngữ 1 (Tiếng Anh 9 - Global Success) • Năm học 2026 - 2027

---

## 🌟 TỔNG QUAN TÍNH NĂNG ĐÃ HOÀN THIỆN

### 1. 🔑 Hệ thống Mã dự thi (Mã đăng nhập 4 số)
- Tích hợp toàn bộ **72 học sinh** thuộc 2 lớp 9:
  - **Lớp 9.2C** (43 học sinh): Mã dự thi từ `9201` đến `9243` (tương ứng STT 1 đến 43).
  - **Lớp 9.5C** (29 học sinh): Mã dự thi từ `9501` đến `9529` (tương ứng STT 1 đến 29).
  - Hỗ trợ cả mã 10 số của Bộ GD&ĐT (VD: `7924845293`).
- Học sinh truy cập web, chỉ cần nhập đúng mã 4 số là hệ thống tự động nhận diện danh tính và lớp.

### 2. 📸 Chụp mặt Pop-up tức thì (Không quay liên tục, bảo mật & tiết kiệm pin)
- **Xác thực đầu giờ**: Khi học sinh bấm *"🚀 Bắt đầu làm bài thi ngay"*, pop-up camera bật lên ➔ Học sinh căn mặt và bấm *"Chụp ảnh khuôn mặt"* ➔ Camera ngắt ngay lập tức sau khi chụp và bắt đầu vào thi.
- **Quét ngẫu nhiên 1 - 3 lần**: Trong suốt thời gian thi, hệ thống tự động chọn ngẫu nhiên từ 1 đến 3 thời điểm đột xuất ➔ Đồng hồ tạm dừng ➔ Hiện pop-up yêu cầu học sinh chụp mặt đối chiếu ➔ Chụp xong camera tắt ngay và tiếp tục tính giờ làm bài.
- **Hồ sơ đối chiếu gửi Giáo viên**: Ảnh đầu giờ và toàn bộ ảnh chụp ngẫu nhiên được lưu trữ kèm mốc giờ phút giây chính xác vào bài nộp để giáo viên rà soát.

### 3. 🛡️ Chống gian lận đa nền tảng (Azota Style)
- Bắt sự kiện rời tab, ẩn trình duyệt, chuyển ứng dụng trên điện thoại (`visibilitychange`, `window.blur`, `pagehide`).
- Rung cảnh báo haptics và ghi nhật ký thời gian vi phạm.
- Khóa chuột phải, cấm bôi đen sao chép (copy/cut/paste), cấm phím tắt kiểm tra F12 / DevTools.
- **Tự động thu bài**: Nếu học sinh vi phạm quá 3 lần, hệ thống tự động khóa đề và nộp bài ngay.

### 4. 🔒 Phân quyền Giáo viên & Công cụ giao mã
- **Mật khẩu quản trị**: `phuc2026` (có thể tùy chỉnh bảo mật cao hơn qua biến môi trường `TEACHER_PASSWORD` trên Railway). Mật khẩu được xác thực hoàn toàn trên Server, không lộ trong mã nguồn HTML/JS phía học sinh.
- **Bảng điểm trực tuyến**: Cập nhật thời gian thực, xếp loại học lực, phân tích 5 câu hỏi học sinh hay làm sai nhất.
- **Nút "🗑️ Reset trắng bảng điểm"**: Giáo viên có thể xóa toàn bộ dữ liệu làm thử bất kỳ lúc nào để bắt đầu kỳ thi chính thức với 100% học sinh ở trạng thái "Chưa làm bài".
- **Công cụ trích xuất mã dự thi**:
  - `📋 Sao chép danh sách để gửi Zalo`: Định dạng sẵn văn bản, cô chỉ cần 1 click là gửi ngay vào nhóm Zalo lớp.
  - `📥 Xuất file Excel mã dự thi (.csv)`: Xuất bảng mã có dấu tiếng Việt chuẩn.
  - `🖨️ In danh sách mã`: Định dạng A4 chuẩn phòng thi trường THCS Nhuận Đức.
- **Xem chi tiết & Reset bài**: Cô giáo xem ảnh webcam đối chiếu của từng học sinh hoặc reset để học sinh thi lại.

### 5. 🚀 Backend Server Node.js & Đồng bộ trung tâm (Production Ready)
- `server.js`: Web server thuần Node.js 0 dependencies, hỗ trợ nén Gzip, cache header, phục vụ web siêu nhẹ và mượt mà trên 4G/5G điện thoại.
- REST API `/api/submissions`: Đồng bộ tập trung mọi bài nộp của học sinh từ mọi thiết bị về máy chủ để giáo viên kiểm tra từ xa.
- Hỗ trợ endpoint `/health` để Railway kiểm tra liveness probe.

---

## 🛠️ CẤU TRÚC THƯ MỤC DỰ ÁN

```
mtdp/
├── index.html              # Giao diện chính (SPA đầy đủ các màn hình & pop-up)
├── css/
│   └── style.css           # Toàn bộ CSS phong cách Modern Dark/Light, Responsive
├── js/
│   ├── data.js             # Dữ liệu 40 câu hỏi, 16 từ vựng & 72 học sinh (có loginCode)
│   └── app.js              # Logic kiểm tra, chống gian lận, webcam pop-up, sync API
├── server.js               # Node.js Production HTTP Server & API lưu trữ trung tâm
├── package.json            # Cấu hình dự án & scripts chạy Railway
├── railway.toml            # Cấu hình triển khai tự động trên Railway
├── .gitignore              # Loại bỏ file log, file rác khi đưa lên GitHub
└── README.md               # Tài liệu hướng dẫn sử dụng và triển khai
```

---

## 🚀 HƯỚNG DẪN ĐƯA LÊN GITHUB & DEPLOY LÊN RAILWAY

### BƯỚC 1: Cài đặt Git (nếu máy tính chưa có)
Mở PowerShell và chạy lệnh cài đặt Git qua winget:
```powershell
winget install --id Git.Git -e --source winget
```
*(Sau khi cài xong, tắt và mở lại terminal/VSCode để nhận lệnh `git`)*

Hoặc bạn có thể dùng phần mềm trực quan **GitHub Desktop**: [desktop.github.com](https://desktop.github.com)

---

### BƯỚC 2: Khởi tạo và đẩy mã nguồn lên GitHub
1. Tạo một repository mới trên GitHub (ví dụ đặt tên: `nhuanduc-edu-test`), chọn **Private** hoặc **Public**.
2. Tại thư mục dự án `c:\Users\X13\Desktop\mtdp`, mở terminal chạy các lệnh sau:

```bash
git init
git add .
git commit -m "feat: complete Nhuận Đức English Assessment platform with Railway deployment config"
git branch -M main
git remote add origin https://github.com/<tai-khoan-github-cua-ban>/nhuanduc-edu-test.git
git push -u origin main
```

---

### BƯỚC 3: Triển khai lên Railway (Chạy thật trực tuyến)
1. Truy cập [railway.com](https://railway.com) và đăng nhập bằng tài khoản GitHub.
2. Bấm nút **"New Project"** (hoặc nút **"+"** màu tím).
3. Chọn **"Deploy from GitHub repo"**.
4. Chọn repository `nhuanduc-edu-test` vừa tạo ở Bước 2.
5. Railway sẽ tự động:
   - Nhận diện tệp `railway.toml` và `package.json`.
   - Build và chạy lệnh `node server.js`.
   - Kiểm tra endpoint `/health` (Healthcheck OK).
6. **Tạo tên miền công khai cho học sinh truy cập**:
   - Bấm vào service vừa deploy trên Railway ➔ Chọn tab **Settings**.
   - Tìm mục **Networking** / **Public Networking** ➔ Bấm **"Generate Domain"**.
   - Railway sẽ cấp cho bạn một đường link HTTPS miễn phí (ví dụ: `https://nhuanduc-edu-test.up.railway.app`).
7. **Hoàn tất**: Giao link này cho học sinh kèm danh sách Mã dự thi (4 số) để các em bắt đầu làm bài!

---

## 🔑 THÔNG TIN ĐĂNG NHẬP GIÁO VIÊN
- **Mật khẩu đăng nhập Giáo viên**: `phuc2026`
- **Mã dự thi mẫu để test nhanh**:
  - `9201`: Em Lý Đặng Hoài An (Lớp 9.2C)
  - `9501`: Em Nguyễn Hoàng An (Lớp 9.5C)
