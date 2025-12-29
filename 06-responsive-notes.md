# Notes Triển Khai Responsive

## Breakpoints

```
Mobile:     < 768px   (1 column, stacked)
Tablet:     768px - 1023px   (2 columns, simplified)
Desktop:    ≥ 1024px   (full layout, multi-column)
Large:      ≥ 1280px   (max-width container)
```

---

## 1. Header & Navigation

### Desktop (≥ 1024px)
- **Layout**: Horizontal navigation bar, logo left, menu center, search/cart right
- **Mega Menu**: Hover-activated, multi-column dropdown (4 columns max)
- **Height**: 80px
- **Search**: Icon → Click expands to full-width search bar
- **Cart**: Dropdown menu on hover/click

### Tablet (768px - 1023px)
- **Layout**: Logo center, hamburger menu left, search/cart right
- **Mega Menu**: Hamburger → Slide-out menu (left side)
- **Height**: 72px
- **Search**: Icon → Full-screen overlay
- **Cart**: Drawer sidebar (right side)

### Mobile (< 768px)
- **Layout**: Hamburger + Logo + Cart/Search icons
- **Height**: 64px
- **Mega Menu**: Hamburger → Full-screen overlay với accordion menu
- **Search**: Icon → Full-screen overlay với keyboard-friendly input
- **Cart**: Bottom drawer hoặc full-screen overlay

**Implementation Notes:**
- Sticky header trên tất cả breakpoints
- Mega menu delay 200ms trước khi đóng (desktop)
- Mobile menu: Backdrop overlay, close on outside click
- Search: Focus input khi mở, clear button visible

---

## 2. Hero Section

### Desktop (≥ 1024px)
- **Height**: 500px
- **Layout**: Text overlay box left-aligned hoặc centered (max-width 600px)
- **Image**: Background image, full-width
- **CTAs**: 3 buttons horizontal (hoặc 2 buttons + 1 below)
- **Typography**: H1 48px, body 18px

### Tablet (768px - 1023px)
- **Height**: 400px
- **Layout**: Text overlay centered, max-width 90%
- **CTAs**: Stacked buttons (full-width hoặc 2 columns)
- **Typography**: H1 36px, body 16px

### Mobile (< 768px)
- **Height**: 350px
- **Layout**: Text overlay full-width (padding 20px)
- **CTAs**: Stacked buttons, full-width
- **Typography**: H1 30px, body 16px
- **Image**: Crop/zoom để focus vào subject

**Implementation Notes:**
- Background image: Use `object-fit: cover` với `object-position: center`
- Text overlay: Background white với opacity 0.9-0.95, padding 24px
- CTAs: Touch-friendly (min-height 44px)
- Lazy load hero image (below-the-fold optimization)

---

## 3. Featured Products Grid

### Desktop (≥ 1024px)
- **Columns**: 4 columns
- **Gap**: 24px
- **Card**: Aspect ratio 1:1 image, padding 16px
- **Quick View**: Hover overlay button
- **Typography**: Title 16px, price 18px

### Tablet (768px - 1023px)
- **Columns**: 2 columns
- **Gap**: 20px
- **Card**: Same structure, slightly larger padding
- **Quick View**: Tap to open (no hover)
- **Typography**: Title 16px, price 18px

### Mobile (< 768px)
- **Columns**: 1 column (full-width)
- **Gap**: 16px
- **Card**: Full-width, image 100% width
- **Quick View**: Tap to open modal
- **Typography**: Title 16px, price 18px
- **CTA**: Full-width button

**Implementation Notes:**
- Use CSS Grid với `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))`
- Product images: Lazy load với `loading="lazy"`
- Skeleton loader khi loading
- Touch targets: Min 44x44px (Apple HIG)

---

## 4. Category Listing Page (PLP)

### Desktop (≥ 1024px)
- **Layout**: Sidebar filters (280px) + Product grid (flex-grow)
- **Filters**: Always visible sidebar, accordion sections
- **Product Grid**: 3 columns
- **Sort**: Dropdown top-right
- **Pagination**: Numbered pages

### Tablet (768px - 1023px)
- **Layout**: Filters button → Bottom sheet overlay
- **Filters**: Bottom sheet (max-height 80vh), accordion
- **Product Grid**: 2 columns
- **Sort**: Dropdown top
- **Pagination**: Numbered pages (fewer visible)

### Mobile (< 768px)
- **Layout**: Stacked (filters button + grid)
- **Filters**: Bottom sheet (full-height), sticky "Apply" button
- **Product Grid**: 1 column
- **Sort**: Full-width dropdown
- **Pagination**: Simplified (Previous/Next + page count)

