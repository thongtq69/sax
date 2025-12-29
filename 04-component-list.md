# Component List & States

## 1. Buttons

### Primary Button
**States:**
- Default: Background `--color-primary`, text white, shadow `--shadow-sm`
- Hover: Background `--color-primary-dark`, shadow `--shadow-md`, transform scale(1.02)
- Active: Background `--color-primary-dark`, shadow `--shadow-xs`
- Disabled: Background `--color-gray-300`, cursor not-allowed, opacity 0.6
- Loading: Spinner icon, disabled state

**Variants:**
- Size: `sm` (36px), `md` (44px), `lg` (52px)
- Full-width: `w-full` class
- Icon: Left/right icon support

**Usage:**
- CTAs chính: "Add to Cart", "Proceed to Checkout", "Call an Expert"
- Hero CTAs, form submissions

### Secondary Button
**States:**
- Default: Border `--color-primary`, text `--color-primary`, background transparent
- Hover: Background `--color-primary-light`, border `--color-primary-dark`
- Active: Background `--color-primary-50`
- Disabled: Border `--color-gray-300`, text `--color-gray-400`

**Usage:**
- "Select Options", "Continue Shopping", "Learn More"

### Ghost Button
**States:**
- Default: Text `--color-primary`, no border/background
- Hover: Background `--color-gray-100`
- Active: Background `--color-gray-200`

**Usage:**
- "Quick View", "Edit", "Remove", navigation links

### Icon Button
**States:**
- Default: Icon only, square/circle shape
- Hover: Background `--color-gray-100`
- Active: Background `--color-gray-200`

**Usage:**
- Search icon, cart icon, wishlist icon, close modal

---

## 2. Badges

### Badge Types
- **New**: Background `--color-info`, text white
- **Sale**: Background `--color-warning`, text white
- **Limited**: Background `--color-accent`, text white
- **Coming Soon**: Background `--color-gray-500`, text white
- **Out of Stock**: Background `--color-error`, text white
- **In Stock**: Background `--color-success`, text white

**States:**
- Default: Small text (12px), padding 4px 8px, border-radius `--radius-sm`
- Position: Top-right corner của product card

---

## 3. Product Card

### Structure
```
┌─────────────────────┐
│ [Badge]      [Quick │
│              View]  │
│                     │
│    [Product Image]  │
│                     │
│  Product Name       │
│  (2 lines max)      │
│                     │
│  $XXX.XX            │
│  $YYY.XX (strike)   │
│                     │
│  Financing: $X/mo   │
│                     │
│  [Add to Cart]      │
└─────────────────────┘
```

### States
- **Default**: Border `--color-gray-200`, shadow `--shadow-sm`
- **Hover**: Shadow `--shadow-md`, transform translateY(-4px), image zoom
- **Loading**: Skeleton loader (shimmer effect)
- **Out of Stock**: Opacity 0.7, disabled CTA

### Variants
- Grid card (4 columns desktop)
- List card (horizontal layout, PLP alternative view)
- Compact card (smaller, for cross-sell)

---

## 4. Mega Menu

### Structure (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│ [Woodwinds ▼]                                                │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ Column 1 │ Column 2 │ Column 3 │ Column 4 │              │
│ │          │          │          │          │              │
│ │ • Flutes │ • Mouth- │ • Reeds  │ • Sax    │              │
│ │ • Clarin │   pieces │ • Cases  │   Necks  │              │
│ │ • Sax    │ • Ligat- │ • BAM    │          │              │
│ │          │   ures   │   Cases  │          │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### States
- **Closed**: Hidden (opacity 0, visibility hidden)
- **Opening**: Fade in + slide down (150ms)
- **Open**: Opacity 1, visible, shadow `--shadow-lg`
- **Closing**: Fade out + slide up (150ms)
- **Hover delay**: 200ms delay trước khi đóng (tránh rụng menu)

### Mobile (Accordion)
- Hamburger menu → Full-screen overlay
- Accordion items: Expand/collapse với icon
- Nested items: Indent 16px

---

## 5. Search

### Search Icon (Header)
- Click → Expand to full-width search bar
- States: Default, Focus (expanded), Active (typing)

### Search Bar (Expanded)
- Full-width input với icon left, clear button right
- Autocomplete dropdown: Recent searches, suggestions, products
- States: Default, Focus, Typing, Results shown

