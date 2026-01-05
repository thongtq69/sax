# Requirements Document

## Introduction

Xây dựng hệ thống Admin CMS Dashboard cho phép quản trị viên cập nhật toàn bộ nội dung website một cách trực quan và dễ dàng. Hệ thống cho phép quản lý Banner, FAQ, Testimonials, và các nội dung động khác trên website.

## Glossary

- **Admin_Dashboard**: Trang quản trị chính hiển thị tổng quan và điều hướng đến các module quản lý
- **CMS**: Content Management System - Hệ thống quản lý nội dung
- **Banner**: Hình ảnh/nội dung quảng cáo hiển thị trên trang chủ
- **FAQ**: Frequently Asked Questions - Câu hỏi thường gặp
- **Testimonial**: Đánh giá/nhận xét từ khách hàng
- **Dynamic_Content**: Nội dung động có thể thay đổi như text, hình ảnh trên các section
- **Site_Settings**: Cài đặt chung của website như logo, thông tin liên hệ, social links

## Requirements

### Requirement 1: Admin Dashboard Overview

**User Story:** As an admin, I want to see an overview dashboard, so that I can quickly access all content management modules.

#### Acceptance Criteria

1. WHEN an admin visits the dashboard THEN the System SHALL display a summary of all manageable content sections
2. WHEN an admin clicks on a module card THEN the System SHALL navigate to that module's management page
3. THE Dashboard SHALL display quick stats (total banners, FAQs, testimonials, etc.)
4. THE Dashboard SHALL provide a sidebar navigation for easy access to all modules

### Requirement 2: Banner Management

**User Story:** As an admin, I want to manage homepage banners, so that I can update promotional content.

#### Acceptance Criteria

1. WHEN an admin accesses Banner Management THEN the System SHALL display all existing banners in a list/grid
2. WHEN an admin creates a new banner THEN the System SHALL allow uploading image, setting title, subtitle, link, and display order
3. WHEN an admin edits a banner THEN the System SHALL pre-fill the form with existing data
4. WHEN an admin deletes a banner THEN the System SHALL remove it after confirmation
5. WHEN an admin toggles banner status THEN the System SHALL enable/disable banner visibility
6. THE System SHALL support drag-and-drop reordering of banners

### Requirement 3: FAQ Management

**User Story:** As an admin, I want to manage FAQ content, so that I can update questions and answers for customers.

#### Acceptance Criteria

1. WHEN an admin accesses FAQ Management THEN the System SHALL display all FAQs grouped by category
2. WHEN an admin creates a new FAQ THEN the System SHALL allow entering question, answer, and category
3. WHEN an admin edits an FAQ THEN the System SHALL pre-fill the form with existing data
4. WHEN an admin deletes an FAQ THEN the System SHALL remove it after confirmation
5. WHEN an admin reorders FAQs THEN the System SHALL update display order
6. THE System SHALL support rich text editing for FAQ answers

### Requirement 4: Testimonials Management

**User Story:** As an admin, I want to manage customer testimonials, so that I can curate reviews displayed on the website.

#### Acceptance Criteria

1. WHEN an admin accesses Testimonials Management THEN the System SHALL display all testimonials
2. WHEN an admin creates a testimonial THEN the System SHALL allow entering customer name, message, rating, product, and date
3. WHEN an admin edits a testimonial THEN the System SHALL pre-fill the form with existing data
4. WHEN an admin deletes a testimonial THEN the System SHALL remove it after confirmation
5. WHEN an admin toggles testimonial visibility THEN the System SHALL show/hide it on frontend
6. THE System SHALL allow filtering testimonials by rating and date

### Requirement 5: Site Settings Management

**User Story:** As an admin, I want to manage site-wide settings, so that I can update contact info, social links, and general content.

#### Acceptance Criteria

1. WHEN an admin accesses Site Settings THEN the System SHALL display all configurable settings
2. THE System SHALL allow updating: company name, address, phone, email, working hours
3. THE System SHALL allow updating social media links (Facebook, YouTube, Instagram, Twitter)
4. THE System SHALL allow updating footer content and copyright text
5. WHEN an admin saves settings THEN the System SHALL persist changes to database
6. THE System SHALL validate required fields before saving

### Requirement 6: Homepage Content Management

**User Story:** As an admin, I want to manage homepage sections, so that I can update text and images without code changes.

#### Acceptance Criteria

1. WHEN an admin accesses Homepage Content THEN the System SHALL display all editable sections
2. THE System SHALL allow editing: Hero section title/subtitle, About section, Features section
3. THE System SHALL allow editing section visibility (show/hide)
4. THE System SHALL support image upload for section backgrounds
5. WHEN an admin saves changes THEN the System SHALL update frontend immediately
6. THE System SHALL provide preview functionality before publishing

### Requirement 7: Data Persistence

**User Story:** As a system, I want to store all CMS data in database, so that content persists across deployments.

#### Acceptance Criteria

1. THE System SHALL store all CMS content in MongoDB/Prisma database
2. THE System SHALL create appropriate database models for each content type
3. THE System SHALL provide API endpoints for CRUD operations
4. WHEN data is updated THEN the System SHALL invalidate relevant caches
5. THE System SHALL support data backup and restore functionality

### Requirement 8: Security and Access Control

**User Story:** As a system, I want to protect admin routes, so that only authorized users can modify content.

#### Acceptance Criteria

1. WHEN an unauthenticated user accesses admin routes THEN the System SHALL redirect to login
2. THE System SHALL validate admin credentials before allowing access
3. THE System SHALL log all content modifications with timestamp and user
4. IF an unauthorized action is attempted THEN the System SHALL deny and log the attempt
