# Setup Database với Supabase

## Bước 1: Tạo Supabase Project

1. Truy cập: https://supabase.com
2. Đăng ký/Đăng nhập (có thể dùng GitHub)
3. Click "New Project"
4. Điền thông tin:
   - **Name**: `saxcorner` (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh (lưu lại!)
   - **Region**: Chọn gần bạn nhất
5. Click "Create new project"
6. Đợi 1-2 phút để project được tạo

## Bước 2: Lấy Connection String

1. Vào project vừa tạo
2. Click vào **Settings** (icon bánh răng) ở sidebar trái
3. Click **Database** trong menu
4. Scroll xuống phần **Connection string**
5. Chọn tab **URI**
6. Copy connection string (sẽ có dạng: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
7. Thay `[YOUR-PASSWORD]` bằng password bạn đã tạo ở bước 1

## Bước 3: Cấu hình .env

1. Mở file `.env` trong project
2. Thêm dòng:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
   ```
3. Thay `YOUR_PASSWORD` và `xxx` bằng thông tin thực tế từ Supabase

## Bước 4: Chạy Migrations và Seed

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed data vào database
npm run db:seed
```

## Bước 5: Kiểm tra

1. Mở Prisma Studio để xem data:
   ```bash
   npm run db:studio
   ```

2. Hoặc vào Supabase Dashboard → Table Editor để xem tables

## Lưu ý

- **Bảo mật**: Không commit file `.env` lên Git
- **Backup**: Supabase tự động backup, nhưng bạn có thể export data nếu cần
- **Limits**: Free tier có giới hạn, nhưng đủ cho development và small production

## Troubleshooting

Nếu gặp lỗi connection:
- Kiểm tra password đã đúng chưa
- Kiểm tra connection string format
- Đảm bảo project đã được tạo xong (status: Active)

