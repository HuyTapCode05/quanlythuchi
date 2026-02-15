# Hướng dẫn Deploy FinTrack lên Web

## 📦 GitHub Pages (Chỉ Frontend - Miễn phí)

**Lưu ý**: GitHub Pages chỉ hỗ trợ static sites, không chạy được backend Node.js. Cần deploy backend riêng.

### Cách 1: GitHub Actions (Tự động)

1. Tạo file `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. Push code lên GitHub
3. Vào Settings → Pages → Source: GitHub Actions
4. Website sẽ có tại: `https://<username>.github.io/quanlythuchi`

### Cách 2: Deploy thủ công

```bash
npm run build
cd dist
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin https://github.com/HuyTapCode05/quanlythuchi.git
git push -u origin gh-pages
```

Sau đó vào Settings → Pages → Source: `gh-pages` branch

**Lưu ý**: Cần deploy backend riêng trên Railway/Render và cập nhật `VITE_API_URL`.

## 🚀 Deploy lên Vercel (Khuyến nghị - Miễn phí)

### Bước 1: Cài đặt Vercel CLI
```bash
npm i -g vercel
```

### Bước 2: Đăng nhập Vercel
```bash
vercel login
```

### Bước 3: Deploy
```bash
vercel
```

Hoặc deploy qua GitHub:
1. Vào https://vercel.com
2. Đăng nhập bằng GitHub
3. Import project từ GitHub repository
4. Vercel sẽ tự động detect và deploy

### Cấu hình môi trường:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🌐 Deploy lên Netlify

1. Vào https://netlify.com
2. Đăng nhập bằng GitHub
3. Import project
4. Cấu hình:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

**Lưu ý**: Netlify chỉ deploy frontend. Backend cần deploy riêng.

## 🖥️ Deploy Backend lên Railway/Render

### Railway (railway.app):
1. Đăng nhập bằng GitHub
2. New Project → Deploy from GitHub
3. Chọn repository
4. Railway tự động detect Node.js và deploy

### Render (render.com):
1. Đăng nhập bằng GitHub
2. New → Web Service
3. Connect repository
4. Cấu hình:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Environment**: Node

## 📝 Lưu ý quan trọng:

1. **Database**: SQLite file (`server/fintrack.db`) sẽ được tạo tự động trên server
2. **Environment Variables**: 
   - `PORT`: Port cho backend (mặc định 3001)
   - `VITE_API_URL`: URL của API (tự động detect trên Vercel)
3. **CORS**: Đã được cấu hình để cho phép requests từ frontend
4. **Build**: Frontend build vào folder `dist/`

## 🔧 Troubleshooting:

- Nếu backend không chạy: Kiểm tra logs trên hosting platform
- Nếu API không kết nối: Kiểm tra `VITE_API_URL` trong environment variables
- Database errors: Đảm bảo server có quyền ghi file

