# Fix MongoDB Atlas Connection trên Vercel - QUAN TRỌNG

## Vấn đề

Lỗi: `I/O error: received fatal alert: InternalError` khi deploy lên Vercel.

## Giải pháp CHÍNH: Update DATABASE_URL trên Vercel

**QUAN TRỌNG:** Connection string trên Vercel **PHẢI** có đầy đủ SSL/TLS parameters.

### Connection string hiện tại của bạn:
```
mongodb+srv://phidthss181383_db_user:iLXd00c9BwNOFzdx@cluster0.0xfru2n.mongodb.net/saxcorner?retryWrites=true&w=majority
```

### Connection string CẦN UPDATE thành:
```
mongodb+srv://phidthss181383_db_user:iLXd00c9BwNOFzdx@cluster0.0xfru2n.mongodb.net/saxcorner?retryWrites=true&w=majority&ssl=true&tls=true&connectTimeoutMS=10000&socketTimeoutMS=45000
```

## Các bước thực hiện:

### 1. Vào Vercel Dashboard
- Project → Settings → Environment Variables
- Click vào `DATABASE_URL` để edit

### 2. Update Value
Copy và paste connection string mới (có thêm `&ssl=true&tls=true&connectTimeoutMS=10000&socketTimeoutMS=45000`)

### 3. Save và Redeploy
- Click "Save"
- Vào Deployments → Click "..." → Redeploy
- Đợi deployment hoàn tất

### 4. Test lại
```
https://sax-beta.vercel.app/api/test
```

## Kiểm tra MongoDB Atlas

1. **Network Access:**
   - Vào MongoDB Atlas → Network Access
   - Đảm bảo có rule: `0.0.0.0/0` (Allow Access from Anywhere)

2. **Database User:**
   - Vào Database Access
   - Đảm bảo user có quyền read/write

## Lưu ý

- Code đã được update để không gọi `$connect()` trong serverless (tốt hơn cho Vercel)
- Nhưng **vẫn cần update DATABASE_URL trên Vercel** với đầy đủ SSL/TLS parameters
- Đây là bước QUAN TRỌNG NHẤT để fix lỗi
