# Design System & UI/UX Documentation
## Specialty Music Store - E-commerce Website

---

## 📋 Tổng Quan

Tài liệu này bao gồm đầy đủ thiết kế UI/UX và design system cho website e-commerce "Specialty Music Store" - cửa hàng chuyên bán nhạc cụ & phụ kiện với cấu trúc và trải nghiệm tương tự Kessler & Sons Music.

**Mục tiêu thiết kế:**
- Tạo cảm giác "cửa hàng chuyên nghiệp, tư vấn như chuyên gia, đáng tin"
- Tối ưu cho việc tìm sản phẩm nhanh (mega menu + search)
- Mua hàng dễ dàng (quick view, biến thể, add to cart)
- Đẩy chuyển đổi qua promo/financing

---

## 📁 Cấu Trúc Tài Liệu

### 1. [Sitemap](./01-sitemap.md)
Cấu trúc navigation và sitemap đầy đủ:
- Home page
- Shop categories (Woodwinds, Brasswinds, Percussion, Strings, etc.)
- Mega menu structure (desktop) và accordion menu (mobile)
- Category listing pages (PLP)
- Product detail pages (PDP)
- Cart & Checkout flow
- Account pages
- Footer links

**Sử dụng khi:** Cần hiểu cấu trúc website và navigation hierarchy.

---

### 2. [UI Kit - Design System](./02-ui-kit.md)
Design tokens và style guide:
- **Colors**: Primary, secondary, neutral, semantic colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: 4px base unit system
- **Border Radius**: Từ sm đến xl
- **Shadows**: 5 levels từ xs đến xl
- **Layout & Grid**: Container, 12-column grid, breakpoints
- **Z-Index Scale**: Layering system
- **Transitions & Animations**: Duration, easing functions
- **Form Elements**: Input heights, styles, validation

**Sử dụng khi:** Implement CSS/styling, cần reference design tokens.

---

### 3. [Wireframes](./03-wireframes.md)
Layout mô tả chi tiết cho từng page:
- **Home Page**: Header, Hero, Promotions, Featured Products, Trust Strip, Footer
- **Category Listing Page (PLP)**: Breadcrumbs, Filters, Product Grid, Pagination
- **Product Detail Page (PDP)**: Gallery, Product Info, Variants, Tabs, Cross-sell
- **Cart Page**: Cart Items, Order Summary
- **Checkout Flow**: 3-step process (Shipping → Payment → Review)
- **Account Pages**: Login, Register, Dashboard

**Sử dụng khi:** Cần hiểu layout và cấu trúc từng page trước khi code.

---

### 4. [Component List & States](./04-component-list.md)
Danh sách đầy đủ UI components và states:
- Buttons (Primary, Secondary, Ghost, Icon)
- Badges (New, Sale, Limited, Out of Stock, etc.)
- Product Cards
- Mega Menu
- Search (Icon, Bar, Results)
- Cart Dropdown/Drawer
- Quick View Modal
- Forms (Inputs, Checkboxes, Radios, Validation)
- Filters (Sidebar/Bottom Sheet)
- Pagination
- Tabs
- Accordion
- Toast/Notifications
- Skeleton Loaders
- Breadcrumbs
- Rating/Reviews
- Financing Calculator
- Trust Badges
- Promo Banners/Carousel
- Cookie Consent

**Mỗi component bao gồm:**
- Structure/layout
- States (Default, Hover, Focus, Active, Disabled, Loading, Error, Success)
- Variants (sizes, types)
- Usage guidelines

**Sử dụng khi:** Implement components, cần biết states và interactions.

---

### 5. [Copywriting Mẫu](./05-copywriting.md)
Nội dung copywriting cho các sections:
- **Hero Section**: Headlines, descriptions, CTAs
- **Promotional Banners**: 6 mẫu promo (Financing, New Arrivals, Free Setup, Rentals, Sale, Expert Advice)
- **Trust & Help Strip**: 4 trust badges với descriptions
- **Mini FAQ**: 4 câu hỏi thường gặp
- **Category Descriptions**: Woodwinds, Brasswinds, Saxophones, etc.
- **Product Detail Copy**: Template cho product descriptions
- **Cart & Checkout Copy**: Messages, confirmations
- **Error & Success Messages**
- **Tone of Voice Guidelines**: Principles, do's & don'ts

**Sử dụng khi:** Cần nội dung cho các sections, hoặc reference tone of voice.

---