**Implementation Notes:**
- Filters: Sticky sidebar trên desktop, bottom sheet mobile
- Product cards: Same component, responsive grid
- Filter state: URL params để share/bookmark
- Infinite scroll option (mobile-friendly alternative)

---

## 5. Product Detail Page (PDP)

### Desktop (≥ 1024px)
- **Layout**: 60/40 split (Gallery left, Info right)
- **Gallery**: Main image 800x800px, thumbnails 4-6 visible
- **Info**: Sticky sidebar (scrolls với content)
- **Tabs**: Horizontal tabs below gallery/info
- **Cross-sell**: 4 columns

### Tablet (768px - 1023px)
- **Layout**: Stacked (Gallery top, Info below)
- **Gallery**: Full-width, thumbnails scrollable horizontal
- **Info**: Full-width
- **Tabs**: Horizontal tabs, scrollable nếu nhiều tabs
- **Cross-sell**: 2 columns

### Mobile (< 768px)
- **Layout**: Stacked, full-width
- **Gallery**: Full-width, swipeable carousel
- **Info**: Full-width, padding 16px
- **Add to Cart**: Sticky bottom bar (fixed position)
- **Tabs**: Horizontal scrollable tabs
- **Cross-sell**: 1 column (hoặc 2 columns nếu màn hình đủ rộng)

**Implementation Notes:**
- Image zoom: Disable trên mobile (use swipe instead)
- Sticky CTA: Fixed bottom bar mobile (z-index cao)
- Tabs: Scrollable nếu overflow
- Gallery: Swipe gestures cho mobile carousel

---

## 6. Cart Page

### Desktop (≥ 1024px)
- **Layout**: 70/30 split (Items left, Summary right)
- **Items**: List với image + details side-by-side
- **Summary**: Sticky sidebar
- **Actions**: Inline buttons

### Tablet (768px - 1023px)
- **Layout**: Stacked (Items top, Summary bottom)
- **Items**: List, image + details stacked
- **Summary**: Sticky bottom bar hoặc collapsible section
- **Actions**: Full-width buttons

### Mobile (< 768px)
- **Layout**: Stacked, full-width
- **Items**: List, compact layout
- **Summary**: Sticky bottom bar (fixed)
- **Actions**: Full-width buttons
- **Quantity**: Touch-friendly +/- buttons

**Implementation Notes:**
- Summary: Sticky trên desktop, bottom bar mobile
- Empty cart: Centered message với CTA
- Quantity controls: Larger touch targets (48x48px)

---

## 7. Checkout Flow

### Desktop (≥ 1024px)
- **Layout**: 60/40 split (Form left, Summary right)
- **Steps**: Horizontal progress bar top
- **Form**: Multi-column inputs (First/Last name cùng row)
- **Summary**: Sticky sidebar

### Tablet (768px - 1023px)
- **Layout**: Stacked (Form top, Summary collapsible)
- **Steps**: Horizontal progress bar (compact)
- **Form**: Single column inputs
- **Summary**: Collapsible section hoặc sticky bottom

### Mobile (< 768px)
- **Layout**: Stacked, full-width
- **Steps**: Horizontal progress bar (simplified icons)
- **Form**: Single column, full-width inputs
- **Summary**: Collapsible section, expand để review
- **CTAs**: Sticky bottom bar

**Implementation Notes:**
- Progress bar: Show step numbers + labels (desktop), icons only (mobile)
- Form validation: Real-time, error messages below fields
- Auto-fill: Support address autocomplete
- Payment: Secure iframe cho credit card input

---

## 8. Account Pages

### Desktop (≥ 1024px)
- **Layout**: Sidebar nav (200px) + Content (flex-grow)
- **Navigation**: Vertical sidebar với icons + labels
- **Content**: Full-width, max-width 800px centered

### Tablet (768px - 1023px)
- **Layout**: Top nav tabs + Content
- **Navigation**: Horizontal tabs (scrollable nếu nhiều)
- **Content**: Full-width

### Mobile (< 768px)
- **Layout**: Hamburger menu + Content
- **Navigation**: Drawer menu (left side)
- **Content**: Full-width, padding 16px

**Implementation Notes:**
- Navigation: Consistent across pages
- Forms: Full-width inputs, larger touch targets
- Tables: Scrollable horizontal nếu cần (order history)

---

## 9. Mega Menu

### Desktop (≥ 1024px)
- **Trigger**: Hover trên nav item
- **Layout**: Multi-column dropdown (2-4 columns tùy category)
- **Position**: Below nav item, full-width container
- **Animation**: Fade in + slide down (150ms)
- **Delay**: 200ms trước khi đóng (tránh rụng menu)

