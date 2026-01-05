# Implementation Plan: Admin CMS Dashboard

## Overview

Triển khai hệ thống Admin CMS Dashboard cho phép quản trị viên quản lý toàn bộ nội dung website. Sử dụng Next.js App Router, Prisma ORM với MongoDB, và React components.

## Tasks

- [x] 1. Database Schema Setup
  - [x] 1.1 Add new Prisma models (Banner, FAQ, Testimonial, SiteSettings, HomepageContent)
    - Add models to prisma/schema.prisma
    - _Requirements: 7.1, 7.2_
  - [x] 1.2 Run Prisma generate and push to database
    - Execute prisma generate and prisma db push
    - _Requirements: 7.1_

- [x] 2. Admin Layout and Navigation
  - [x] 2.1 Create AdminSidebar component with navigation links
    - Create components/admin/AdminSidebar.tsx
    - Include links to all admin modules
    - _Requirements: 1.4_
  - [x] 2.2 Update admin layout to use new sidebar
    - Update app/admin/layout.tsx
    - _Requirements: 1.1, 1.4_

- [x] 3. Admin Dashboard Overview
  - [x] 3.1 Create dashboard page with stats cards
    - Update app/admin/page.tsx
    - Display counts for banners, FAQs, testimonials, products, orders
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 3.2 Create API endpoint for dashboard stats
    - Create app/api/admin/stats/route.ts
    - _Requirements: 1.3_

- [x] 4. Banner Management
  - [x] 4.1 Create Banner API routes (CRUD)
    - Create app/api/admin/banners/route.ts (GET, POST)
    - Create app/api/admin/banners/[id]/route.ts (GET, PUT, DELETE)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 4.2 Create Banner management page
    - Create app/admin/banners/page.tsx
    - Include list view, create/edit forms, delete confirmation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ]* 4.3 Write property test for Banner CRUD
    - **Property 1: Entity CRUD Round-trip**
    - **Validates: Requirements 2.2**

- [x] 5. FAQ Management
  - [x] 5.1 Create FAQ API routes (CRUD)
    - Create app/api/admin/faqs/route.ts (GET, POST)
    - Create app/api/admin/faqs/[id]/route.ts (GET, PUT, DELETE)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 5.2 Create FAQ management page
    - Create app/admin/faqs/page.tsx
    - Include list view grouped by category, create/edit forms
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 5.3 Write property test for FAQ CRUD
    - **Property 1: Entity CRUD Round-trip**
    - **Validates: Requirements 3.2**

- [x] 6. Testimonials Management
  - [x] 6.1 Create Testimonials API routes (CRUD)
    - Create app/api/admin/testimonials/route.ts (GET, POST)
    - Create app/api/admin/testimonials/[id]/route.ts (GET, PUT, DELETE)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [x] 6.2 Create Testimonials management page
    - Create app/admin/testimonials/page.tsx
    - Include list view with filters, create/edit forms
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [ ]* 6.3 Write property test for Testimonial CRUD
    - **Property 1: Entity CRUD Round-trip**
    - **Validates: Requirements 4.2**

- [x] 7. Site Settings Management
  - [x] 7.1 Create Site Settings API routes
    - Create app/api/admin/site-settings/route.ts (GET, PUT)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [x] 7.2 Create Site Settings management page
    - Update app/admin/settings/page.tsx
    - Include form for all settings with validation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [ ]* 7.3 Write property test for Settings validation
    - **Property 5: Settings Validation Rejects Invalid Data**
    - **Validates: Requirements 5.6**

- [x] 8. Homepage Content Management
  - [x] 8.1 Create Homepage Content API routes
    - Create app/api/admin/homepage-content/route.ts (GET)
    - Create app/api/admin/homepage-content/[key]/route.ts (PUT)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 8.2 Create Homepage Content management page
    - Create app/admin/content/page.tsx
    - Include editable sections for hero, about, features
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Frontend Integration
  - [x] 10.1 Update homepage to fetch dynamic content from database
    - Modify app/page.tsx to use HomepageContent
    - _Requirements: 6.5_
  - [x] 10.2 Update Footer to use SiteSettings from database
    - Modify components/site/Footer.tsx
    - _Requirements: 5.2, 5.3, 5.4_
  - [x] 10.3 Update TestimonialsPopup to use database testimonials
    - Modify components/site/TestimonialsPopup.tsx
    - _Requirements: 4.1_

- [x] 11. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all admin pages are functional
  - Test CRUD operations for all entities

## Notes

- Tasks marked with `*` are optional property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
