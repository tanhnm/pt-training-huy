# Hướng Dẫn Deploy Lên Firebase Hosting (Gói Free - Spark Plan)

Hệ thống **ApexCoach** hiện đã được tối ưu hóa 100% để chạy như một ứng dụng tĩnh (Single Page App - SPA). Bạn có thể triển khai lên **Firebase Hosting hoàn toàn miễn phí trọn đời (0đ)**.

---

## 1. Chuẩn Bị Trước Khi Deploy

1. Đăng nhập vào [Firebase Console](https://console.firebase.google.com/) bằng tài khoản Google.
2. Bấm **"Add project"** (Thêm dự án), đặt tên dự án (ví dụ: `apex-coach-studio`), sau đó hoàn tất tạo project.
3. Cài đặt **Firebase CLI** trên máy tính (nếu chưa cài):
   ```bash
   npm install -g firebase-tools
   ```
4. Đăng nhập Firebase từ terminal:
   ```bash
   firebase login
   ```

---

## 2. Liên Kết Dự Án Với Firebase

Tại thư mục gốc của source code (`ApexTraining-main`), chạy lệnh khởi tạo hoặc liên kết:
```bash
firebase use --add
```
- Chọn dự án bạn vừa tạo trên Firebase Console.
- Đặt tên alias (ví dụ: `default`).

*(File cấu hình `firebase.json` đã được tạo sẵn trong source code trỏ đúng vào thư mục `dist` và cấu hình Single Page App rewrites).*

---

## 3. Build và Deploy Lên Firebase Hosting

Chạy 2 lệnh sau:

```bash
# 1. Đóng gói mã nguồn Frontend
npm run build

# 2. Đẩy lên Firebase Hosting
firebase deploy --only hosting
```

Sau khi chạy xong, Firebase sẽ cung cấp cho bạn đường dẫn truy cập miễn phí có dạng:
`https://<project-id>.web.app` hoặc `https://<project-id>.firebaseapp.com`

---

## 4. Các Điểm Nổi Bật Của Hệ Thống Hiện Tại

1. **Khách hàng không cần tài khoản:**
   - Huấn luyện viên tạo giáo án (Workouts) và thực đơn (Meals).
   - Nhấn nút **"Xuất PDF"** trên màn hình để tải file `.pdf` hoặc In / Lưu PDF gửi trực tiếp cho khách qua Zalo/Messenger.
2. **Dữ liệu lưu trữ cục bộ & Không tốn phí Server:**
   - Dữ liệu học viên, giáo án được lưu persistent trên trình duyệt.
   - Tính năng **Sao lưu & Khôi phục (Backup & Restore JSON)** trong mục **Settings (Cài đặt)** giúp bạn tải bản sao lưu dữ liệu về máy bất cứ lúc nào và khôi phục khi đổi máy.
3. **Tùy biến thương hiệu PT:**
   - Vào **Settings** để cập nhật Tên Huấn luyện viên, Hotline, Tên Studio, Bio để thông tin này tự động xuất hiện trên đầu các bản in PDF gửi cho học viên.