### Tablet (768px - 1023px)
- **Trigger**: Tap hamburger → Slide-out menu
- **Layout**: Accordion menu, full-height sidebar
- **Animation**: Slide in từ left (300ms)
- **Nested**: Indent 16px, expand/collapse

### Mobile (< 768px)
- **Trigger**: Tap hamburger → Full-screen overlay
- **Layout**: Accordion menu, full-screen
- **Animation**: Fade in overlay (200ms)
- **Nested**: Indent 16px, expand/collapse
- **Close**: X button top-right, tap outside để đóng

**Implementation Notes:**
- Hover delay: Use `setTimeout` để delay close (desktop)
- Touch: Tap để toggle (mobile/tablet)
- Keyboard: Tab navigation, Enter/Space để expand
- Focus trap: Khi menu mở, trap focus trong menu

---

## 10. Modals & Overlays

### Quick View Modal

**Desktop:**
- **Size**: Max-width 900px, centered
- **Backdrop**: Dark overlay (opacity 0.5)
- **Close**: X button top-right, click backdrop

**Tablet:**
- **Size**: Max-width 90%, max-height 90vh
- **Backdrop**: Same
- **Close**: X button, swipe down để đóng (optional)

**Mobile:**
- **Size**: Full-screen hoặc 95% width/height
- **Backdrop**: Same
- **Close**: X button, swipe down để đóng

**Implementation Notes:**
- Focus trap: Tab navigation chỉ trong modal
- ESC key: Close modal
- Scroll lock: Prevent body scroll khi modal mở
- Animation: Fade in + scale (250ms)

---

## 11. Forms

### Input Fields

**All Breakpoints:**
- **Height**: 44px (touch-friendly minimum)
- **Padding**: 12px 16px
- **Border**: 1px solid (2px khi focus)
- **Font size**: 16px (tránh zoom trên iOS)

**Mobile-specific:**
- **Full-width**: Trừ khi có 2 fields cùng row (First/Last name)
- **Auto-capitalize**: Off cho email, on cho name
- **Input type**: Use proper types (email, tel, number)

**Implementation Notes:**
- Labels: Above inputs (không placeholder-only)
- Error messages: Below inputs, red text + icon
- Success: Green checkmark icon
- Required: Asterisk (*) sau label

---

## 12. Typography Scaling

### Headings

**Desktop:**
- H1: 48px (hero), 36px (page title)
- H2: 30px
- H3: 24px
- H4: 20px

**Tablet:**
- H1: 36px (hero), 30px (page title)
- H2: 28px
- H3: 22px
- H4: 18px

**Mobile:**
- H1: 30px (hero), 24px (page title)
- H2: 24px
- H3: 20px
- H4: 18px

**Body Text:**
- Desktop: 16px (base), 18px (emphasized)
- Tablet: 16px
- Mobile: 16px (không nhỏ hơn để tránh zoom)

**Implementation Notes:**
- Use `clamp()` cho fluid typography
- Line height: 1.5 cho body, 1.2 cho headings
- Max line length: 65-75 characters cho readability

---

## 13. Spacing & Padding

### Container Padding

**Desktop:**
- Horizontal: 32px (hoặc 2rem)
- Section spacing: 64px vertical

**Tablet:**
- Horizontal: 24px (hoặc 1.5rem)
- Section spacing: 48px vertical

**Mobile:**
- Horizontal: 16px (hoặc 1rem)
- Section spacing: 32px vertical

### Component Padding

**Cards:**
- Desktop: 24px
- Tablet: 20px
- Mobile: 16px

**Buttons:**
- Desktop: 12px 24px
- Tablet: 12px 20px
- Mobile: 12px 16px (min-height 44px)

---

## 14. Images & Media

### Product Images

**Desktop:**
- Main image: 800x800px (1:1 ratio)
- Thumbnails: 100x100px
- Grid cards: 400x400px

**Tablet:**
- Main image: 600x600px
- Thumbnails: 80x80px
- Grid cards: Full-width (aspect ratio 1:1)

**Mobile:**
- Main image: Full-width (aspect ratio 1:1)
- Thumbnails: 60x60px
- Grid cards: Full-width

**Implementation Notes:**
- Use `srcset` và `sizes` cho responsive images
- Format: WebP với fallback JPEG
- Lazy load: Below-the-fold images
- Aspect ratio: Use `aspect-ratio` CSS property

---

## 15. Touch Targets

### Minimum Sizes

