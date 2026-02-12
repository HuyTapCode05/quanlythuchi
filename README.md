## FinTrack – Ứng dụng quản lý thu chi cá nhân

FinTrack là một ứng dụng web giúp bạn **theo dõi thu nhập, chi tiêu và danh mục** một cách trực quan, sử dụng giao diện dark hiện đại.

### ✨ Tính năng chính

- **Đăng ký / Đăng nhập** (lưu trên `localStorage`, không cần backend)
- **Dashboard tổng quan**
  - Tổng thu, tổng chi, số dư hiện tại
  - Biểu đồ thu/chi 6 tháng gần đây
  - Biểu đồ tròn chi tiêu theo danh mục
  - Danh sách giao dịch gần đây
- **Quản lý giao dịch**
  - Thêm / sửa / xóa giao dịch
  - Lọc theo loại (thu / chi), danh mục
  - Tìm kiếm theo tên danh mục / ghi chú
  - Phân trang danh sách
- **Quản lý danh mục**
  - Tạo danh mục thu nhập / chi tiêu
  - Chọn màu sắc, icon emoji cho từng danh mục

### 🛠️ Công nghệ sử dụng

- **React 19** + **Vite**
- **React Router** (SPA, bảo vệ route theo trạng thái đăng nhập)
- **Recharts** (biểu đồ)
- **Lucide React** (icon)

### 🚀 Cách chạy project

```bash
# Cài đặt dependency
npm install

# Chạy dev server
npm run dev

# Build production
npm run build
```

Sau khi `npm run dev`, mở trình duyệt tại địa chỉ được in ra (thường là `http://localhost:5173`).

### 🔐 Luồng đăng nhập

1. Truy cập `/register` để tạo tài khoản mới (tên, email, mật khẩu).
2. Sau khi đăng ký thành công, app tự động đăng nhập và chuyển tới trang Dashboard.
3. Từ lần sau, chỉ cần vào `/login` và dùng email + mật khẩu đã đăng ký.
4. Nhấn vào avatar ở góc trên phải để **đăng xuất**.


