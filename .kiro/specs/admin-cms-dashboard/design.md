# Design Document: Admin CMS Dashboard

## Overview

Hệ thống Admin CMS Dashboard cho phép quản trị viên quản lý toàn bộ nội dung website thông qua giao diện trực quan. Hệ thống sử dụng Next.js App Router, Prisma ORM với MongoDB, và React components với Tailwind CSS.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  /admin/                                                     │
│  ├── page.tsx (Dashboard Overview)                          │
│  ├── banners/page.tsx (Banner Management)                   │
│  ├── faqs/page.tsx (FAQ Management)                         │
│  ├── testimonials/page.tsx (Testimonials Management)        │
│  ├── settings/page.tsx (Site Settings)                      │
│  └── content/page.tsx (Homepage Content)                    │
├─────────────────────────────────────────────────────────────┤
│                      API Routes                              │
│  /api/admin/                                                 │
│  ├── banners/route.ts                                       │
│  ├── faqs/route.ts                                          │
│  ├── testimonials/route.ts                                  │
│  ├── settings/route.ts                                      │
│  └── content/route.ts                                       │
├─────────────────────────────────────────────────────────────┤
│                    Database (MongoDB)                        │
│  Collections: Banner, FAQ, Testimonial, SiteSettings,       │
│               HomepageContent                                │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Admin Layout Component

```typescript
// components/admin/AdminLayout.tsx
interface AdminLayoutProps {
  children: React.ReactNode
}

// Sidebar navigation items
const navItems = [
  { href: '/admin', icon: 'LayoutDashboard', label: 'Dashboard' },
  { href: '/admin/banners', icon: 'Image', label: 'Banners' },
  { href: '/admin/faqs', icon: 'HelpCircle', label: 'FAQs' },
  { href: '/admin/testimonials', icon: 'MessageSquare', label: 'Testimonials' },
  { href: '/admin/settings', icon: 'Settings', label: 'Site Settings' },
  { href: '/admin/content', icon: 'FileText', label: 'Homepage Content' },
]
```

### Banner Management

```typescript
// Types
interface Banner {
  id: string
  title: string
  subtitle?: string
  image: string
  link?: string
  buttonText?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// API Endpoints
GET    /api/admin/banners      - List all banners
POST   /api/admin/banners      - Create banner
PUT    /api/admin/banners/:id  - Update banner
DELETE /api/admin/banners/:id  - Delete banner
PATCH  /api/admin/banners/:id/toggle - Toggle active status
PUT    /api/admin/banners/reorder - Update banner order
```

### FAQ Management

```typescript
interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// API Endpoints
GET    /api/admin/faqs         - List all FAQs
POST   /api/admin/faqs         - Create FAQ
PUT    /api/admin/faqs/:id     - Update FAQ
DELETE /api/admin/faqs/:id     - Delete FAQ
```

### Testimonial Management

```typescript
interface Testimonial {
  id: string
  authorName: string
  message: string
  rating: number // 1-5
  productName?: string
  date: Date
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
}

// API Endpoints
GET    /api/admin/testimonials         - List all testimonials
POST   /api/admin/testimonials         - Create testimonial
PUT    /api/admin/testimonials/:id     - Update testimonial
DELETE /api/admin/testimonials/:id     - Delete testimonial
PATCH  /api/admin/testimonials/:id/toggle - Toggle visibility
```

### Site Settings

```typescript
interface SiteSettings {
  id: string
  companyName: string
  address: string
  phone: string
  email: string
  workingHours: string
  socialLinks: {
    facebook?: string
    youtube?: string
    instagram?: string
    twitter?: string
  }
  footerText: string
  copyrightText: string
  updatedAt: Date
}

// API Endpoints
GET  /api/admin/settings - Get settings
PUT  /api/admin/settings - Update settings
```

### Homepage Content

```typescript
interface HomepageSection {
  id: string
  sectionKey: string // 'hero', 'about', 'features', etc.
  title?: string
  subtitle?: string
  content?: string
  image?: string
  isVisible: boolean
  order: number
  metadata?: Record<string, any>
  updatedAt: Date
}

// API Endpoints
GET  /api/admin/content         - List all sections
PUT  /api/admin/content/:key    - Update section
```

## Data Models

### Prisma Schema Additions

```prisma
model Banner {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  title      String
  subtitle   String?
  image      String
  link       String?
  buttonText String?
  order      Int      @default(0)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model FAQ {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  question  String
  answer    String
  category  String   @default("General")
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Testimonial {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  authorName  String
  message     String
  rating      Int      @default(5)
  productName String?
  date        DateTime @default(now())
  isVisible   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SiteSettings {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  companyName   String   @default("James Sax Corner")
  address       String   @default("Ha Noi, Viet Nam")
  phone         String   @default("")
  email         String   @default("")
  workingHours  String   @default("24/7")
  socialLinks   Json     @default("{}")
  footerText    String   @default("")
  copyrightText String   @default("")
  updatedAt     DateTime @updatedAt
}

model HomepageContent {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  sectionKey String   @unique
  title      String?
  subtitle   String?
  content    String?
  image      String?
  isVisible  Boolean  @default(true)
  order      Int      @default(0)
  metadata   Json?
  updatedAt  DateTime @updatedAt
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Entity CRUD Round-trip
*For any* valid entity data (Banner, FAQ, Testimonial), creating then reading should return an entity with equivalent data fields.
**Validates: Requirements 2.2, 3.2, 4.2**

### Property 2: Entity Delete Removes from Database
*For any* existing entity, after delete operation, querying for that entity should return null/not found.
**Validates: Requirements 2.4, 3.4, 4.4**

### Property 3: Entity Update Persists Changes
*For any* existing entity and valid update data, after update operation, reading the entity should return the updated values.
**Validates: Requirements 2.3, 3.3, 4.3**

### Property 4: Toggle Visibility Flips State
*For any* entity with visibility/active field, toggle operation should flip the boolean value.
**Validates: Requirements 2.5, 4.5**

### Property 5: Settings Validation Rejects Invalid Data
*For any* settings update with missing required fields (email format, empty company name), the system should reject with validation error.
**Validates: Requirements 5.6**

### Property 6: Auth Protection Redirects Unauthenticated
*For any* admin API route, requests without valid authentication should return 401 Unauthorized.
**Validates: Requirements 8.1, 8.2**

## Error Handling

| Error Type | HTTP Status | Response |
|------------|-------------|----------|
| Not Found | 404 | `{ error: "Entity not found" }` |
| Validation Error | 400 | `{ error: "Validation failed", details: [...] }` |
| Unauthorized | 401 | `{ error: "Unauthorized" }` |
| Server Error | 500 | `{ error: "Internal server error" }` |

## Testing Strategy

### Unit Tests
- Test individual API route handlers with mocked Prisma client
- Test form validation logic
- Test data transformation functions

### Property-Based Tests (using fast-check)
- Property 1: CRUD round-trip for each entity type
- Property 2: Delete removes entity
- Property 3: Update persists changes
- Property 4: Toggle flips visibility
- Property 5: Validation rejects invalid data
- Property 6: Auth protection

### Integration Tests
- Test full CRUD flow through API
- Test database operations with test database
- Test authentication flow

## UI Components

### Dashboard Cards
```typescript
interface DashboardCard {
  title: string
  count: number
  icon: LucideIcon
  href: string
  color: string
}
```

### Data Table
- Sortable columns
- Pagination
- Search/filter
- Bulk actions

### Form Components
- Input with validation
- Image upload with preview
- Rich text editor for FAQ answers
- Toggle switch for visibility
