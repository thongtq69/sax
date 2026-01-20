# SEO Setup Guide - James Sax Corner

## 1. GOOGLE SEARCH CONSOLE SETUP

### Bước 1: Đăng ký Google Search Console
1. Truy cập: https://search.google.com/search-console/
2. Đăng nhập bằng Google account
3. Thêm property: `https://jamessaxcorner.com`
4. Chọn phương thức verify: "HTML tag"
5. ✅ **ĐÃ HOÀN THÀNH**: Verification code đã được thêm vào website

### Bước 2: Submit Sitemap
1. Sau khi verify thành công
2. Vào "Sitemaps" trong Search Console
3. Submit URL: `https://jamessaxcorner.com/sitemap.xml`

## 2. GOOGLE ANALYTICS SETUP

### Bước 1: Tạo GA4 Property
1. Truy cập: https://analytics.google.com/
2. Tạo account mới cho "James Sax Corner"
3. Tạo property với tên "James Sax Corner"
4. Copy Measurement ID (dạng G-XXXXXXXXXX)

### Bước 2: Thêm GA4 vào website
```bash
npm install @next/third-parties
```

Thêm vào `app/layout.tsx`:
```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

// Thêm vào body
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

## 3. TECHNICAL SEO CHECKLIST

### ✅ Đã hoàn thành:
- [x] Sitemap.xml tự động
- [x] Robots.txt
- [x] Meta tags cơ bản
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Structured Data schemas
- [x] Canonical URLs
- [x] Google Search Console verification code

### 🔄 Cần làm tiếp:
- [x] ~~Verify Google Search Console~~ ✅ **ĐÃ XONG**
- [x] ~~Setup Google Analytics~~ ✅ **ĐÃ XONG** (G-MRHKG8MELS)
- [ ] Tạo ảnh OG (1200x630px)
- [ ] Thêm số điện thoại và social media links thật
- [ ] Optimize images (WebP format, alt tags)
- [ ] Setup SSL certificate (HTTPS)
- [ ] Page speed optimization

## 4. CONTENT SEO STRATEGY

### A. Keyword Research
**Primary Keywords:**
- "professional saxophone"
- "vintage saxophone for sale"
- "selmer saxophone"
- "yamaha saxophone"
- "tenor saxophone"
- "alto saxophone"

**Long-tail Keywords:**
- "professional tenor saxophone for sale"
- "vintage selmer mark vi saxophone"
- "best professional saxophone brands"
- "saxophone repair and maintenance"

### B. Content Plan
1. **Product Pages**: Optimize với keywords specific
2. **Blog Posts**: 
   - "How to Choose Your First Professional Saxophone"
   - "Saxophone Maintenance Guide"
   - "History of Selmer Saxophones"
   - "Comparing Tenor vs Alto Saxophones"
3. **Category Pages**: Optimize cho từng loại sax
4. **Landing Pages**: Tạo pages cho specific brands

## 5. LOCAL SEO (Nếu có địa chỉ cụ thể)

### Google My Business
1. Tạo Google My Business profile
2. Thêm địa chỉ, số điện thoại, giờ mở cửa
3. Upload photos của shop/products
4. Encourage customer reviews

### Local Schema
```json
{
  "@type": "LocalBusiness",
  "name": "James Sax Corner",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Music Street",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  }
}
```

## 6. PERFORMANCE OPTIMIZATION

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Steps:
1. Image optimization (Next.js Image component)
2. Code splitting
3. Lazy loading
4. CDN setup
5. Caching strategies

## 7. BACKLINK STRATEGY

### High-Quality Backlinks:
1. **Music Industry Directories**
2. **Saxophone Forums & Communities**
3. **Music Education Websites**
4. **Local Business Directories**
5. **Guest Posts on Music Blogs**

### Content for Link Building:
- Saxophone buying guides
- Maintenance tutorials
- Artist interviews
- Product reviews

## 8. MONITORING & ANALYTICS

### Key Metrics to Track:
- Organic traffic growth
- Keyword rankings
- Conversion rates
- Page load speeds
- Core Web Vitals
- Backlink profile

### Tools:
- Google Search Console
- Google Analytics 4
- Google PageSpeed Insights
- Ahrefs/SEMrush (paid)

## 9. NEXT STEPS PRIORITY

### Week 1:
1. ✅ ~~Setup Google Search Console~~ **HOÀN THÀNH**
2. ✅ ~~Setup Google Analytics~~ **HOÀN THÀNH** (G-MRHKG8MELS)
3. ✅ Submit sitemap
4. ✅ Create OG images

### Week 2:
1. Optimize all product pages
2. Create blog content plan
3. Setup social media profiles
4. Start building backlinks

### Month 1:
1. Publish 4-8 blog posts
2. Optimize site speed
3. Build 10+ quality backlinks
4. Monitor and adjust strategy

## 10. BUDGET CONSIDERATIONS

### Free Tools:
- Google Search Console
- Google Analytics
- Google PageSpeed Insights
- Bing Webmaster Tools

### Paid Tools (Optional):
- Ahrefs: $99/month (keyword research, backlinks)
- SEMrush: $119/month (competitor analysis)
- Screaming Frog: $259/year (technical SEO)

---

**Lưu ý**: Thay thế tất cả placeholder data (số điện thoại, địa chỉ, social media) bằng thông tin thật của bạn.