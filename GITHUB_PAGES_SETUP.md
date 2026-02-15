# 🚀 Hướng dẫn Deploy lên GitHub Pages

## Bước 1: Kích hoạt GitHub Pages

1. Vào repository: https://github.com/HuyTapCode05/quanlythuchi
2. Click **Settings** (ở menu trên)
3. Vào **Pages** (ở sidebar bên trái)
4. **Source**: Chọn **"GitHub Actions"**
5. Lưu lại

## Bước 2: Chạy Workflow

### Cách 1: Tự động (Khuyến nghị)
- Workflow sẽ tự động chạy khi bạn push code lên branch `main`
- Push một commit mới để trigger workflow:
```bash
git commit --allow-empty -m "Trigger GitHub Pages deployment"
git push origin main
```

### Cách 2: Chạy thủ công
1. Vào tab **Actions** trên GitHub
2. Chọn workflow **"Deploy to GitHub Pages"**
3. Click **"Run workflow"** → **"Run workflow"**

## Bước 3: Kiểm tra

1. Vào tab **Actions** → xem workflow đang chạy
2. Đợi workflow hoàn thành (khoảng 2-3 phút)
3. Website sẽ có tại: **https://huytapcode05.github.io/quanlythuchi/**

## ⚠️ Lưu ý quan trọng:

### Backend cần deploy riêng!

GitHub Pages chỉ deploy **frontend** (static files). Backend Node.js cần deploy riêng:

**Option 1: Railway (Khuyến nghị - Miễn phí)**
1. Vào https://railway.app
2. Đăng nhập bằng GitHub
3. New Project → Deploy from GitHub
4. Chọn repository `quanlythuchi`
5. Railway tự động detect và deploy backend
6. Copy URL backend (ví dụ: `https://your-app.railway.app`)
7. Vào GitHub repository → Settings → Secrets → Actions
8. Thêm secret: `VITE_API_URL` = `https://your-app.railway.app/api`

**Option 2: Render**
1. Vào https://render.com
2. Đăng nhập bằng GitHub
3. New → Web Service
4. Connect repository
5. Cấu hình:
   - Build Command: `npm install`
   - Start Command: `npm run server`
6. Copy URL và thêm vào GitHub Secrets như trên

## 🔧 Troubleshooting:

- **Workflow không chạy**: Kiểm tra tab Actions xem có lỗi gì không
- **Website không load**: Kiểm tra base path trong `vite.config.js` có đúng `/quanlythuchi/` không
- **API không kết nối**: Đảm bảo đã thêm `VITE_API_URL` vào GitHub Secrets và rebuild

## 📝 Sau khi deploy:

1. Frontend: `https://huytapcode05.github.io/quanlythuchi/`
2. Backend: URL từ Railway/Render (ví dụ: `https://your-app.railway.app`)
3. Cập nhật `VITE_API_URL` trong GitHub Secrets để frontend kết nối được backend

