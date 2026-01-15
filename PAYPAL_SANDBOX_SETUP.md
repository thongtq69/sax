# PayPal Sandbox Testing Guide

## ✅ Đã hoàn thành

Nút PayPal Standard Button đã được tích hợp sẵn ở trang checkout và đã được cấu hình để sử dụng Sandbox mode.

## 🔧 Cấu hình cần thiết

### 1. Cập nhật .env file

File `.env` đã được cập nhật với cấu hình sandbox:

```env
# PayPal Configuration - SANDBOX MODE FOR TESTING
NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL=sb-stwky48264789@business.example.com
PAYPAL_MODE=sandbox
NEXT_PUBLIC_PAYPAL_MODE=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXit7yu6-XjXLHTwMIfb... (từ PayPal Dashboard)
PAYPAL_CLIENT_SECRET=YOUR_SANDBOX_SECRET_HERE (cần lấy từ PayPal)
```

### 2. Lấy Sandbox Credentials từ PayPal

1. Đăng nhập vào https://developer.paypal.com
2. Vào **Apps & Credentials** > **Sandbox**
3. Chọn app **jamessaxcorner**
4. Copy **Client ID** (đã có trong screenshot của bạn)
5. Click **Show** bên cạnh **Secret** để lấy secret key
6. Cập nhật `PAYPAL_CLIENT_SECRET` trong file `.env`

### 3. Lấy Sandbox Business Email

Từ screenshot của bạn, business email là: `sb-stwky48264789@business.example.com`

Nếu cần kiểm tra lại:
1. Vào **Testing Tools** > **Sandbox Accounts**
2. Tìm tài khoản Business (có icon 🏢)
3. Copy email address

## 🧪 Cách test thanh toán

### Bước 1: Restart development server
```bash
npm run dev
```

### Bước 2: Thêm sản phẩm vào giỏ hàng
1. Vào trang shop
2. Thêm sản phẩm vào cart
3. Click "Checkout"

### Bước 3: Điền thông tin shipping
Điền đầy đủ thông tin:
- Email
- First Name, Last Name
- Address
- City, State, ZIP
- Country
- Phone

### Bước 4: Click nút PayPal
Bạn sẽ thấy nút màu xanh PayPal với text:
```
🧪 Sandbox Mode - Use test buyer account to complete payment
```

### Bước 5: Đăng nhập PayPal Sandbox
Sử dụng tài khoản **Personal/Buyer** từ Sandbox Accounts:
- Email: `sb-xxxxx@personal.example.com`
- Password: (xem trong PayPal Sandbox Accounts)

### Bước 6: Hoàn tất thanh toán
1. Review order details
2. Click "Pay Now"
3. Bạn sẽ được redirect về trang success

## 📋 Test Accounts

Bạn cần 2 loại tài khoản sandbox:

### Business Account (Seller)
- Email: `sb-stwky48264789@business.example.com`
- Đây là tài khoản nhận tiền

### Personal Account (Buyer)
- Tạo từ **Sandbox Accounts** > **Create Account**
- Chọn type: **Personal**
- Country: United States
- Sử dụng account này để test mua hàng

## 🔍 Kiểm tra giao dịch

### Trong PayPal Sandbox:
1. Đăng nhập vào business account
2. Vào **Activity** để xem transactions
3. Kiểm tra payment status

### Trong Database:
1. Vào MongoDB Atlas
2. Check collection `Order`
3. Xem order status và payment details

### Trong Admin Dashboard:
1. Đăng nhập admin: `/admin`
2. Vào **Orders**
3. Xem order mới được tạo

## 🎯 Các tính năng đã có

✅ PayPal Standard Button (Sandbox mode)
✅ Tự động tạo order trong database
✅ Hiển thị chi tiết sản phẩm trong PayPal
✅ Tính shipping cost riêng
✅ IPN (Instant Payment Notification) để cập nhật order status
✅ Redirect về success page sau thanh toán
✅ Gửi email confirmation (nếu payment completed)

## 🚨 Lưu ý quan trọng

1. **Sandbox mode chỉ dùng để test** - Không có tiền thật được chuyển
2. **Cần restart server** sau khi thay đổi .env
3. **Secret key phải được reveal** từ PayPal dashboard (click Show)
4. **Test buyer account** phải có đủ balance (PayPal tự động add $1000)
5. **IPN URL** cần được cấu hình trong PayPal:
   - URL: `https://www.jamessaxcorner.com/api/paypal/ipn`
   - Hoặc local: `https://your-ngrok-url.ngrok.io/api/paypal/ipn`

## 🔄 Chuyển về Live Mode

Khi đã test xong, uncomment live credentials trong `.env`:

```env
# PayPal Configuration - LIVE MODE
NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL=jamessaxcorner@gmail.com
PAYPAL_MODE=live
NEXT_PUBLIC_PAYPAL_MODE=live
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AfD9XOrS_mLcM9YUk38L1...
PAYPAL_CLIENT_SECRET=EJUdVXUjAKtRPeIBJjjOgY3cyBF...
```

## 📞 Troubleshooting

### Nút PayPal không hiện
- Kiểm tra console log
- Verify NEXT_PUBLIC_PAYPAL_MODE=sandbox
- Restart dev server

### Redirect về PayPal bị lỗi
- Kiểm tra business email đúng chưa
- Verify sandbox account còn active

### Payment không được ghi nhận
- Kiểm tra IPN URL
- Xem server logs: `/api/paypal/ipn`
- Verify webhook trong PayPal dashboard

### Order không được tạo
- Check console log
- Verify API route: `/api/paypal/create-standard-order`
- Kiểm tra database connection

## 🎉 Kết quả mong đợi

Sau khi test thành công:
1. ✅ Order được tạo trong database với status "pending"
2. ✅ Redirect sang PayPal sandbox
3. ✅ Thanh toán thành công với test account
4. ✅ Redirect về success page
5. ✅ Order status được cập nhật thành "paid" (qua IPN)
6. ✅ Email confirmation được gửi đến customer

---

**Lưu ý**: Nếu bạn cần test local với IPN, sử dụng ngrok để expose local server:
```bash
ngrok http 3000
```
Sau đó cập nhật IPN URL trong PayPal với ngrok URL.
