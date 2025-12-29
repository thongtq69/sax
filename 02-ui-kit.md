# UI Kit - Design System

## 1. Colors (Color Tokens)

### Primary Brand Colors
```
--color-primary: #0066CC          // Xanh dương chính (trust, professional)
--color-primary-dark: #004499     // Hover/active states
--color-primary-light: #E6F2FF    // Background nhẹ, highlights
--color-primary-50: #F0F7FF       // Subtle backgrounds
```

### Secondary & Accent
```
--color-accent: #00A8A8           // Teal accent (modern, fresh)
--color-accent-dark: #008080      // Hover states
--color-accent-light: #E0F5F5     // Light backgrounds
```

### Neutral Palette
```
--color-white: #FFFFFF
--color-gray-50: #FAFAFA          // Background chính
--color-gray-100: #F5F5F5         // Subtle dividers
--color-gray-200: #E5E5E5         // Borders nhẹ
--color-gray-300: #CCCCCC         // Disabled states
--color-gray-400: #999999         // Placeholder text
--color-gray-500: #666666         // Secondary text
--color-gray-700: #333333         // Primary text
--color-gray-900: #1A1A1A         // Headings, strong emphasis
```

### Semantic Colors
```
--color-success: #10B981          // Success states, in stock
--color-success-light: #D1FAE5
--color-warning: #F59E0B          // Sale badges, limited stock
--color-warning-light: #FEF3C7
--color-error: #EF4444            // Error states, out of stock
--color-error-light: #FEE2E2
--color-info: #3B82F6             // Info messages
--color-info-light: #DBEAFE
```

### Text Colors
```
--color-text-primary: #1A1A1A     // Headings, body text chính
--color-text-secondary: #666666   // Mô tả, metadata
--color-text-tertiary: #999999   // Placeholder, captions
--color-text-inverse: #FFFFFF     // Text trên nền tối
--color-text-link: #0066CC        // Links
--color-text-link-hover: #004499  // Link hover
```

### Background Colors
```
--color-bg-primary: #FFFFFF       // Main background
--color-bg-secondary: #FAFAFA     // Section backgrounds
--color-bg-tertiary: #F5F5F5      // Card backgrounds, hover states
--color-bg-overlay: rgba(0, 0, 0, 0.5)  // Modal overlays
```

## 2. Typography

### Font Family
```
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-heading: 'Inter', sans-serif  // Có thể dùng font khác cho headings nếu cần
--font-mono: 'SF Mono', 'Monaco', monospace  // Cho SKU, codes
```

### Font Sizes (Type Scale)
```
--font-size-xs: 0.75rem      // 12px - Captions, labels nhỏ
--font-size-sm: 0.875rem     // 14px - Secondary text, metadata
--font-size-base: 1rem       // 16px - Body text (base)
--font-size-lg: 1.125rem     // 18px - Emphasized body
--font-size-xl: 1.25rem      // 20px - Small headings
--font-size-2xl: 1.5rem      // 24px - H3, section titles
--font-size-3xl: 1.875rem    // 30px - H2
--font-size-4xl: 2.25rem      // 36px - H1 (mobile)
--font-size-5xl: 3rem         // 48px - H1 (desktop hero)
```

### Font Weights
```
--font-weight-light: 300
--font-weight-normal: 400     // Body text
--font-weight-medium: 500     // Emphasized text, buttons
--font-weight-semibold: 600   // Headings, CTAs
--font-weight-bold: 700       // Strong emphasis
```

### Line Heights
```
--line-height-tight: 1.2      // Headings
--line-height-normal: 1.5     // Body text
--line-height-relaxed: 1.75   // Long-form content
```

### Letter Spacing
```
--letter-spacing-tight: -0.02em   // Headings
--letter-spacing-normal: 0        // Body
--letter-spacing-wide: 0.05em     // Uppercase labels
```

## 3. Spacing System

### Base Unit: 4px (0.25rem)

