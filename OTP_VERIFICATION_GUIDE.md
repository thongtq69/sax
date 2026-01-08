# Hướng Dẫn Xác Thực OTP Email

## Tổng Quan
Hệ thống xác thực OTP (One-Time Password) đã được triển khai thành công cho quy trình đăng ký người dùng.

## Tính Năng Đã Triển Khai

### 1. Quy Trình Đăng Ký Mới
- Người dùng điền form đăng ký (tên, email, mật khẩu)
- Hệ thống tạo tài khoản và gửi mã OTP 6 chữ số qua email
- Người dùng được chuyển đến trang xác thực OTP
- Nhập mã OTP để xác thực email
- Sau khi xác thực thành công, có thể đăng nhập

### 2. Mã OTP
- **Độ dài**: 6 chữ số
- **Thời gian hết hạn**: 15 phút
- **Gửi qua**: Email (Gmail SMTP)
- **Template email**: Thiết kế đẹp với màu sắc thương hiệu James Sax Corner

### 3. Trang Xác Thực OTP (`/auth/verify-otp`)
- Giao diện nhập 6 ô cho mã OTP
- Tự động focus ô tiếp theo khi nhập
- Hỗ trợ paste mã OTP (Ctrl+V)
- Nút "Resend OTP" với cooldown 60 giây
- Hiển thị thời gian hết hạn (15 phút)
- Thông báo lỗi/thành công rõ ràng

### 4. API Endpoints

#### POST `/api/auth/register`
- Tạo tài khoản mới
- Tạo mã OTP 6 chữ số
- Gửi email chứa OTP
- Trả về email để redirect đến trang xác thực

#### POST `/api/auth/verify-otp`
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
- Xác thực mã OTP
- Đánh dấu email đã được xác thực
- Xóa token đã sử dụng

#### POST `/api/auth/resend-otp`
```json
{
  "email": "user@example.com"
}
```
- Gửi lại mã OTP mới
- Xóa mã OTP cũ
- Tạo mã OTP mới với thời gian hết hạn mới

## Cấu Trúc Database

### Model `VerificationToken` (đã cập nhật)
```prisma
model VerificationToken {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String   // email
  token      String   @unique
  type       String   @default("email-verification")
  otp        String?  // 6-digit OTP code (MỚI)
  expires    DateTime
  createdAt  DateTime @default(now())

  @@unique([identifier, token])
}
```

## Files Đã Tạo/Sửa Đổi

### Files Mới
1. `app/api/auth/verify-otp/route.ts` - API xác thực OTP
2. `app/api/auth/resend-otp/route.ts` - API gửi lại OTP
3. `app/auth/verify-otp/page.tsx` - Trang xác thực OTP (server component)
4. `app/auth/verify-otp/VerifyOTPContent.tsx` - Nội dung trang OTP (client component)

### Files Đã Sửa Đổi
1. `app/api/auth/register/route.ts` - Tạo và gửi OTP thay vì token link
2. `lib/email.ts` - Thêm function `sendOTPEmail()`
3. `components/auth/RegisterForm.tsx` - Redirect đến trang OTP
4. `prisma/schema.prisma` - Thêm field `otp` vào VerificationToken

## Cách Sử Dụng

### Đăng Ký Tài Khoản Mới
1. Truy cập `/auth/register`
2. Điền thông tin: Tên, Email, Mật khẩu
3. Click "Create Account"
4. Kiểm tra email để lấy mã OTP 6 chữ số
5. Nhập mã OTP vào trang xác thực
6. Click "Verify Email"
7. Sau khi xác thực thành công, đăng nhập tại `/auth/login`

### Gửi Lại OTP
- Nếu không nhận được email, click "Resend OTP"
- Phải đợi 60 giây giữa các lần gửi
- Mã OTP mới sẽ được gửi và mã cũ sẽ bị vô hiệu hóa

## Email Template
Email OTP có:
- Header với logo và tên thương hiệu
- Mã OTP 6 chữ số hiển thị rõ ràng
- Thông báo thời gian hết hạn (15 phút)
- Footer với thông tin công ty
- Thiết kế responsive, đẹp mắt

## Bảo Mật
- Mã OTP chỉ có hiệu lực 15 phút
- Mỗi email chỉ có 1 mã OTP active tại một thời điểm
- Mã OTP bị xóa sau khi sử dụng thành công
- Cooldown 60 giây giữa các lần gửi lại
- Mã OTP được lưu trữ an toàn trong database

## Testing

### Local Testing
```bash
# Đảm bảo database đã được cập nhật
npx prisma generate
npx prisma db push

# Chạy dev server
npm run dev

# Test flow:
# 1. Đăng ký tài khoản mới tại http://localhost:3001/auth/register
# 2. Kiểm tra email để lấy OTP
# 3. Nhập OTP tại trang xác thực
# 4. Đăng nhập sau khi xác thực thành công
```

### Production Testing
- Code đã được push lên GitHub
- Vercel sẽ tự động deploy
- Test trên: https://sax-beta.vercel.app/auth/register

## Environment Variables
Đảm bảo các biến môi trường sau đã được cấu hình:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jamessaxcorner@gmail.com
SMTP_PASSWORD=uefl sirk pise kvfz
EMAIL_FROM=noreply@jamessaxcorner.com

# NextAuth
NEXTAUTH_URL=https://sax-beta.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

## Lưu Ý
- Mã OTP chỉ chứa số (0-9)
- Độ dài cố định 6 chữ số
- Không phân biệt hoa thường (vì chỉ có số)
- Hỗ trợ paste từ clipboard
- UI tự động focus và chuyển ô

## Hỗ Trợ
Nếu có vấn đề:
1. Kiểm tra email spam/junk folder
2. Đảm bảo SMTP credentials đúng
3. Kiểm tra logs trong Vercel dashboard
4. Test resend OTP nếu không nhận được email

---

**Status**: ✅ Hoàn thành và đã deploy
**Commit**: 64930e8
**Branch**: main
