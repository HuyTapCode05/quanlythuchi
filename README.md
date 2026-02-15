## FinTrack – Ứng dụng quản lý thu chi cá nhân

FinTrack là một ứng dụng web giúp bạn **theo dõi thu nhập, chi tiêu và danh mục** một cách trực quan, sử dụng giao diện dark hiện đại.

### ✨ Tính năng chính

- **Đăng ký / Đăng nhập** (lưu trong SQLite database)
- **Dashboard tổng quan**
  - Tổng thu, tổng chi, số dư hiện tại
  - Biểu đồ thu/chi 6 tháng gần đây
  - Biểu đồ tròn chi tiêu theo danh mục
  - Danh sách giao dịch gần đây
- **Quản lý giao dịch**
  - Thêm / sửa / xóa giao dịch
  - Lọc theo loại (thu / chi), danh mục
  - **Lọc theo khoảng thời gian** (từ ngày → đến ngày)
  - Quick presets: Hôm nay, Tuần này, Tháng này, Năm này
  - Tìm kiếm theo tên danh mục / ghi chú
  - Phân trang danh sách
- **Quản lý danh mục**
  - Tạo danh mục thu nhập / chi tiêu
  - Chọn màu sắc, icon emoji cho từng danh mục
- **Export/Import Database**
  - Xuất dữ liệu ra file `.db` (SQLite)
  - Nhập dữ liệu từ file `.db`

### 🛠️ Công nghệ sử dụng

**Frontend:**
- **React 19** + **Vite**
- **React Router** (SPA, bảo vệ route theo trạng thái đăng nhập)
- **Recharts** (biểu đồ)
- **Lucide React** (icon)

**Backend:**
- **Node.js** + **Express**
- **SQLite** (better-sqlite3) - Database local
- **CORS** enabled

### 🚀 Cách chạy project

```bash
# Cài đặt dependency
npm install

# Chạy backend server (port 3001)
npm run server

# Chạy frontend dev server (port 3000)
npm run dev

# Hoặc chạy cả 2 cùng lúc
npm run dev:all

# Build production
npm run build
```

**Lưu ý:**
- Backend server chạy trên `http://localhost:3001`
- Frontend dev server chạy trên `http://localhost:3000`
- Database SQLite được lưu tại `server/fintrack.db`
- Cần chạy cả backend và frontend để app hoạt động đầy đủ

### 🔐 Luồng đăng nhập

1. Truy cập `/register` để tạo tài khoản mới (tên, email, mật khẩu).
2. Sau khi đăng ký thành công, app tự động đăng nhập và chuyển tới trang Dashboard.
3. Từ lần sau, chỉ cần vào `/login` và dùng email + mật khẩu đã đăng ký.
4. Nhấn vào avatar ở góc trên phải để **đăng xuất**.

### 🌐 Deploy lên Web

Xem file `DEPLOY.md` để biết hướng dẫn chi tiết deploy lên Vercel, Netlify, Railway, Render, v.v.

**Nhanh nhất với Vercel:**
1. Vào https://vercel.com
2. Đăng nhập bằng GitHub
3. Import repository `HuyTapCode05/quanlythuchi`
4. Vercel tự động detect và deploy!

**Lưu ý**: Backend cần deploy riêng trên Railway hoặc Render vì `better-sqlite3` cần native bindings.


