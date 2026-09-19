# HƯỚNG DẪN HOST DISCORD SELFBOT 24/7 MIỄN PHÍ TRÊN RENDER.COM

Tài liệu này hướng dẫn bạn chi tiết từng bước để đưa mã nguồn Discord Selfbot lên nền tảng đám mây **Render.com**, giúp tài khoản của bạn tự động treo trạng thái (Custom Status, Rich Presence, Streaming Twitch) và giữ phòng Voice 24/7 liên tục ngay cả khi tắt máy tính hoặc ngắt mạng.

---

## 1. Các Câu Lệnh Chuẩn Bị & Đẩy Mã Nguồn Lên GitHub

Mở Terminal / Command Prompt tại thư mục dự án này và chạy tuần tự các lệnh sau:

```bash
# 1. Khởi tạo kho lưu trữ git (nếu chưa có)
git init

# 2. Thêm tất cả các file vào git
git add .

# 3. Tạo bản commit
git commit -m "Deploy Discord Selfbot Hub to Render"

# 4. Đổi tên nhánh mặc định thành main
git branch -M main

# 5. Thêm địa chỉ kho lưu trữ GitHub của bạn (thay thế URL bên dưới bằng repo của bạn)
git remote add origin https://github.com/<tai-khoan-github-cua-ban>/<ten-repo>.git

# 6. Đẩy mã nguồn lên GitHub
git push -u origin main
```

---

## 2. Các Bước Tạo Web Service Trên Render.com

1. Truy cập [https://dashboard.render.com](https://dashboard.render.com) và đăng nhập (hoặc đăng ký miễn phí bằng tài khoản GitHub).
2. Nhấn nút **New +** ở góc trên bên phải và chọn **Web Service**.
3. Chọn tùy chọn **Build and deploy from a Git repository** rồi nhấn **Next**.
4. Chọn kho lưu trữ GitHub bạn vừa đẩy code lên ở Bước 1.
5. Điền thông tin cấu hình dịch vụ như sau:

| Mục Cấu Hình | Giá Trị Cần Điền | Ghi Chú |
| :--- | :--- | :--- |
| **Name** | `discord-selfbot-hub` | Tên ứng dụng của bạn trên Render |
| **Region** | `Singapore (Southeast Asia)` | Gần Việt Nam nhất, Ping Discord cực thấp (~15 - 30ms) |
| **Branch** | `main` | Nhánh code chính |
| **Root Directory** | *(Để trống)* | Thư mục gốc |
| **Runtime** | `Node` | Môi trường Node.js |
| **Build Command** | `npm install && npm run build` | **Lệnh biên dịch ứng dụng** |
| **Start Command** | `npm run start` | **Lệnh khởi chạy máy chủ** |
| **Instance Type** | `Free` ($0/month - 512 MB RAM, 0.1 CPU) | Hoàn toàn miễn phí |

6. Trong phần **Environment Variables** (Biến môi trường), thêm các biến sau:
   - `NODE_ENV` = `production`
   - `RENDER_EXTERNAL_URL` = `https://<ten-ung-dung-cua-ban>.onrender.com` *(Điền sau khi tạo xong URL)*

7. Nhấn nút **Create Web Service** ở dưới cùng. Render sẽ tự động chạy lệnh `npm install && npm run build` và khởi động server. Quá trình này mất khoảng 1-2 phút.

---

## 3. Bí Quyết Treo 24/7 Không Bị "Ngủ Đông" (Sleep) Trên Render Free

Gói Free của Render có cơ chế tự động đưa Web Service vào trạng thái ngủ đông (Sleep) nếu sau 15 phút không nhận được bất kỳ lượt truy cập HTTP nào.

### Cách khắc phục miễn phí 100% bằng UptimeRobot:
1. Đăng ký tài khoản miễn phí tại [https://uptimerobot.com](https://uptimerobot.com).
2. Nhấn **Add New Monitor**.
3. Điền thông tin:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Discord Selfbot Keep-Alive`
   - **URL (or IP)**: `https://<ten-ung-dung-cua-ban>.onrender.com/ping`
   - **Monitoring Interval**: Chọn `5 minutes` (hoặc `10 minutes`)
4. Nhấn **Create Monitor**.

👉 **Kết quả**: Cứ mỗi 5 phút, UptimeRobot sẽ gửi 1 yêu cầu nhẹ tới endpoint `/ping`, giúp máy chủ Render luôn thức tỉnh và giữ kết nối Discord Gateway liên tục 24/7/365!

---

## 4. Kiểm Tra Tình Trạng Hoạt Động (Health Check)

Bạn có thể mở trực tiếp đường dẫn sau trên trình duyệt để kiểm tra:
```
https://<ten-ung-dung-cua-ban>.onrender.com/ping
```
Kết quả trả về định dạng JSON:
```json
{
  "status": "alive",
  "service": "discord-selfbot-afk",
  "uptime": 12345,
  "timestamp": "2026-09-19T10:00:00.000Z"
}
```
Mã nguồn cũng đã tích hợp sẵn cơ chế **Self-Ping nội bộ**, nếu bạn đặt biến môi trường `RENDER_EXTERNAL_URL`, server sẽ tự động ping lại chính nó mỗi 10 phút!