**All Interactive Elements:**
- Minimum: 44x44px (Apple HIG)
- Preferred: 48x48px
- Spacing: 8px giữa các targets

**Specific Elements:**
- Buttons: 44px height minimum
- Checkboxes/Radios: 44x44px touch area (visual có thể nhỏ hơn)
- Links: 44px height (padding top/bottom)
- Menu items: 48px height

**Implementation Notes:**
- Use padding để tăng touch area (không chỉ visual size)
- Test trên real devices
- Hover states: Disable trên touch devices (use `@media (hover: hover)`)

---

## 16. Performance Optimizations

### Mobile-Specific

1. **Images:**
   - Lazy load below-the-fold
   - Use WebP/AVIF formats
   - Responsive images với `srcset`

2. **JavaScript:**
   - Code splitting
   - Lazy load non-critical JS
   - Debounce scroll/resize handlers

3. **CSS:**
   - Critical CSS inline
   - Defer non-critical CSS
   - Use `will-change` sparingly

4. **Fonts:**
   - Preload critical fonts
   - Use `font-display: swap`
   - Subset fonts nếu có thể

5. **Animations:**
   - Prefer `transform` và `opacity`
   - Use `will-change` cho animated elements
   - Respect `prefers-reduced-motion`

**Implementation Notes:**
- Target: Lighthouse score 90+ trên mobile
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Test trên slow 3G connection

---

## 17. Accessibility (Responsive Considerations)

### Mobile

1. **Touch:**
   - Large touch targets (44x44px minimum)
   - Adequate spacing between interactive elements
   - Swipe gestures cho carousels/galleries

2. **Screen Readers:**
   - Proper ARIA labels
   - Skip links
   - Focus management trong modals

3. **Keyboard:**
   - Tab navigation
   - Focus indicators visible
   - Keyboard shortcuts (ESC để đóng modal)

### All Breakpoints

1. **Color Contrast:**
   - WCAG AA minimum (4.5:1 cho text)
   - Don't rely chỉ on color để convey information

2. **Text:**
   - Scalable text (không fixed px)
   - Readable font sizes (16px minimum)

3. **Focus:**
   - Visible focus indicators
   - Logical tab order

---

## 18. Testing Checklist

### Devices to Test

**Mobile:**
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S21 (360px)
- Pixel 5 (393px)

**Tablet:**
- iPad (768px)
- iPad Pro (1024px)
- Surface Pro (912px)

**Desktop:**
- 1280px
- 1440px
- 1920px

### Browsers

- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Test Scenarios

1. Navigation: Mega menu, mobile menu
2. Product browsing: Grid, filters, pagination
3. Product detail: Gallery, variants, add to cart
4. Cart: Quantity, remove, checkout
5. Checkout: Form validation, payment
6. Search: Autocomplete, results
7. Modals: Quick view, filters
8. Forms: Validation, submission

---

## 19. Common Responsive Patterns

### Container Queries (Future-proof)

```css
/* When container is wide enough */
@container (min-width: 768px) {
  .product-card {
    grid-template-columns: 1fr 2fr;
  }
}
```

### Flexbox Grid

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

### Mobile-First Approach

```css
/* Mobile first */
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

---

## 20. Implementation Priority

### Phase 1: Core Layout
1. Header & Navigation (all breakpoints)
2. Home page layout
3. Product grid (responsive)
4. Footer

### Phase 2: Key Pages
1. Category listing (PLP)
2. Product detail (PDP)
3. Cart
4. Checkout

### Phase 3: Enhancements
1. Modals (Quick view, filters)
2. Search functionality
3. Account pages
4. Animations & micro-interactions

### Phase 4: Optimization
1. Performance tuning
2. Accessibility improvements
3. Cross-browser testing
4. User testing & refinements

---

## Summary

**Key Principles:**
1. **Mobile-first**: Design cho mobile trước, scale up
2. **Touch-friendly**: Minimum 44x44px touch targets
3. **Performance**: Optimize images, lazy load, code split
4. **Accessibility**: WCAG AA, keyboard navigation, screen readers
5. **Progressive Enhancement**: Core functionality works everywhere, enhance với JS/CSS

**Breakpoint Strategy:**
- Use `min-width` media queries (mobile-first)
- Test trên real devices, không chỉ browser resize
- Consider content breakpoints, không chỉ screen size

**Common Issues to Avoid:**
- Fixed widths (use max-width instead)
- Horizontal scroll (trừ khi intentional)
- Tiny touch targets
- Hover-only interactions (mobile needs tap)
- Heavy images không optimized
- JavaScript blocking render

