# Specialty Music Store - Implementation Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with Header & Footer
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── shop/
│   │   └── page.tsx            # Product listing page (PLP)
│   ├── product/
│   │   └── [slug]/
│   │       └── page.tsx        # Product detail page (PDP)
│   ├── cart/
│   │   └── page.tsx            # Shopping cart
│   ├── checkout/
│   │   ├── page.tsx            # Checkout flow
│   │   └── success/
│   │       └── page.tsx        # Order confirmation
│   ├── account/
│   │   └── page.tsx            # Account/Login page
│   └── not-found.tsx           # 404 page
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── separator.tsx
│   ├── site/
│   │   ├── Header.tsx          # Sticky header with mega menu
│   │   ├── MegaMenu.tsx        # Multi-column mega menu
│   │   ├── SearchBar.tsx       # Search overlay
│   │   └── Footer.tsx          # Footer with links & hours
│   ├── product/
│   │   ├── ProductCard.tsx     # Product card component
│   │   ├── QuickViewModal.tsx  # Quick view modal
│   │   └── Filters.tsx         # Filter sidebar/sheet
│   └── cart/
│       └── MiniCartDrawer.tsx  # Cart drawer/sheet
├── lib/
│   ├── data.ts                 # Mock data (products, categories, promos)
│   ├── store/
│   │   └── cart.ts             # Zustand cart store
│   └── utils.ts                # Utility functions (cn helper)
└── public/                      # Static assets
```

## 🎨 Features Implemented

### ✅ Core Features

- **Sticky Header** với mega menu multi-column
- **Mega Menu** với hover intent và delay để tránh rụng menu
- **Search Bar** expandable với autocomplete
- **Cart** với Zustand store và localStorage persistence
- **Mini Cart Drawer** hiển thị "No products in cart" khi rỗng
- **Product Cards** với badges, quick view, và hover effects
- **Quick View Modal** với product info và add to cart
- **Product Listing Page (PLP)** với filters và pagination
- **Product Detail Page (PDP)** với gallery, tabs, và financing block
- **Cart Page** với quantity controls và order summary
- **Checkout Flow** 3-step (Shipping → Payment → Review)
- **Responsive Design** cho mobile/tablet/desktop

### 📱 Responsive Breakpoints

- **Mobile**: < 768px (hamburger menu, 1 column grid, bottom sheet filters)
- **Tablet**: 768px - 1023px (compact menu, 2-3 column grid)
- **Desktop**: ≥ 1024px (full mega menu, 4 column grid, sidebar filters)

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** (Radix UI components)
- **lucide-react** (Icons)
- **Zustand** (State management)
- **localStorage** (Cart persistence)

## 📦 Key Components

### Header Component
- Sticky header với shadow khi scroll
- Mega menu với hover delay (200ms)
- Search icon → expandable search overlay
- Cart icon với item count badge
- Mobile hamburger menu

### MegaMenu Component
- Desktop: Multi-column dropdown với hover
- Mobile: Accordion menu với expand/collapse
- Delay 200ms trước khi đóng để tránh rụng menu

### ProductCard Component
- Image với hover zoom effect
- Badge (New/Sale/Limited/Out of Stock)
- Quick View button trên hover
- Price với retail strike-through
- Financing estimate
- Add to Cart button

### Cart Store (Zustand)
- Add/remove/update items
- Calculate subtotal
- Persist to localStorage
- Get item count

## 🎯 Mock Data

- **40+ Products** với đầy đủ thông tin (name, brand, price, images, etc.)
- **Categories**: Woodwinds, Brasswinds, Percussion, Strings
- **Subcategories**: Flutes, Clarinets, Saxophones, Trumpets, etc.
- **8 Promo Banners** cho home page
- **6 Featured Collections**

## 🐛 Known Issues / TODOs

1. **Product Images**: Đang dùng placeholder images. Cần thay bằng real images.
2. **Search**: Chưa có debounce, có thể optimize performance.
3. **Filters**: Chưa có URL params để share/bookmark filtered results.
4. **Checkout**: Chưa có real payment integration, chỉ là mock flow.
5. **Account**: Login/Register chưa có backend integration.
6. **Reviews**: Chưa có real review system, chỉ hiển thị mock data.
7. **SEO**: Cần thêm meta tags và schema.org markup.
8. **Accessibility**: Cần test keyboard navigation và screen readers.
9. **Performance**: Cần optimize images với next/image và lazy loading.
10. **Mobile Menu**: Cần thêm animation và backdrop blur.

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📝 Notes

- Cart state được persist trong localStorage, sẽ tự động restore khi reload page
- Product images đang dùng placeholder URLs, cần thay bằng real images
- Checkout flow là mock, không có real payment processing
- Responsive design đã được implement nhưng cần test trên real devices

## 🎨 Design System

- Colors: Primary (#0066CC), Accent (#00A8A8), Semantic colors
- Typography: Inter font family
- Spacing: 4px base unit system
- Border Radius: 8px (md), 12px (lg), 16px (xl)
- Shadows: 5 levels từ xs đến xl

## 📞 Support

Nếu có vấn đề khi chạy project, kiểm tra:
1. Node.js version (cần >= 18)
2. Dependencies đã install đầy đủ
3. Port 3000 không bị chiếm
4. TypeScript errors trong terminal

