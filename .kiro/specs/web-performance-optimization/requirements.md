# Requirements Document

## Introduction

Tối ưu hóa hiệu suất website Next.js e-commerce (James Sax Corner) để cải thiện Core Web Vitals, giảm thời gian tải trang, và nâng cao trải nghiệm người dùng. Website hiện tại có nhiều vấn đề performance bao gồm: trang chủ là client component với nhiều API calls, thiếu caching, bundle size lớn, và data fetching không tối ưu.

## Glossary

- **Homepage**: Trang chủ của website (app/page.tsx)
- **Server_Component**: React Server Component - render trên server, không gửi JavaScript xuống client
- **Client_Component**: React Client Component - render trên client, cần JavaScript bundle
- **API_Route**: Next.js API endpoint xử lý requests
- **Data_Fetching**: Quá trình lấy dữ liệu từ database/API
- **Caching_Layer**: Lớp cache để lưu trữ dữ liệu tạm thời
- **Bundle**: JavaScript code được đóng gói gửi xuống browser
- **LCP**: Largest Contentful Paint - thời gian render phần tử lớn nhất
- **FCP**: First Contentful Paint - thời gian render nội dung đầu tiên
- **TTI**: Time to Interactive - thời gian trang có thể tương tác
- **ISR**: Incremental Static Regeneration - tái tạo trang tĩnh theo thời gian

## Requirements

### Requirement 1: Server-Side Rendering cho Homepage

**User Story:** As a user, I want the homepage to load quickly, so that I can see products immediately without waiting for JavaScript to execute.

#### Acceptance Criteria

1. THE Homepage SHALL render as a Server Component by default
2. WHEN the homepage loads, THE Server SHALL fetch all required data before sending HTML to client
3. THE Homepage SHALL display featured products, reviews, and hero content without client-side data fetching
4. WHEN JavaScript is disabled, THE Homepage SHALL still display all static content correctly
5. THE Homepage SHALL achieve LCP under 2.5 seconds on 3G connection

### Requirement 2: Data Fetching Optimization

**User Story:** As a developer, I want optimized data fetching patterns, so that the website loads faster and reduces server load.

#### Acceptance Criteria

1. WHEN fetching homepage data, THE Data_Fetching layer SHALL use parallel requests with Promise.all
2. THE API_Route SHALL implement response caching with appropriate cache headers
3. WHEN the same data is requested multiple times, THE Caching_Layer SHALL return cached response
4. THE Data_Fetching layer SHALL implement stale-while-revalidate pattern for non-critical data
5. WHEN fetching product lists, THE API_Route SHALL support pagination to limit response size

### Requirement 3: Image Optimization

**User Story:** As a user, I want images to load quickly and not block page rendering, so that I can browse products smoothly.

#### Acceptance Criteria

1. THE Homepage SHALL use Next.js Image component with proper sizes attribute for all product images
2. WHEN images are below the fold, THE Image component SHALL use lazy loading
3. THE Hero image SHALL use priority loading to improve LCP
4. WHEN displaying product thumbnails, THE Image component SHALL use appropriate width/height to prevent layout shift
5. THE SmartImage component SHALL implement blur placeholder for better perceived performance

### Requirement 4: Bundle Size Reduction

**User Story:** As a user, I want the website to load minimal JavaScript, so that pages become interactive faster.

#### Acceptance Criteria

1. THE Homepage SHALL split client-side interactivity into separate Client Components
2. WHEN a component only needs interactivity, THE Component SHALL be wrapped with 'use client' directive
3. THE Bundle SHALL not include unused code from large libraries
4. WHEN importing icons, THE Import statement SHALL use named imports instead of entire library
5. THE Homepage JavaScript bundle SHALL be under 100KB gzipped

### Requirement 5: Static Generation với ISR

**User Story:** As a developer, I want pages to be statically generated where possible, so that they load instantly from CDN.

#### Acceptance Criteria

1. THE Homepage SHALL use ISR with revalidation period of 60 seconds
2. WHEN product data changes, THE ISR SHALL regenerate affected pages within revalidation period
3. THE Shop page SHALL implement static generation for category pages
4. WHEN a new product is added, THE System SHALL trigger on-demand revalidation
5. THE Product detail pages SHALL use generateStaticParams for pre-rendering popular products

### Requirement 6: API Response Caching

**User Story:** As a developer, I want API responses to be cached, so that repeated requests are served faster.

#### Acceptance Criteria

1. THE API_Route for products SHALL set Cache-Control header with max-age of 60 seconds
2. THE API_Route for categories SHALL set Cache-Control header with max-age of 300 seconds
3. WHEN data is updated via admin, THE System SHALL invalidate relevant cache entries
4. THE API_Route SHALL implement ETag headers for conditional requests
5. THE Caching_Layer SHALL use Redis or in-memory cache for frequently accessed data

### Requirement 7: Component-Level Code Splitting

**User Story:** As a user, I want only necessary components to load initially, so that the page becomes interactive faster.

#### Acceptance Criteria

1. WHEN the QuickViewModal is needed, THE System SHALL load it dynamically using next/dynamic
2. THE TestimonialsPopup SHALL be loaded dynamically only when user clicks to open
3. WHEN the MiniCartDrawer is opened, THE System SHALL load cart-related code dynamically
4. THE SearchBar overlay SHALL be loaded dynamically on user interaction
5. THE Dynamic imports SHALL show appropriate loading states during code loading

### Requirement 8: Database Query Optimization

**User Story:** As a developer, I want database queries to be optimized, so that API responses are faster.

#### Acceptance Criteria

1. WHEN fetching products with relations, THE Query SHALL use Prisma include/select to fetch only needed fields
2. THE Product query SHALL implement database-level pagination instead of fetching all records
3. WHEN counting products, THE Query SHALL use Prisma count instead of fetching all records
4. THE Featured collections query SHALL be optimized to reduce N+1 queries
5. WHEN fetching homepage data, THE System SHALL use a single optimized query instead of multiple queries

