# Requirements Document

## Introduction

This feature enhances the product management system to support two distinct product types: New and Used instruments. New products have flexible stock management, while Used products are unique items with a condition rating system. The feature also includes fixing existing UI issues with Vietnamese text in filters and stock status updates not reflecting properly.

## Glossary

- **Product_System**: The core product management module handling product data, display, and administration
- **Condition_Rating**: A classification system for used products indicating their physical and functional state
- **Stock_Manager**: The component responsible for tracking product availability and quantity
- **Filter_Component**: The UI component that allows users to filter products by various criteria
- **Admin_Panel**: The administrative interface for managing products

## Requirements

### Requirement 1: Fix Vietnamese Text in Filters

**User Story:** As a user, I want all filter labels to be in English, so that the interface is consistent and professional.

#### Acceptance Criteria

1. THE Filter_Component SHALL display "Brand" instead of "Thương hiệu"
2. THE Filter_Component SHALL display "Price Range" instead of "Khoảng giá"
3. THE Filter_Component SHALL display "Clear all" instead of "Xóa tất cả"
4. THE Filter_Component SHALL display "From" instead of "Từ" in price inputs
5. THE Filter_Component SHALL display "To" instead of "Đến" in price inputs
6. THE Filter_Component SHALL display "Max price" instead of "Giá cao nhất"

### Requirement 2: Fix Stock Status Update Bug

**User Story:** As an admin, I want stock status changes to be saved and displayed correctly, so that customers see accurate availability information.

#### Acceptance Criteria

1. WHEN an admin changes stock status to "Sold Out" THEN the Product_System SHALL save and display "Sold Out: This item is currently unavailable"
2. WHEN an admin changes stock status to "Pre-Order" THEN the Product_System SHALL save and display "Pre-Order: Ready to ship in 7-10 days"
3. WHEN an admin changes stock status to "In Stock" THEN the Product_System SHALL save and display "In Stock - Ships within 1-2 business days"
4. WHEN stock status is updated THEN the Product_System SHALL persist the change to the database immediately
5. WHEN a product page loads THEN the Product_System SHALL display the correct stock status from the database

### Requirement 3: Product Type Classification

**User Story:** As an admin, I want to classify products as New or Used, so that I can manage inventory appropriately for each type.

#### Acceptance Criteria

1. THE Product_System SHALL support two product types: "new" and "used"
2. WHEN a product is created THEN the Admin_Panel SHALL require selection of product type
3. THE Product_System SHALL store product type in the database
4. WHEN displaying products THEN the Product_System SHALL show the product type indicator

### Requirement 4: New Product Stock Management

**User Story:** As an admin, I want to manage stock quantities for new products, so that I can track inventory levels.

#### Acceptance Criteria

1. WHEN product type is "new" THEN the Admin_Panel SHALL allow editing stock quantity
2. WHEN product type is "new" THEN the Stock_Manager SHALL accept any positive integer for stock
3. WHEN product type is "new" THEN the Product_System SHALL display current stock quantity
4. WHEN stock reaches zero for new products THEN the Product_System SHALL mark as "Out of Stock"

### Requirement 5: Used Product Condition System

**User Story:** As an admin, I want to assign condition ratings to used products, so that customers understand the item's state.

#### Acceptance Criteria

1. WHEN product type is "used" THEN the Admin_Panel SHALL require selection of condition rating
2. THE Condition_Rating SHALL include: "mint", "excellent", "very-good", "good", "fair"
3. WHEN product type is "used" THEN the Stock_Manager SHALL automatically set stock to 1
4. WHEN product type is "used" THEN the Admin_Panel SHALL NOT allow editing stock quantity
5. THE Product_System SHALL store condition rating in the database

### Requirement 6: Condition Description Tooltips

**User Story:** As a customer, I want to see descriptions of condition ratings, so that I understand what each rating means.

#### Acceptance Criteria

1. WHEN a user hovers over or taps a condition badge THEN the Product_System SHALL display a tooltip with the condition description
2. THE tooltip for "mint" SHALL display: "Mint items are in essentially new original condition but have been opened or played."
3. THE tooltip for "excellent" SHALL display: "Excellent items are almost entirely free from blemishes and other visual defects and have been played or used with the utmost care."
4. THE tooltip for "very-good" SHALL display: "Very Good items may show a few slight marks or scratches but are fully functional and in overall great shape."
5. THE tooltip for "good" SHALL display: "Good items show moderate wear but are fully functional."
6. THE tooltip for "fair" SHALL display: "Fair condition gear should function but will show noticeable cosmetic damage or other issues."
7. THE tooltip SHALL work on both desktop (hover) and mobile (tap)

### Requirement 7: Admin CRUD for Product Types

**User Story:** As an admin, I want full CRUD capabilities for product types and conditions, so that I can manage the product catalog effectively.

#### Acceptance Criteria

1. WHEN creating a product THEN the Admin_Panel SHALL display product type selection
2. WHEN editing a product THEN the Admin_Panel SHALL allow changing product type
3. WHEN product type changes from "new" to "used" THEN the Stock_Manager SHALL automatically set stock to 1
4. WHEN product type changes from "used" to "new" THEN the Admin_Panel SHALL enable stock quantity editing
5. WHEN filtering products THEN the Admin_Panel SHALL allow filtering by product type
6. WHEN filtering products THEN the Admin_Panel SHALL allow filtering by condition (for used products)

### Requirement 8: Product Display Updates

**User Story:** As a customer, I want to see product type and condition clearly displayed, so that I can make informed purchasing decisions.

#### Acceptance Criteria

1. WHEN displaying a used product THEN the Product_System SHALL show condition badge (e.g., "Used - Excellent")
2. WHEN displaying a new product THEN the Product_System SHALL show "New" indicator or no special indicator
3. THE condition badge SHALL be visible on product cards in shop listing
4. THE condition badge SHALL be visible on product detail page
5. WHEN a used product is displayed THEN the Product_System SHALL show "Only 1 available" indicator
