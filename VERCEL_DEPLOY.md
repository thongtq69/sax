# Vercel Deployment Guide

## Environment Variables

Đảm bảo bạn đã set các environment variables sau trên Vercel:

1. **DATABASE_URL**: MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - Lấy từ MongoDB Atlas → Connect → Connect your application

2. **NODE_ENV**: `production` (tự động set bởi Vercel)

## Build Configuration

Vercel sẽ tự động:
- Chạy `npm install` (sẽ trigger `postinstall` script → `prisma generate`)
- Chạy `npm run build` (sẽ chạy `prisma generate && next build`)

## Troubleshooting

### Lỗi 500 Internal Server Error

1. **Kiểm tra Environment Variables:**
   - Vào Vercel Dashboard → Project → Settings → Environment Variables
   - Đảm bảo `DATABASE_URL` đã được set và đúng format

2. **Kiểm tra MongoDB Atlas:**
   - Đảm bảo IP whitelist cho phép tất cả IPs (0.0.0.0/0) hoặc Vercel IPs
   - Đảm bảo database user có quyền read/write

3. **Kiểm tra Prisma Client:**
   - Vào Vercel Dashboard → Deployments → Latest deployment → Build Logs
   - Tìm `prisma generate` trong logs
   - Nếu không thấy, có thể cần thêm vào `package.json`:
     ```json
     "postinstall": "prisma generate"
     ```

4. **Test API Health:**
   - Gọi `https://your-app.vercel.app/api/health`
   - Nếu trả về `{ status: 'ok', database: 'connected' }` → Database OK
   - Nếu trả về error → Kiểm tra DATABASE_URL

### Common Issues

**Issue: "Prisma Client not generated"**
- Solution: Đảm bảo `postinstall` script có `prisma generate`

**Issue: "Can't reach database server"**
- Solution: Kiểm tra DATABASE_URL và MongoDB Atlas network access

**Issue: "Authentication failed"**
- Solution: Kiểm tra username/password trong DATABASE_URL

## Testing Locally

Để test production build locally:

```bash
# Set environment variable
export DATABASE_URL="your-mongodb-connection-string"

# Build
npm run build

# Start production server
npm start
```

## Debug API trên Vercel

### Bước 1: Test Database Connection
Gọi endpoint test để kiểm tra:
```
https://your-app.vercel.app/api/test
```

Endpoint này sẽ trả về:
- ✅ Nếu OK: `{ status: 'ok', database: { connected: true } }`
- ❌ Nếu lỗi: Chi tiết error message và environment info

### Bước 2: Kiểm tra Environment Variables trên Vercel

1. **Vào Vercel Dashboard:**
   - Project → Settings → Environment Variables

2. **Đảm bảo có các variables sau:**
   - `DATABASE_URL` - MongoDB connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

3. **Kiểm tra Environment:**
   - Production: ✅
   - Preview: ✅ (nếu cần)
   - Development: ✅ (nếu cần)

4. **Sau khi thêm/sửa:**
   - Phải **Redeploy** để áp dụng changes
   - Vào Deployments → Click "..." → Redeploy

### Bước 3: Kiểm tra MongoDB Atlas

1. **Network Access:**
   - Vào MongoDB Atlas → Network Access
   - Đảm bảo có rule cho phép `0.0.0.0/0` (tất cả IPs)
   - Hoặc thêm Vercel IP ranges

2. **Database User:**
   - Vào Database Access
   - Đảm bảo user có quyền read/write
   - Username/password phải match với DATABASE_URL

### Bước 4: Kiểm tra Build Logs

1. Vào Vercel Dashboard → Deployments → Latest deployment
2. Xem Build Logs, tìm:
   ```
   ✔ Generated Prisma Client
   ```
   - Nếu không thấy → Prisma Client chưa được generate

### Bước 5: Kiểm tra Function Logs

1. Vào Vercel Dashboard → Deployments → Latest deployment
2. Click vào Function (ví dụ: `/api/products`)
3. Xem Runtime Logs để thấy error message chi tiết

### Common Errors và Solutions

**Error: "DATABASE_URL is not set"**
- Solution: Thêm `DATABASE_URL` vào Vercel Environment Variables và redeploy

**Error: "Can't reach database server"**
- Solution: Kiểm tra MongoDB Atlas Network Access, cho phép `0.0.0.0/0`

**Error: "Authentication failed"**
- Solution: Kiểm tra username/password trong DATABASE_URL

**Error: "Prisma Client not generated"**
- Solution: Đảm bảo `postinstall` script có `prisma generate` trong package.json

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/products` - Get products
- `GET /api/products/[id]` - Get product by ID
- `GET /api/products/slug/[slug]` - Get product by slug
- `GET /api/categories` - Get categories
- `GET /api/blog` - Get blog posts
- `GET /api/promos` - Get promo banners

