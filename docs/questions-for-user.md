# Câu hỏi còn mơ hồ cần user làm rõ

Dựa trên `request.pdf` và `Mar 02.pdf` — đây là những điểm em không thể tự quyết, cần user xác nhận trước khi làm.

---

## 1. Product Review — giữ hay xóa?

**Mâu thuẫn giữa 2 doc:**
- Mar 02 (trang 3): *"Review này chưa biết quản lý ở đâu, tốt nhất để manual input trong admin rồi mình bỏ chức năng này đi. Ý là chỉ manual input vài cái cho có rồi bỏ luôn. Điền product review thì nó lại hiện vào đây nên tốt nhất là xóa luôn chức năng này đi cho nhẹ!"*
- request.pdf (trang 3): *"Tạo thêm chức năng review order sau khi mua của khách hàng vì đã mua có ng mua rồi"*

**Hiện tại:** `OrderReviewForm` chỉ cho khách đã mua (status paid/processing/shipped/delivered) review sản phẩm. Nằm trong trang `/account/orders/[id]`.

**Cần user confirm:**
- (a) **Xóa hoàn toàn Product Review** (cả form public lẫn OrderReviewForm), chỉ để manual input trong admin
- (b) **Giữ OrderReviewForm** (chỉ khách đã mua mới review được), xóa Product Review public form
- (c) Giữ cả 2 như hiện tại

---

## 2. Footer: "Account chưa có logic"

**PDF (trang 1):** user vẽ mũi tên vào mục Account trong footer, ghi "Account chưa có logic"

**Hiện tại:** `/account` đã có logic: yêu cầu login → hiện dashboard Orders/Profile/Wishlist.

**Cần user confirm:**
- User dùng bản cũ khi chụp screenshot? → Đã fix, bỏ qua
- Hay user muốn behavior cụ thể khác (ví dụ: chưa login thì hiện form login ngay thay vì redirect)?

---

## 3. Admin: "Chuyển chức năng sang weblink" — scope?

**PDF (trang 6):** *"Chuyển các chức năng cho admin sang weblink chứ không để JavaScript nữa vì rất hay lỗi"*

**Hiện tại:** 11 trang admin dùng Dialog popup để edit (products, orders, blog, categories, brands, promos, inquiries, shipping, popup-ad, announcements, featured-collections).

**Cần user confirm:**
- (a) Chuyển **TẤT CẢ** 11 trang sang page riêng (công việc rất lớn, ~25 trang cần tạo/sửa)
- (b) Chỉ chuyển **những trang user hay gặp lỗi** — user cho biết cụ thể lỗi ở đâu

---

## 4. Sort trên bảng Products admin — kiểu nào?

**PDF (trang 1):** user khoanh tròn cột "Actions" header, ghi *"Actions: có thêm chức năng sort"*

**Hiện tại:** có dropdown Sort riêng (Name A-Z, Price, Stock, Stock Status) ở thanh filter.

**Cần user confirm:**
- (a) **Click trực tiếp vào header cột** (Product/Category/Price/Stock/Badge) để sort (sortable table columns) — thường gặp trên admin table
- (b) Dropdown Sort hiện tại đã đủ, không cần thêm

---

## 5. Shipping Calculator: "Rest of World Shipping ($): $300"

**PDF (trang 4):** user gạch đỏ dòng text *"Rest of World Shipping ($): $300"* với ghi chú *"Bỏ cái diễn giải này đi"*

**Hiện tại:** Trong code, product page hiện ra:
- Nếu free: `"Free shipping to ${country}"`
- Nếu có phí: `"Shipping to ${country}: $${cost}"`

**KHÔNG tìm thấy text "Rest of World Shipping ($): $300"** ở frontend. Text này chỉ xuất hiện ở:
- `/admin/shipping` page — label của input field
- API backend — zone name nội bộ

**Cần user confirm:**
- User chụp từ bản cũ? Đã sửa rồi, bỏ qua?
- Hay user muốn sửa UI ở trang admin `/admin/shipping`?

---

## 6. Lỗi category lúc edit sản phẩm

**PDF (trang 6):** *"Lỗi category lúc edit sản phẩm"*

**Cần user mô tả bug cụ thể:**
- Lỗi gì? (hiện sai category? không chọn được? crash?)
- Steps reproduce?
- Sản phẩm nào bị lỗi?

---

## Ghi chú thêm

### Đã xử lý xong (Đợt 1 + Đợt 2)
- Net Amount trừ coupon: fix
- Favicon: tạo `app/icon.svg` + `app/apple-icon.svg` từ logo saxophone gold
- Email order confirmation Status thành link: click để xem trang order trực tuyến
- Inquiry admin notification: gửi thêm email cho admin khi có inquiry mới (env: `INQUIRY_ADMIN_EMAIL` hoặc `ADMIN_EMAIL`)
- `/used-professional-saxophones` page: tạo + thêm vào footer Shop
- Product meta auto-generate với Condition: áp dụng cho sản phẩm `productType=used` có condition
- Blog Draft & Schedule: schema + UI + cron Vercel chạy mỗi 15 phút tự publish post scheduled
- SHOP BY CATEGORY → CATEGORIES, SHOP BY BRAND → BRANDS, bỏ View All
- Brand hero banner full-width + field `backgroundImage`, `metaTitle`, `metaDescription` trong schema Brand
- SHOP BY BRAND section trên homepage: hỗ trợ upload bg image qua Featured Collections (slug `brands`)
- Bỏ popup Order Details admin (đã là dead code, Eye icon đã link sang `/admin/orders/[id]`)

### Cần anh làm thủ công
- **Chạy `npx prisma db push`** để sync schema mới vào MongoDB (thêm field `backgroundImage`, `metaTitle`, `metaDescription` cho Brand + `status`, `scheduledAt`, `publishedAt` cho BlogPost)
- **Set env `CRON_SECRET`** (optional) nếu muốn bảo vệ endpoint `/api/blog/publish-scheduled` khỏi call manual từ bên ngoài
- **Set env `INQUIRY_ADMIN_EMAIL`** hoặc `ADMIN_EMAIL` — email nhận notification inquiry (mặc định `info@jamessaxcorner.com`)
- Vào `/admin/brands` mở từng brand (Yamaha/Yanagisawa/Selmer) để upload banner + điền Meta Title/Description theo Mar 02
- Vào `/admin/featured-collections` tạo collection slug `brands` + upload bg image nếu muốn cho section BRANDS có hình nền
- Deploy lên Vercel để kích hoạt cron `*/15 * * * *` cho auto-publish blog scheduled
