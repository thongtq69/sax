# Hướng dẫn Deploy lên Render

## Tổng quan

Render hỗ trợ Next.js rất tốt và sẽ tự động deploy cả Frontend và Backend API routes cùng lúc. **Không cần tách ra!**

## Bước 1: Chuẩn bị

### 1.1. Đảm bảo code sẵn sàng

```bash
# Test build local trước
npm run build

# Test start
npm start
```

### 1.2. Push code lên GitHub

```bash
# Nếu chưa có git repo
git init
git add .
git commit -m "Initial commit"

# Push lên GitHub
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Bước 2: Tạo Render Account

1. Truy cập: https://render.com
2. Đăng ký/Đăng nhập (có thể dùng GitHub)
3. Chọn **"New +"** → **"Web Service"**

## Bước 3: Connect GitHub Repository

1. Chọn **"Connect GitHub"** hoặc **"Connect GitLab"**
2. Authorize Render
3. Chọn repository của bạn
4. Click **"Connect"**

## Bước 4: Cấu hình Web Service

### Basic Settings:
- **Name**: `saxcorner` (hoặc tên bạn muốn)
- **Region**: Chọn gần bạn nhất (Singapore, Oregon, etc.)
- **Branch**: `main` (hoặc branch bạn muốn deploy)
- **Root Directory**: `.` (để trống nếu root)

### Build & Deploy:
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

Render sẽ tự động detect Next.js và sử dụng settings này.

## Bước 5: Cấu hình Environment Variables

Trong phần **"Environment"**, thêm các biến:

```bash
# Database
DATABASE_URL="mongodb+srv://phidthss181383_db_user:iLXd00c9BwNOFzdx@cluster0.0xfru2n.mongodb.net/saxcorner?retryWrites=true&w=majority"

# Next.js
NODE_ENV="production"

# Optional: NextAuth (nếu dùng sau này)
# NEXTAUTH_URL="https://your-app.onrender.com"
# NEXTAUTH_SECRET="your-secret-key"
```

**⚠️ Lưu ý quan trọng:**
- **KHÔNG** commit file `.env` lên Git
- Thêm `.env` vào `.gitignore`
- Chỉ thêm environment variables trên Render dashboard

## Bước 6: Deploy

1. Click **"Create Web Service"**
2. Render sẽ tự động:
   - Install dependencies
   - Run `npm run build`
   - Start server với `npm start`
3. Đợi 5-10 phút để build và deploy

## Bước 7: Kiểm tra

1. Sau khi deploy xong, bạn sẽ có URL: `https://your-app.onrender.com`
2. Test API: `https://your-app.onrender.com/api/products`
3. Test Frontend: `https://your-app.onrender.com`

## Bước 8: Setup Database (Nếu chưa có)

MongoDB Atlas đã được setup rồi, chỉ cần đảm bảo:
- IP Whitelist trên MongoDB Atlas đã cho phép Render IPs
- Hoặc cho phép "Allow Access from Anywhere" (0.0.0.0/0) cho development

## Render Free Tier

- **Free tier có:**
  - 750 giờ/tháng (đủ cho 1 service chạy 24/7)
  - Auto-sleep sau 15 phút không có traffic (wake up khi có request)
  - SSL certificate tự động
  - Custom domain support

## Troubleshooting

### Build fails:
- Kiểm tra `package.json` có đầy đủ dependencies
- Kiểm tra build command đúng chưa
- Xem logs trên Render dashboard

### API không hoạt động:
- Kiểm tra `DATABASE_URL` đã đúng chưa
- Kiểm tra MongoDB Atlas IP whitelist
- Kiểm tra Prisma Client đã được generate chưa

### App sleep và wake up chậm:
- Đây là bình thường với free tier
- Upgrade lên paid plan để không sleep
- Hoặc dùng cron job để ping app mỗi 5 phút

## Tối ưu cho Production

### 1. Thêm Health Check:
Tạo `app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ status: 'ok' })
}
```

### 2. Setup Custom Domain (Optional):
- Vào Settings → Custom Domains
- Thêm domain của bạn
- Update DNS records

### 3. Enable Auto-Deploy:
- Mặc định đã enable
- Mỗi khi push code lên GitHub, Render sẽ tự động deploy

## Next Steps

Sau khi deploy thành công:
1. Test tất cả API endpoints
2. Test frontend pages
3. Test admin panel
4. Setup monitoring (optional)

