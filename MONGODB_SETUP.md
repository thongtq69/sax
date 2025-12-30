# Setup MongoDB Local với Prisma

> **💡 Tip:** Nếu bạn không muốn cài MongoDB local, hãy dùng **MongoDB Atlas** (cloud) - xem file `MONGODB_ATLAS_SETUP.md`

## Bước 1: Kiểm tra MongoDB đang chạy

```bash
# Kiểm tra MongoDB service
mongosh --eval "db.version()"

# Hoặc nếu dùng Homebrew trên Mac
brew services list | grep mongodb
```

Nếu MongoDB chưa chạy:
```bash
# Start MongoDB (Mac với Homebrew)
brew services start mongodb-community

# Hoặc start thủ công
mongod --config /usr/local/etc/mongod.conf
```

## Bước 2: Tạo Database

MongoDB sẽ tự động tạo database khi bạn connect lần đầu. Tên database sẽ được lấy từ connection string.

## Bước 3: Cấu hình .env

Mở file `.env` và thêm:

```bash
DATABASE_URL="mongodb://localhost:27017/saxcorner"
```

Hoặc nếu MongoDB có authentication:
```bash
DATABASE_URL="mongodb://username:password@localhost:27017/saxcorner?authSource=admin"
```

## Bước 4: Generate Prisma Client và Push Schema

```bash
# Generate Prisma Client cho MongoDB
npm run db:generate

# Push schema to MongoDB (tạo collections)
npm run db:push
```

## Bước 5: Seed Data

```bash
# Seed data vào MongoDB
npm run db:seed
```

## Bước 6: Kiểm tra

```bash
# Mở Prisma Studio để xem data
npm run db:studio
```

Hoặc dùng mongosh:
```bash
mongosh saxcorner
> show collections
> db.Category.find().pretty()
> db.Product.find().pretty()
```

## Lưu ý

- MongoDB không cần migrations như PostgreSQL
- `db:push` sẽ tạo collections và indexes tự động
- MongoDB sử dụng ObjectId thay vì cuid() cho IDs
- Relations vẫn hoạt động nhưng lưu dưới dạng ObjectId references

## Troubleshooting

**Lỗi connection:**
- Kiểm tra MongoDB đang chạy: `mongosh --eval "db.version()"`
- Kiểm tra connection string trong `.env`
- Kiểm tra port (mặc định: 27017)

**Lỗi permission:**
- Đảm bảo MongoDB user có quyền read/write
- Hoặc dùng connection string không có auth cho local development

