# Google Search Console — Setup + MCP Integration

## Tình trạng hiện tại (phát hiện khi audit)

| Vấn đề | Mô tả | Fix |
|--------|-------|-----|
| 🔴 `Disallow: /*?*` trong robots.txt | Chặn **tất cả** URL có query params → các trang `/shop?brand=yamaha`, `/shop?category=tenor`, `/blog?category=reviews` bị Google bỏ qua (không index). Đây là nguyên nhân chính của việc `site:jamessaxcorner.com` ra ít kết quả. | ✅ Đã fix trong `app/robots.ts` — chỉ chặn tracking params (utm, fbclid, gclid, ref, session), canonical tag xử lý phần duplicate |
| 🟠 307 redirect non-www → www | Vercel mặc định dùng 307 (temporary) thay vì 308/301 (permanent) → Google không consolidate link equity | ⚠️ Cần anh config trong Vercel: vào Project → Settings → Domains → đặt `www.jamessaxcorner.com` là primary, chọn "Permanent Redirect (308)" cho non-www |
| 🟠 Sitemap lastmod kẹt ở `2026-03-15` | Code sửa sitemap chưa deploy | ⚠️ Cần deploy commit `9b7738c` và `36152f4` lên Vercel |
| 🟡 Title/meta cũ vẫn đang live | "Professional Wind Instruments" (không tối ưu SEO cho saxophone) | ⚠️ Cần deploy — đã sửa trong code |
| ✅ GSC verification meta tag | `_P7lYBUK9Gz8XYecWbXTg_pX3uoY4ZBU_jF6jgcqcC4` | OK |
| ✅ GA4 tracking | `G-MRHKG8MELS` | OK |

---

## MCP Google Search Console

Đã cấu hình `mcp-server-gsc` ([GitHub](https://github.com/ahonn/mcp-server-gsc)) trong file [.mcp.json](../.mcp.json) ở project root.

### Tools mà MCP này cho phép Claude dùng trực tiếp
- `search_analytics` — query clicks / impressions / CTR / position theo ngày, query, page, country, device
- `list_sites` — liệt kê properties anh verify trong GSC
- Query filters: pageFilter, queryFilter, countryFilter, deviceFilter, searchAppearanceFilter

### Anh cần làm 3 bước (chỉ 1 lần)

**Bước 1 — Tạo service account Google**
1. Vào https://console.cloud.google.com/
2. Tạo project mới (tên bất kỳ, ví dụ "jamessax-gsc")
3. Vào **APIs & Services → Library** → search "Google Search Console API" → **Enable**
4. Vào **APIs & Services → Credentials → Create Credentials → Service Account**
5. Điền tên (ví dụ "claude-gsc-reader"), role không cần chọn, nhấn **Done**
6. Bấm vào service account vừa tạo → tab **Keys → Add Key → Create new key → JSON** → tải file JSON

**Bước 2 — Grant quyền trong Search Console**
1. Mở file JSON vừa tải → copy email `client_email` (format: `name@project.iam.gserviceaccount.com`)
2. Vào https://search.google.com/search-console → chọn property `www.jamessaxcorner.com`
3. **Settings → Users and permissions → Add user** → paste email service account → Permission: **Owner** hoặc **Full**
4. Save

**Bước 3 — Đặt file credentials và env variable**
```bash
# Lưu file JSON vào project (đã gitignored, không bị commit)
mv ~/Downloads/your-service-account-xxx.json /Users/bephi/sax/sax/gsc-credentials.json

# Set env variable (thêm vào ~/.zshrc hoặc ~/.bashrc để persistent)
export GSC_CREDENTIALS_PATH="/Users/bephi/sax/sax/gsc-credentials.json"
```

**Bước 4 — Reload Claude Code**
Đóng và mở lại Claude Code. Nếu thấy `gsc` trong danh sách MCP servers là ok.

### Sau khi setup xong, anh có thể hỏi em:
- "Check GSC xem top 10 queries của jamessaxcorner.com trong 7 ngày qua"
- "Có bao nhiêu page bị coverage error? Page nào impression cao mà CTR thấp?"
- "So sánh traffic tuần này vs tuần trước"
- "Kiểm tra page `/p/yamaha-yts-62` đã được index chưa"

---

## Checklist deploy + test

Sau khi deploy code mới lên Vercel, anh test:

- [ ] Mở https://www.jamessaxcorner.com/robots.txt → KHÔNG còn dòng `Disallow: /*?*`
- [ ] Mở https://www.jamessaxcorner.com → `<title>` thành "Premium Saxophones | Yamaha, Yanagisawa & Selmer | James Sax Corner"
- [ ] Mở https://www.jamessaxcorner.com/sitemap.xml → có `/used-professional-saxophones`, `lastmod` mới
- [ ] Mở https://jamessaxcorner.com (không www) → redirect phải là 308 (permanent)
- [ ] GSC **Request Indexing** lại cho các URL quan trọng:
  - `/`
  - `/b/yamaha-saxophones`, `/b/yanagisawa-saxophones`, `/b/selmer-saxophones`
  - `/used-professional-saxophones`
  - Các `/p/{model}` quan trọng
- [ ] GSC **Submit sitemap** lại: `https://www.jamessaxcorner.com/sitemap.xml`

---

## Next-level (khuyên làm tiếp)

1. **Google Indexing API** (tự submit URL khi đăng post / thêm product mới) — cùng service account, thêm role `Owner` + bật Indexing API. Em có thể code hook auto-call API mỗi khi có post mới.
2. **IndexNow** (Bing + Yandex tự biết content mới) — chỉ cần 1 HTTP call, không cần auth phức tạp.
3. **Bing Webmaster Tools** — verify riêng, miễn phí thêm traffic.
