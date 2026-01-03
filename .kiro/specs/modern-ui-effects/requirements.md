# Requirements: Modern UI Effects & Header Updates

## Overview
Cập nhật giao diện Header/TopBar và Hero Section cho website James Sax Corner với các hiệu ứng UI hiện đại.

## User Stories

### US-1: Header/TopBar Improvements
**As a** visitor  
**I want** a well-balanced header with proper spacing and larger logo  
**So that** the navigation is visually appealing and easy to use

#### Acceptance Criteria:
- [ ] AC-1.1: Logo SVG được phóng to (từ 54px lên 64px khi scroll, từ 62px lên 72px bình thường)
- [ ] AC-1.2: Khoảng cách giữa logo và social icons được cân chỉnh hợp lý
- [ ] AC-1.3: "My Account" được đổi thành "Login" và di chuyển sang vị trí của "Call Us"
- [ ] AC-1.4: Icon điện thoại được thay bằng WhatsApp icon
- [ ] AC-1.5: Popup đăng ký tài khoản hiển thị khi bấm vào Login

### US-2: Hero Section Updates
**As a** visitor  
**I want** a cleaner hero section with JSC logo and music note background  
**So that** the brand identity is clear and visually engaging

#### Acceptance Criteria:
- [ ] AC-2.1: Bỏ nút "Learn More" 
- [ ] AC-2.2: Thêm 4 tiêu đề kèm đường dẫn liên quan, tự động thay đổi theo thời gian và khi bấm next/back
- [ ] AC-2.3: Thay chữ "James Sax Corner" bằng jsc.svg theo hàng ngang
- [ ] AC-2.4: Bỏ text "Premium Wind Instruments" và "Wind Instrument Specialists"
- [ ] AC-2.5: Đổi "Explore Collection" thành "Buy with confidence!"
- [ ] AC-2.6: Thu gọn chiều dọc hero section hợp lý
- [ ] AC-2.7: Thêm vector musicnote.svg làm nền

### US-3: Consistent Typography
**As a** visitor  
**I want** consistent font styling across the website  
**So that** the reading experience is cohesive

#### Acceptance Criteria:
- [ ] AC-3.1: Toàn bộ text sử dụng cùng font family với đoạn text chính trong hero
- [ ] AC-3.2: Font 'Lora' được áp dụng cho body text
- [ ] AC-3.3: Font 'Playfair Display' được áp dụng cho headings

## Technical Requirements

### TR-1: Login Modal Component
- Modal với gradient header
- Form fields: Email, Password, Confirm Password (for register), Full Name (for register)
- Toggle giữa Login và Register mode
- Social login buttons (Google, Facebook)
- Show/hide password functionality
- Responsive design

### TR-2: Hero Section Carousel
- 4 tiêu đề với đường dẫn
- Auto-rotate với interval
- Manual navigation (next/back buttons)
- Smooth transitions

### TR-3: SVG Assets
- jsc.svg - Logo chính
- musicnote.svg - Pattern nền cho hero section

## Dependencies
- Lucide React icons
- Next.js Image component
- Tailwind CSS animations

## Notes
- Đảm bảo responsive trên mobile và desktop
- Animations phải mượt mà và không gây lag
- Accessibility: đảm bảo keyboard navigation và screen reader support