### 6. [Responsive Implementation Notes](./06-responsive-notes.md)
Hướng dẫn triển khai responsive cho desktop/tablet/mobile:
- **Breakpoints**: Mobile (< 768px), Tablet (768-1023px), Desktop (≥ 1024px)
- **Header & Navigation**: Mega menu → Accordion menu
- **Hero Section**: Height và layout adjustments
- **Product Grid**: 4 columns → 2 → 1
- **Category Listing**: Sidebar filters → Bottom sheet
- **Product Detail**: Gallery + Info layout changes
- **Cart & Checkout**: Layout splits và sticky elements
- **Typography Scaling**: Responsive font sizes
- **Touch Targets**: Minimum 44x44px
- **Performance Optimizations**: Images, JS, CSS
- **Accessibility**: Mobile considerations
- **Testing Checklist**: Devices, browsers, scenarios

**Sử dụng khi:** Implement responsive design, cần biết breakpoints và adjustments.

---

## 🎨 Design Principles

### Visual Direction
- **Tone**: Clean, professional, "shop cao cấp nhưng thân thiện"
- **Colors**: Nền trắng/neutral + brand accent (xanh dương/teal) + semantic colors
- **Typography**: Sans-serif hiện đại (Inter), hierarchy rõ ràng
- **Spacing**: Grid 12 cột, max-width 1200-1320px, radius 10-16px, shadow nhẹ

### Interaction & Motion
- Mega menu hover mở mượt, delay 200ms tránh "rụng menu"
- Quick view modal: Load nhanh, skeleton trước
- Add to cart: Toast + mini-cart drawer
- Micro-animations tinh tế (150-250ms)

### Accessibility & SEO
- Contrast đạt WCAG AA
- Keyboard navigation cho mega menu + modal
- Semantic headings, schema.org Product, OpenGraph
- Core Web Vitals: WebP/AVIF images, lazy-load, critical CSS

---

## 🚀 Implementation Workflow

### Phase 1: Foundation
1. Setup project structure
2. Implement design tokens (UI Kit)
3. Create base components (Buttons, Inputs, Cards)
4. Setup responsive grid system

### Phase 2: Core Layout
1. Header & Navigation (mega menu)
2. Footer
3. Home page layout
4. Responsive breakpoints

### Phase 3: Key Pages
1. Category listing (PLP) với filters
2. Product detail (PDP) với gallery và variants
3. Cart page
4. Checkout flow (3 steps)

### Phase 4: Features
1. Search functionality
2. Quick view modal
3. Account pages
4. Modals và overlays

### Phase 5: Polish & Optimization
1. Animations và micro-interactions
2. Performance optimization
3. Accessibility improvements
4. Cross-browser testing

---

## 📱 Breakpoints Reference

```
Mobile:     < 768px   (1 column, stacked)
Tablet:     768px - 1023px   (2 columns, simplified)
Desktop:    ≥ 1024px   (full layout, multi-column)
Large:      ≥ 1280px   (max-width container)
```

---

## 🎯 Key Features

### Navigation
- **Mega Menu**: Multi-column dropdown (desktop), accordion (mobile)
- **Search**: Expandable search bar với autocomplete
- **Cart**: Dropdown (desktop), drawer (mobile)

### Product Discovery
- **Featured Products Grid**: 4 columns desktop, responsive
- **Quick View**: Modal với product info và add to cart
- **Filters**: Sidebar (desktop), bottom sheet (mobile)
- **Sort Options**: Featured, Price, Newest, Best Sellers

### Shopping Experience
- **Product Variants**: Dropdowns cho finish, model, size
- **Financing Calculator**: Monthly payment estimates
- **Trust Badges**: Expert advice, professional setup, fast shipping
- **Promotions**: Carousel với banners

### Checkout
- **Multi-step Flow**: Shipping → Payment → Review
- **Order Summary**: Sticky sidebar (desktop), collapsible (mobile)
- **Payment Options**: Credit card, Financing, PayPal

---

## 📝 Notes cho Developers

### CSS Architecture
- Sử dụng CSS Variables cho design tokens
- Mobile-first approach
- Component-based styling
- BEM naming convention (optional, hoặc utility-first nếu dùng Tailwind)

### JavaScript
- Progressive enhancement
- Lazy load images và components
- Debounce scroll/resize handlers
- Focus management trong modals

### Performance
- Lazy load below-the-fold images
- Code splitting
- Critical CSS inline
- WebP/AVIF images với fallback

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support

---

## 🔗 Quick Links

- [Sitemap](./01-sitemap.md) - Cấu trúc navigation
- [UI Kit](./02-ui-kit.md) - Design tokens
- [Wireframes](./03-wireframes.md) - Layouts
- [Components](./04-component-list.md) - UI components
- [Copywriting](./05-copywriting.md) - Nội dung
- [Responsive](./06-responsive-notes.md) - Implementation notes

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu có câu hỏi về thiết kế hoặc cần clarification, vui lòng tham khảo các file tài liệu trên hoặc liên hệ design team.

---

**Version**: 1.0  
**Last Updated**: [Date]  
**Status**: Ready for Implementation

