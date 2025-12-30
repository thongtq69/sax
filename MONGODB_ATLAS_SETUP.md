# Setup MongoDB Atlas (Cloud) - Không cần cài MongoDB local

## MongoDB Atlas là gì?

MongoDB Atlas là dịch vụ MongoDB cloud miễn phí, không cần cài đặt MongoDB trên máy. Perfect cho development và production!

## Bước 1: Tạo MongoDB Atlas Account

1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký/Đăng nhập (có thể dùng Google/GitHub)
3. Chọn **Free tier** (M0 Sandbox)

## Bước 2: Tạo Cluster

1. Sau khi đăng nhập, click **"Build a Database"**
2. Chọn **FREE** (M0 Sandbox)
3. Chọn **Cloud Provider & Region**:
   - AWS, Google Cloud, hoặc Azure
   - Chọn region gần bạn nhất (ví dụ: Singapore, Tokyo)
4. Click **"Create"**
5. Đợi 1-3 phút để cluster được tạo

## Bước 3: Tạo Database User

1. Trong phần **"Security"** → **"Database Access"**
2. Click **"Add New Database User"**
3. Chọn **"Password"** authentication
4. Tạo username và password (lưu lại!)
5. Set **Database User Privileges** → **"Atlas admin"** (hoặc **"Read and write to any database"**)
6. Click **"Add User"**

## Bước 4: Whitelist IP Address

1. Trong phần **"Security"** → **"Network Access"**
2. Click **"Add IP Address"**
3. Chọn **"Allow Access from Anywhere"** (cho development)
   - Hoặc thêm IP cụ thể của bạn cho production
4. Click **"Confirm"**

## Bước 5: Lấy Connection String

1. Vào **"Database"** → Click **"Connect"** trên cluster của bạn
2. Chọn **"Connect your application"**
3. Chọn **Driver**: `Node.js`
4. Chọn **Version**: `5.5 or later`
5. Copy connection string (sẽ có dạng):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Bước 6: Cấu hình .env

Mở file `.env` và thêm:

```bash
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/saxcorner?retryWrites=true&w=majority"
```

**Lưu ý:**
- Thay `username` và `password` bằng thông tin bạn đã tạo ở Bước 3
- Thay `cluster0.xxxxx` bằng cluster name của bạn
- Thay `saxcorner` bằng tên database bạn muốn (hoặc để mặc định)

## Bước 7: Generate Prisma Client và Push Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to MongoDB Atlas (tạo collections)
npm run db:push
```

## Bước 8: Seed Data

```bash
# Seed data vào MongoDB Atlas
npm run db:seed
```

## Bước 9: Kiểm tra

```bash
# Mở Prisma Studio để xem data
npm run db:studio
```

Hoặc vào MongoDB Atlas Dashboard:
1. Click **"Browse Collections"** trên cluster
2. Xem các collections đã được tạo

## Free Tier Limits (M0 Sandbox)

- **Storage**: 512 MB
- **RAM**: Shared
- **Backup**: Không có (có thể upgrade)
- **Đủ cho**: Development và small production

## Lưu ý bảo mật

- **Không commit** file `.env` lên Git
- Sử dụng **environment variables** trên hosting (Vercel, Railway, etc.)
- Trong production, chỉ whitelist IP của server

## Troubleshooting

**Lỗi connection:**
- Kiểm tra username/password đã đúng chưa
- Kiểm tra IP đã được whitelist chưa
- Kiểm tra connection string format

**Lỗi timeout:**
- Kiểm tra network connection
- Thử thay đổi region gần hơn

## So sánh với MongoDB Local

| Feature | MongoDB Local | MongoDB Atlas |
|---------|---------------|---------------|
| Setup | Cần cài đặt | Chỉ cần account |
| Storage | Giới hạn bởi disk | 512MB free |
| Backup | Tự làm | Tự động (paid) |
| Access | Chỉ local | Từ mọi nơi |
| Production | Cần server | Sẵn sàng |

**Kết luận:** MongoDB Atlas phù hợp hơn cho development và production!

