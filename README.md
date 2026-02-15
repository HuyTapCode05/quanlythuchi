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

#### Bước 1: Deploy Frontend lên GitHub Pages (Miễn phí)

1. Vào repository: https://github.com/HuyTapCode05/quanlythuchi
2. Click tab **Actions** (ở menu trên)
3. Nếu workflow chưa chạy, click **"Deploy to GitHub Pages"** → **"Run workflow"**
4. Đợi 2-3 phút để workflow hoàn thành
5. Website sẽ có tại: **https://huytapcode05.github.io/quanlythuchi/**

#### Bước 2: Deploy Backend lên Railway (Miễn phí)

**Lưu ý**: GitHub Pages chỉ chạy frontend. Backend cần deploy riêng.

1. Vào https://railway.app
2. Đăng nhập bằng GitHub
3. Click **"New Project"**
4. Chọn **"Deploy from GitHub repo"**
5. Chọn repository `quanlythuchi`
6. Railway tự động detect và deploy backend
7. Đợi 2-3 phút
8. Copy URL backend (ví dụ: `https://quanlythuchi-production.up.railway.app`)

#### Bước 3: Kết nối Frontend với Backend

1. Vào GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `VITE_API_URL`
4. Value: `https://your-backend-url.railway.app/api` (thay bằng URL thật từ Railway)
5. Click **"Add secret"**
6. Vào tab **Actions** → Chạy lại workflow **"Deploy to GitHub Pages"**

#### Hoàn thành! 🎉

- **Frontend**: https://huytapcode05.github.io/quanlythuchi/
- **Backend**: URL từ Railway