### Search Results Page
- Filters sidebar
- Product grid
- "No results" state với suggestions

---

## 6. Cart Dropdown / Drawer

### Desktop Dropdown
```
┌─────────────────────┐
│ Cart ($XXX.XX)      │
├─────────────────────┤
│ [Image] Product     │
│ Qty: 1  $XXX.XX     │
│ [Remove]            │
├─────────────────────┤
│ Subtotal: $XXX.XX   │
│                     │
│ [View Cart]         │
│ [Checkout]          │
└─────────────────────┘
```

### Mobile Drawer
- Slide-in từ right
- Full-height sidebar
- Backdrop overlay
- Close button top-right

### States
- **Empty**: "No products in cart" message + "Start Shopping" CTA
- **Has Items**: List items + summary + CTAs
- **Loading**: Skeleton items

---

## 7. Quick View Modal

### Structure
```
┌─────────────────────────────────────────────────────────┐
│ [X]                                                      │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────────────────────────────────┐  │
│ │ [Image]  │ │ Product Name                          │  │
│ │          │ │ $XXX.XX                               │  │
│ │ [Thumbs] │ │                                       │  │
│ │          │ │ Variants:                             │  │
│ │          │ │ [Finish ▼] [Model ▼]                 │  │
│ │          │ │                                       │  │
│ │          │ │ [Add to Cart] [View Full Details]    │  │
│ └──────────┘ └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### States
- **Closed**: Hidden, opacity 0
- **Opening**: Fade in + scale up (250ms)
- **Open**: Opacity 1, backdrop blur
- **Closing**: Fade out + scale down (250ms)
- **Loading**: Skeleton loader trong modal

### Interactions
- Click backdrop → Close
- ESC key → Close
- Focus trap: Tab navigation chỉ trong modal

---

## 8. Forms

### Input Fields

**States:**
- Default: Border `--color-gray-200`, background white
- Focus: Border `--color-primary` (2px), shadow `--shadow-sm`
- Error: Border `--color-error`, error message below
- Success: Border `--color-success`, checkmark icon
- Disabled: Background `--color-gray-100`, cursor not-allowed

**Variants:**
- Text input
- Email input
- Password input (show/hide toggle)
- Number input (quantity)
- Select dropdown
- Textarea
- Search input

### Checkbox / Radio

**States:**
- Default: Border `--color-gray-300`
- Checked: Background `--color-primary`, border `--color-primary`
- Hover: Border `--color-primary-light`
- Disabled: Opacity 0.5

### Form Validation
- Real-time validation (on blur)
- Error messages: Red text, icon, below field
- Success indicators: Green checkmark
- Required field indicator: Asterisk (*)

---

## 9. Filters (Sidebar / Bottom Sheet)

### Desktop Sidebar
- Fixed left sidebar (280px width)
- Accordion sections: Brand, Price, Condition, etc.
- Checkboxes, radio buttons, range sliders
- "Clear All" button
- "Apply Filters" button (sticky bottom)

### Mobile Bottom Sheet
- Slide up từ bottom
- Full-width, max-height 80vh
- Backdrop overlay
- Header: "Filters" + "Clear All" + Close button
- Accordion filters
- Sticky footer: "Apply Filters" button

### States
- **Closed**: Hidden (translateY 100%)
- **Opening**: Slide up (300ms)
- **Open**: Visible
- **Closing**: Slide down (300ms)

---

## 10. Pagination

### Structure
```
[< Previous] [1] [2] [3] ... [7] [Next >]
```

### States
- **Default**: Number buttons, border, hover background
- **Active**: Background `--color-primary`, text white
- **Disabled**: Opacity 0.5, cursor not-allowed (Previous/Next khi ở đầu/cuối)
- **Hover**: Background `--color-gray-100`

### Variants
- Numbered pagination
- "Load More" button (infinite scroll alternative)
- "Showing X-Y of Z" text

---

## 11. Tabs

### Structure
```
[Description] [Specs] [What's Included] [Warranty] [Reviews] [Q&A]
────────────────────────────────────────────────────────────────────
[Tab Content Area]
```

### States
- **Default**: Text `--color-gray-500`, border-bottom transparent
- **Active**: Text `--color-primary`, border-bottom `--color-primary` (2px)
- **Hover**: Text `--color-primary-light`, background `--color-gray-50`

### Variants
- Horizontal tabs (PDP)
- Vertical tabs (Account page)

---

## 12. Accordion

### Structure
```
┌─────────────────────────────────────────┐
│ Section Title                    [▼]    │
├─────────────────────────────────────────┤
│ Content (expanded)                      │
│ Multiple lines of content...            │
└─────────────────────────────────────────┘
```

### States
- **Collapsed**: Content hidden, icon ▶
- **Expanded**: Content visible, icon ▼
- **Transition**: Height animation (300ms ease)

### Usage
- Mobile menu
- FAQ sections
- Filter sections
- Product specs

---

## 13. Toast / Notification

### Types
- **Success**: Green background, checkmark icon ("Added to cart!")
- **Error**: Red background, X icon ("Failed to add item")
- **Info**: Blue background, info icon ("Free shipping available")
- **Warning**: Yellow background, warning icon ("Low stock")

### States
- **Appearing**: Slide in từ top-right (300ms)
- **Visible**: Auto-dismiss sau 3-5s
- **Dismissing**: Fade out (200ms)

### Position
- Top-right corner (desktop)
- Top center (mobile)

---

## 14. Skeleton Loader

### Usage
- Product cards (grid)
- Product detail (gallery + info)
- Cart items
- Search results

### Animation
- Shimmer effect (gradient moving left to right)
- Duration: 1.5s, infinite loop

---

## 15. Breadcrumbs

### Structure
```
[Home] > [Shop] > [Woodwinds] > [Saxophones] > Current Page
```

### States
- **Link**: Text `--color-primary`, hover underline
- **Current**: Text `--color-gray-700`, font-weight medium
- **Separator**: `>` icon, color `--color-gray-400`

---

## 16. Rating / Reviews

### Star Rating
- 5 stars, filled/unfilled/half-filled
- Color: `--color-warning` (gold)
- Size: 16px (small), 20px (default), 24px (large)

### Review Card
- Avatar, name, date, rating, review text
- "Helpful" button
- Verified purchase badge

---

## 17. Financing Calculator

### Structure
```
┌─────────────────────────────────┐
│ Financing Available              │
│ Starting at $208/month          │
│ (12 mo @ 0% APR)                │
│                                  │
│ [Calculate Payment]              │
└─────────────────────────────────┘
```

### Modal (Expanded)
- Price input
- Term selector (12/24/36 months)
- APR display
- Monthly payment calculation
- "Apply Now" CTA

---

## 18. Trust Badges Strip

### Icons + Text
- 4 columns desktop, 2x2 mobile
- Icon (64x64px) + Title + Short description
- Hover: Slight scale up (1.05)

---

## 19. Promo Banner / Carousel

### Structure
- Image background (16:9 ratio)
- Text overlay box (white bg, 90% opacity, rounded)
- Title, description, valid date, CTA button

### Carousel Controls
- Previous/Next arrows
- Dot indicators
- Autoplay (5s interval)
- Pause on hover

### States
- **Default**: Visible
- **Hover**: Pause autoplay, show controls
- **Transition**: Fade + slide (500ms)

---

## 20. Cookie Consent

### Structure
```
┌─────────────────────────────────────────────────────────┐
│ We use cookies to enhance your experience.               │
│ [Accept] [Decline] [Learn More]                         │
└─────────────────────────────────────────────────────────┘
```

### States
- **Hidden**: Slide down (sau khi accept/decline)
- **Visible**: Fixed bottom, full-width bar
- **Sticky**: Remains until action

---

## Component States Summary

### Common States Across Components
1. **Default**: Initial state
2. **Hover**: Mouse over
3. **Focus**: Keyboard focus (accessibility)
4. **Active**: Clicked/pressed
5. **Disabled**: Not interactive
6. **Loading**: Async operation in progress
7. **Error**: Error state với message
8. **Success**: Success state với confirmation

### Animation Principles
- Duration: 150-300ms (fast interactions)
- Easing: `ease-out` cho most transitions
- Transform: Prefer transform/opacity over layout properties
- Will-change: Set cho animated properties
- Reduced motion: Respect `prefers-reduced-motion`

