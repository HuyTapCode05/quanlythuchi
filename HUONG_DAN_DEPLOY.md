# 📖 Hướng dẫn Deploy Website - Bước tiếp theo

## ✅ Bạn đã làm xong:
- ✅ Code đã được push lên GitHub
- ✅ GitHub Actions workflow đã được tạo
- ✅ GitHub Pages đã được cấu hình

## 🎯 Các bước tiếp theo:

### 1. Kiểm tra Workflow đang chạy

1. Vào repository: https://github.com/HuyTapCode05/quanlythuchi
2. Click tab **"Actions"** (ở menu trên)
3. Xem workflow **"Deploy to GitHub Pages"** đang chạy
4. Đợi khoảng 2-3 phút để workflow hoàn thành

### 2. Kiểm tra Website

Sau khi workflow hoàn thành (có dấu ✅ xanh):
- Website sẽ có tại: **https://huytapcode05.github.io/quanlythuchi/**
- Mở link này trong browser để xem website

### 3. ⚠️ QUAN TRỌNG: Deploy Backend

**GitHub Pages chỉ chạy frontend!** Backend cần deploy riêng:

#### Cách 1: Railway (Dễ nhất - Miễn phí)

1. Vào https://railway.app
2. Đăng nhập bằng GitHub
3. Click **"New Project"**
4. Chọn **"Deploy from GitHub repo"**
5. Chọn repository `quanlythuchi`
6. Railway tự động detect và deploy backend
7. Đợi 2-3 phút
8. Copy URL backend (ví dụ: `https://quanlythuchi-production.up.railway.app`)
9. Vào GitHub repository → **Settings** → **Secrets and variables** → **Actions**
10. Click **"New repository secret"**
11. Name: `VITE_API_URL`
12. Value: `https://your-backend-url.railway.app/api` (thay bằng URL thật của bạn)
13. Click **"Add secret"**

#### Cách 2: Render (render.com)

1. Vào https://render.com
2. Đăng nhập bằng GitHub
3. Click **"New"** → **"Web Service"**
4. Connect repository `quanlythuchi`
5. Cấu hình:
   - **Name**: `quanlythuchi-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
6. Click **"Create Web Service"**
7. Đợi deploy xong, copy URL
8. Thêm vào GitHub Secrets như trên

### 4. Re-run Workflow để cập nhật Frontend

Sau khi thêm `VITE_API_URL` vào Secrets:

1. Vào tab **Actions** trên GitHub
2. Chọn workflow **"Deploy to GitHub Pages"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Đợi workflow chạy xong
5. Refresh website: https://huytapcode05.github.io/quanlythuchi/

## 🎉 Hoàn thành!

Website của bạn sẽ hoạt động đầy đủ:
- **Frontend**: https://huytapcode05.github.io/quanlythuchi/
- **Backend**: URL từ Railway/Render

## 🔍 Kiểm tra:

1. Mở website frontend
2. Thử đăng ký/đăng nhập
3. Nếu lỗi API: Kiểm tra lại `VITE_API_URL` trong Secrets

## 💡 Tips:

- Mỗi khi push code mới, workflow tự động deploy lại
- Backend URL có thể thay đổi, cần cập nhật lại trong Secrets
- Database SQLite sẽ được tạo tự động trên server backend

