# Sitemap - Specialty Music Store

## 1. Home
- `/` - Trang chủ

## 2. Shop (Mega Menu Navigation)

### 2.1. Woodwinds
- `/shop/woodwinds` - Category landing
  - `/shop/woodwinds/flutes` - Flutes
  - `/shop/woodwinds/clarinets` - Clarinets
  - `/shop/woodwinds/saxophones` - Saxophones
  - `/shop/woodwinds/mouthpieces-ligs` - Mouthpieces & Ligatures
    - `/shop/woodwinds/mouthpieces-ligs/clarinet` - Clarinet
    - `/shop/woodwinds/mouthpieces-ligs/bass-clarinet` - Bass Clarinet
    - `/shop/woodwinds/mouthpieces-ligs/alto-sax` - Alto Sax
    - `/shop/woodwinds/mouthpieces-ligs/tenor-sax` - Tenor Sax
    - `/shop/woodwinds/mouthpieces-ligs/soprano-sax` - Soprano Sax
    - `/shop/woodwinds/mouthpieces-ligs/bari-sax` - Bari Sax
  - `/shop/woodwinds/accessories` - Accessories
    - `/shop/woodwinds/accessories/reeds` - Reeds
    - `/shop/woodwinds/accessories/barrels-bells` - Barrels & Bells
    - `/shop/woodwinds/accessories/boveda` - Boveda
    - `/shop/woodwinds/accessories/cases` - Cases
    - `/shop/woodwinds/accessories/bam-cases` - BAM Cases
  - `/shop/woodwinds/sax-necks` - Sax Necks
    - `/shop/woodwinds/sax-necks/alto` - Alto
    - `/shop/woodwinds/sax-necks/tenor` - Tenor
    - `/shop/woodwinds/sax-necks/bari` - Bari
    - `/shop/woodwinds/sax-necks/soprano` - Soprano

### 2.2. Brasswinds
- `/shop/brasswinds` - Category landing
  - `/shop/brasswinds/trumpets` - Trumpets
    - `/shop/brasswinds/trumpets/all` - All Trumpets
    - `/shop/brasswinds/trumpets/professional` - Professional
    - `/shop/brasswinds/trumpets/bach-stradivarius` - Bach Stradivarius
  - `/shop/brasswinds/french-horns` - French Horns
  - `/shop/brasswinds/trombones` - Trombones
  - `/shop/brasswinds/euphoniums` - Euphoniums
  - `/shop/brasswinds/flugel-horns` - Flugel Horns
  - `/shop/brasswinds/yamaha-silent-brass` - Yamaha Silent Brass

### 2.3. Percussion Kit
- `/shop/percussion` - Percussion Kit

### 2.4. Strings
- `/shop/strings` - Strings (external link hoặc subdomain nếu có)

### 2.5. Financing
- `/financing` - Financing landing
  - `/financing/pre-approval` - Pre-Approval
  - `/financing/application` - Full Application & Terms
  - `/financing/synchrony-promos` - Synchrony Promotions

### 2.6. Rentals
- `/rentals` - Rentals landing
  - `/rentals/school-music` - School Music Rentals
  - `/rentals/locations` - Rental Locations

### 2.7. Locations
- `/locations` - Locations landing
  - `/locations/main` - Main Location
  - `/locations/west-las-vegas` - West Las Vegas
  - `/locations/gv-henderson` - GV/Henderson

### 2.8. More
- `/contact` - Contact Us
- `/about` - About Us
- `/videos` - Assembly & Cleaning Videos
- `/music-lessons` - Music Lessons
- `/repairs` - Repairs
- `/why-us` - Why Us
- `/professional-setup` - Professional Setup/Advice

## 3. Category Listing Pages (PLP)
- Tất cả các category/subcategory trên đều có PLP với filter & sort

## 4. Product Detail Pages (PDP)
- `/product/[slug]` - Product detail với variants, gallery, tabs

## 5. Cart & Checkout
- `/cart` - Shopping Cart
- `/checkout` - Checkout (multi-step)
  - `/checkout/shipping` - Shipping Information
  - `/checkout/payment` - Payment
  - `/checkout/review` - Review & Confirm
- `/checkout/success` - Order Confirmation

## 6. My Account
- `/account` - Account Dashboard
- `/account/login` - Login
- `/account/register` - Register
- `/account/forgot-password` - Forgot Password
- `/account/orders` - Order History
- `/account/profile` - Profile Settings
- `/account/addresses` - Saved Addresses
- `/account/payment-methods` - Payment Methods

## 7. Footer Links
- `/terms` - Terms & Conditions
- `/privacy` - Privacy Policy
- `/prop65` - Proposition 65 Warning
- `/international-orders` - International Order Terms
- `/opt-out` - Opt-out Preferences
- `/cookie-policy` - Cookie Policy

## 8. Search
- `/search` - Search Results Page
- `/search?q=[query]` - Search với query parameter

## Mega Menu Structure (Desktop)

```
[Logo] [Woodwinds ▼] [Brasswinds ▼] [Percussion] [Strings] [Financing ▼] [Rentals ▼] [Locations ▼] [More ▼] [🔍 Search] [Cart $0.00]
```

### Mega Menu Dropdowns:

**Woodwinds:**
- Column 1: Flutes | Clarinets | Saxophones
- Column 2: Mouthpieces & Ligatures (Clarinet, Bass Clarinet, Alto/Tenor/Soprano/Bari Sax)
- Column 3: Accessories (Reeds, Barrels & Bells, Boveda, Cases, BAM Cases)
- Column 4: Sax Necks (Alto, Tenor, Bari, Soprano)

**Brasswinds:**
- Column 1: Trumpets (All, Professional, Bach Stradivarius)
- Column 2: French Horns | Trombones | Euphoniums
- Column 3: Flugel Horns | Yamaha Silent Brass

**Financing:**
- Pre-Approval | Full Application & Terms | Synchrony Promos

**Rentals:**
- School Music Rentals | Rental Locations

**Locations:**
- Main Location | West Las Vegas | GV/Henderson

**More:**
- Contact | About | Videos | Music Lessons | Repairs | Why Us | Professional Setup

## Mobile Navigation
- Hamburger menu → Accordion menu với expand/collapse
- Search icon → Full-screen search overlay
- Cart icon → Cart drawer/sidebar

