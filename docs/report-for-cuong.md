# Báo cáo tiến độ gửi anh Cường

Em (Claude) đã đối chiếu `Mar 02.pdf` và `request.pdf` với code hiện tại. Đây là kết quả.

## Đã xử lý xong (14 mục)

| # | Trạng thái | Mục | Trước | Sau |
|---|------------|------|-------|-----|
| 1 | ✅ | Net Amount đơn hàng sai vì chưa trừ coupon | Hiện $2,800 (chưa trừ) | Trừ đúng discount → khớp số customer paid |
| 2 | ✅ | Website chưa có favicon | Tab trình duyệt trống | Icon saxophone vàng hiện trên tab |
| 3 | ✅ | Inquiry không báo về inbox admin | Chỉ gửi mail cho khách | Inquiry mới gửi email cho admin kèm link mở thẳng trang admin |
| 4 | ✅ | Email xác nhận đơn hàng: Status chỉ là chữ | "Order confirmed and in preparation" | Thành **link** click xem trạng thái đơn hàng trực tuyến (paid/shipped/delivered) |
| 5 | ✅ | Popup Order Details trong admin | Bấm xem → popup | Bỏ popup, bấm xem → mở thẳng **trang riêng** |
| 6 | ✅ | Homepage: "SHOP BY CATEGORY" đổi tên | SHOP BY CATEGORY | **CATEGORIES** (bỏ View All) |
| 7 | ✅ | Homepage: "SHOP BY BRAND" đổi tên + vị trí | SHOP BY BRAND | **BRANDS**, đặt trên FEATURED INSTRUMENTS |
| 8 | ✅ | BRANDS upload hình nền không hiện | Không có logic nền | Vào **Admin → Featured Collections** có mục "Brands" để upload, hình sẽ hiện ngay |
| 9 | ✅ | Brand page giao diện giống saxshop.com | Logo nhỏ + title lệch trái | Hero banner full-width, chữ "YAMAHA SAXOPHONES" to ở giữa trên hình nền |
| 10 | ✅ | Upload hình nền + Meta cho từng brand từ admin | Không có | **Admin → Brands → Edit** có thêm 3 trường: Hero Banner Image, Meta Title, Meta Description |
| 11 | ✅ | Tạo trang `/used-professional-saxophones` (Mar 02) | Chưa có | Tạo đầy đủ H1, intro, meta, list sản phẩm used chia theo Yamaha/Yanagisawa/Selmer |
| 12 | ✅ | Footer thêm link "Used Professional Saxophones" | Không có | Có ở mục Shop (cả desktop + mobile) |
| 13 | ✅ | Product page meta auto-generate kèm Condition | `Yamaha YTS-62 \| Professional Model` | `Yamaha YTS-62 Tenor Saxophone – Excellent Condition \| James Sax Corner` + mô tả tương ứng |
| 14 | ✅ | Blog thêm Draft & Schedule | Chỉ có Publish | 3 nút: 📝 Draft / ⏰ Schedule (pick ngày giờ) / ✅ Published. Hệ thống tự đăng đúng giờ (check mỗi 15 phút) |

## Còn 6 điểm em chưa dám tự quyết

| # | Trạng thái | Điểm | Em cần anh trả lời |
|---|------------|------|---------------------|
| 1 | ❓ | **Review sản phẩm: giữ hay xóa?** — Mar 02 anh bảo "xóa luôn cho nhẹ", request.pdf mới lại bảo "tạo thêm review order" | Anh chọn: (a) xóa cả 2, (b) giữ Order Review cho khách đã mua + xóa Product Review công khai, (c) giữ nguyên cả 2 |
| 2 | ❓ | **Footer "Account chưa có logic"** — Code `/account` hiện đã có logic đầy đủ (login → Orders/Profile/Wishlist) | Anh chụp từ bản cũ, hay anh muốn behavior khác cụ thể? |
| 3 | ❓ | **"Chuyển admin sang weblink" — phạm vi?** — 11 trang admin đang dùng popup (Products, Categories, Brands, Blog, Promos, Inquiries, Shipping, Popup Ads, Announcements, Featured Collections; Orders đã fix). Đổi hết = 2-3 ngày | Anh chọn: (a) đổi hết, hay (b) chỉ đổi trang hay lỗi — anh cho em biết cụ thể trang nào |
| 4 | ❓ | **Sort ở bảng Products admin** — Hiện đã có dropdown Sort riêng | Anh muốn (a) click tên cột để sort kiểu Excel, hay (b) dropdown hiện tại đủ? |
| 5 | ❓ | **"Rest of World Shipping ($): $300" bỏ ở đâu?** — Không có text này trong giao diện khách (khách chỉ thấy `Shipping to {country}: $X`) | Anh chụp từ bản cũ đã fix? Hay muốn sửa label ở trang admin `/admin/shipping`? |
| 6 | ❓ | **"Lỗi category lúc edit sản phẩm"** — Anh chưa mô tả chi tiết | Lỗi gì (sai/mất/crash)? Sản phẩm nào (SKU)? Bước reproduce? |

## Bước tiếp

Em chờ anh trả lời 6 câu trên rồi xử lý nốt, sau đó deploy Vercel để anh test toàn bộ.