```
--spacing-0: 0
--spacing-1: 0.25rem    // 4px
--spacing-2: 0.5rem     // 8px
--spacing-3: 0.75rem    // 12px
--spacing-4: 1rem       // 16px - Base spacing
--spacing-5: 1.25rem    // 20px
--spacing-6: 1.5rem     // 24px
--spacing-8: 2rem       // 32px
--spacing-10: 2.5rem    // 40px
--spacing-12: 3rem      // 48px
--spacing-16: 4rem      // 64px
--spacing-20: 5rem      // 80px
--spacing-24: 6rem      // 96px
```

### Component Spacing
```
--spacing-section: 4rem        // Khoảng cách giữa các section lớn (desktop)
--spacing-section-mobile: 2.5rem  // Mobile
--spacing-card-padding: 1.5rem  // Padding trong card
--spacing-button-padding-x: 1.5rem  // Button horizontal padding
--spacing-button-padding-y: 0.75rem  // Button vertical padding
```

## 4. Border Radius

```
--radius-sm: 4px        // Small elements (badges, chips)
--radius-md: 8px        // Buttons, inputs
--radius-lg: 12px       // Cards, modals
--radius-xl: 16px       // Large cards, hero sections
--radius-full: 9999px   // Pills, avatars
```

## 5. Shadows

```
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)
```

### Usage:
- `--shadow-xs`: Subtle separators
- `--shadow-sm`: Cards, dropdowns
- `--shadow-md`: Modals, popovers
- `--shadow-lg`: Sticky headers, elevated modals
- `--shadow-xl`: Hero overlays

## 6. Layout & Grid

### Container
```
--container-max-width: 1320px     // Max width content
--container-padding-x: 1.5rem     // Horizontal padding (mobile)
--container-padding-x-desktop: 2rem  // Desktop
```

### Grid System
```
--grid-columns: 12                // 12-column grid
--grid-gap: 1.5rem                // Gap giữa columns
--grid-gap-mobile: 1rem           // Mobile gap
```

### Breakpoints
```
--breakpoint-sm: 640px    // Small tablets
--breakpoint-md: 768px    // Tablets
--breakpoint-lg: 1024px   // Desktop
--breakpoint-xl: 1280px   // Large desktop
--breakpoint-2xl: 1536px  // Extra large
```

## 7. Z-Index Scale

```
--z-base: 0
--z-dropdown: 1000
--z-sticky: 1020
--z-fixed: 1030
--z-modal-backdrop: 1040
--z-modal: 1050
--z-popover: 1060
--z-tooltip: 1070
```

## 8. Transitions & Animations

### Duration
```
--duration-fast: 150ms      // Micro-interactions
--duration-normal: 250ms    // Standard transitions
--duration-slow: 350ms      // Complex animations
```

### Easing
```
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

### Usage Examples
```css
/* Button hover */
transition: background-color var(--duration-fast) var(--ease-out);

/* Modal open */
transition: opacity var(--duration-normal) var(--ease-in-out),
            transform var(--duration-normal) var(--ease-in-out);

/* Mega menu */
transition: opacity var(--duration-fast) var(--ease-out),
            visibility var(--duration-fast) var(--ease-out);
```

## 9. Form Elements

### Input Heights
```
--input-height-sm: 36px
--input-height-md: 44px      // Standard
--input-height-lg: 52px      // Large inputs
```

### Input Styles
```
--input-border: 1px solid var(--color-gray-200)
--input-border-focus: 2px solid var(--color-primary)
--input-border-error: 2px solid var(--color-error)
--input-border-radius: var(--radius-md)
--input-padding-x: 1rem
--input-padding-y: 0.75rem
```

## 10. Component-Specific Tokens

### Header
```
--header-height: 80px           // Desktop
--header-height-mobile: 64px    // Mobile
--header-bg: var(--color-white)
--header-shadow: var(--shadow-sm)
```

### Product Card
```
--card-border-radius: var(--radius-lg)
--card-padding: var(--spacing-4)
--card-hover-shadow: var(--shadow-md)
```

### Badge
```
--badge-font-size: var(--font-size-xs)
--badge-padding-x: var(--spacing-2)
--badge-padding-y: var(--spacing-1)
--badge-border-radius: var(--radius-sm)
```

### Button
```
--button-height-md: 44px
--button-height-lg: 52px
--button-font-weight: var(--font-weight-medium)
--button-border-radius: var(--radius-md)
```

