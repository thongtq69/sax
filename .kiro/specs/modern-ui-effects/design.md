# Design Document: Modern UI Effects

## Overview

Thiết kế hệ thống hiệu ứng UI hiện đại cho website James Sax Corner, tập trung vào trải nghiệm người dùng mượt mà và chuyên nghiệp.

## Architecture

```
Animation System
├── CSS Keyframes & Utilities (globals.css)
├── React Hooks
│   ├── useReducedMotion
│   ├── useTiltEffect
│   ├── useRippleEffect
│   ├── useScrollAnimation
│   └── useCursorSpotlight
└── Enhanced Components
    ├── Button (ripple, scale, loading states)
    ├── ProductCard (tilt, shine, gradient border)
    ├── Modal (scale animation, backdrop blur)
    ├── Navigation (scroll-based header, menu animations)
    └── Form Inputs (focus glow, floating labels)
```

## Components and Interfaces

### Animation Hooks

```typescript
// useReducedMotion - Detect prefers-reduced-motion
function useReducedMotion(): boolean

// useTiltEffect - 3D tilt following cursor
function useTiltEffect(options?: { maxTilt?: number; scale?: number }): {
  ref: RefObject<HTMLElement>
  style: CSSProperties
}

// useRippleEffect - Click ripple animation
function useRippleEffect(): {
  ripples: Ripple[]
  createRipple: (e: MouseEvent) => void
}

// useScrollAnimation - Scroll-triggered animations
function useScrollAnimation(options?: { threshold?: number }): {
  ref: RefObject<HTMLElement>
  isVisible: boolean
}
```

## Correctness Properties

### Property 1: Glassmorphism Elements Have Blur Effect
*For any* UI element with glassmorphism class, backdrop-filter blur SHALL be applied.
**Validates: Requirements 1.1, 1.2**

### Property 2: Button Hover Scale Within Range
*For any* button in hover state, scale SHALL be between 1.02 and 1.05.
**Validates: Requirements 2.1**

### Property 3: Ripple Effect at Click Position
*For any* button click at (x, y), ripple center SHALL be within 5px of click point.
**Validates: Requirements 2.2**

### Property 4: Loading State Shows Spinner
*For any* button with isLoading=true, spinner element SHALL be rendered.
**Validates: Requirements 2.3**

### Property 5: Tilt Effect Follows Cursor
*For any* card with tilt enabled, transform SHALL be proportional to cursor offset.
**Validates: Requirements 3.1**

### Property 6: Scroll Animation on Intersection
*For any* scroll-reveal element intersecting viewport, visible class SHALL be added.
**Validates: Requirements 4.1, 4.2**

### Property 7: Reduced Motion Respected
*For any* animation when prefers-reduced-motion is set, animation SHALL be disabled.
**Validates: Requirements 4.4**

## Testing Strategy

- Unit tests for hook return values
- Property tests for animation behaviors
- Visual regression tests for effects
- Accessibility tests for reduced motion
