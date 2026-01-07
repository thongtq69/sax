# Implementation Plan: Product Condition Types

## Overview

This implementation plan covers fixing Vietnamese text in filters, fixing stock status bugs, and adding product type/condition system with admin CRUD capabilities.

## Tasks

- [x] 1. Fix Vietnamese text in Filter component
  - Replace "Thương hiệu" with "Brand"
  - Replace "Khoảng giá" with "Price Range"  
  - Replace "Xóa tất cả" with "Clear all"
  - Replace "Từ" with "From" and "Đến" with "To"
  - Replace "Giá cao nhất" with "Max price"
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Fix Stock Status persistence bug
  - [x] 2.1 Debug and fix stock status not saving correctly in API
    - Check API route for stock status handling
    - Ensure stockStatus field is properly saved to database
    - _Requirements: 2.4_
  - [x] 2.2 Fix product detail page to display correct stock status
    - Ensure stock status is read from database correctly
    - Display appropriate message based on status
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 3. Update Prisma schema for product types
  - Add productType field (String, default "new")
  - Add condition field (String, optional)
  - Add conditionNotes field (String, optional)
  - Run prisma generate and push
  - _Requirements: 3.1, 3.3, 5.5_

- [x] 4. Create condition constants and types
  - Create lib/product-conditions.ts with types and descriptions
  - Export CONDITION_DESCRIPTIONS mapping
  - Export ProductType and ConditionRating types
  - _Requirements: 5.2, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 5. Create ConditionTooltip component
  - Create components/product/ConditionTooltip.tsx
  - Implement hover tooltip for desktop
  - Implement tap tooltip for mobile
  - Style badge with condition colors
  - _Requirements: 6.1, 6.7_

- [x] 6. Update Admin Products page
  - [x] 6.1 Add product type selector to form
    - Add radio/select for New vs Used
    - Show condition selector when Used is selected
    - _Requirements: 3.2, 7.1, 7.2_
  - [x] 6.2 Implement stock auto-set logic for used products
    - Auto-set stock to 1 when Used is selected
    - Disable stock input for Used products
    - _Requirements: 5.3, 5.4, 7.3, 7.4_
  - [x] 6.3 Add condition notes textarea
    - Show only for Used products
    - Optional field for additional notes
    - _Requirements: 5.1_
  - [x] 6.4 Add product type and condition filters
    - Add filter dropdown for product type
    - Add filter dropdown for condition
    - _Requirements: 7.5, 7.6_

- [x] 7. Update Product API routes
  - [x] 7.1 Update create product endpoint
    - Handle productType field
    - Handle condition field
    - Validate condition required for used products
    - Auto-set stock to 1 for used products
    - _Requirements: 3.1, 5.2, 5.3_
  - [x] 7.2 Update update product endpoint
    - Handle productType changes
    - Handle condition updates
    - Enforce stock = 1 for used products
    - _Requirements: 7.2, 7.3, 7.4_

- [x] 8. Update Product Card component
  - Add condition badge display for used products
  - Show "Used - [Condition]" badge
  - Integrate ConditionTooltip
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 9. Update Product Detail page
  - Display product type indicator
  - Show condition badge with tooltip for used products
  - Show "Only 1 available" for used products
  - _Requirements: 8.4, 8.5_

- [x] 10. Checkpoint - Test all functionality
  - Ensure all tests pass
  - Verify filter text is in English
  - Verify stock status saves correctly
  - Verify product type and condition CRUD works
  - Ask the user if questions arise

- [ ]* 11. Write property tests
  - [ ]* 11.1 Write property test for stock status persistence
    - **Property 1: Stock Status Round-Trip Persistence**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
  - [ ]* 11.2 Write property test for product type constraint
    - **Property 2: Product Type Constraint**
    - **Validates: Requirements 3.1, 3.3**
  - [ ]* 11.3 Write property test for used product stock invariant
    - **Property 3: Used Product Stock Invariant**
    - **Validates: Requirements 5.3**
  - [ ]* 11.4 Write property test for condition rating constraint
    - **Property 4: Condition Rating Constraint**
    - **Validates: Requirements 5.2, 5.5**
  - [ ]* 11.5 Write property test for condition description mapping
    - **Property 5: Condition Description Mapping**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**

- [ ] 12. Final checkpoint
  - Ensure all tests pass
  - Verify end-to-end functionality
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
