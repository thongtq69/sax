# Database Setup Guide

> **💡 Tip:** Hiện tại project đang dùng **MongoDB**. Nếu muốn dùng PostgreSQL, cần thay đổi schema.

## Tech Stack

- **Backend**: Next.js API Routes (App Router)
- **ORM**: Prisma
- **Database**: MongoDB (Atlas hoặc Local)
- **Authentication**: NextAuth.js (to be implemented)

## Quick Start

### Option A: MongoDB Atlas (Cloud - Khuyến nghị) ⭐

**Không cần cài MongoDB local!**

1. Xem hướng dẫn chi tiết: `MONGODB_ATLAS_SETUP.md`
2. Tạo account tại: https://www.mongodb.com/cloud/atlas/register
3. Tạo cluster free tier
4. Lấy connection string
5. Thêm vào `.env`: `DATABASE_URL="mongodb+srv://..."`

### Option B: MongoDB Local

1. Xem hướng dẫn chi tiết: `MONGODB_SETUP.md`
2. Cài MongoDB trên máy
3. Thêm vào `.env`: `DATABASE_URL="mongodb://localhost:27017/saxcorner"`

### Option C: PostgreSQL (Nếu muốn chuyển)

Choose one of these options:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally, then:
DATABASE_URL="postgresql://user:password@localhost:5432/saxcorner?schema=public"
```

#### Option B: Supabase (Recommended - Free)
1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string from Settings > Database
4. Add to `.env` file

#### Option C: Neon (Free PostgreSQL)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add to `.env` file

#### Option D: Railway (Free tier)
1. Go to https://railway.app
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string
5. Add to `.env` file

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your DATABASE_URL
```

### 3. Run Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (MongoDB không cần migrations)
npm run db:push
```

### 4. Seed Database

```bash
# Seed with initial data
npm run db:seed
```

This will populate your database with:
- Categories and SubCategories
- Products (16 items)
- Blog Posts (8 posts)
- Promo Banners (6 banners)
- Featured Collections (5 collections)
- Admin user (email: admin@saxcorner.com, password: admin123)

### 5. View Database (Optional)

```bash
# Open Prisma Studio to view/edit data
npm run db:studio
```

## Database Schema

### Models

- **Category**: Product categories (Woodwinds, Brasswinds)
- **SubCategory**: Subcategories (Flutes, Saxophones, etc.)
- **Product**: Products with full details
- **BlogPost**: Blog posts with HTML content
- **PromoBanner**: Promotional banners
- **FeaturedCollection**: Featured product collections
- **User**: User accounts (admin/customer)
- **Order**: Customer orders
- **OrderItem**: Order line items

## Available Scripts

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes (development)
- `npm run db:migrate` - Create migration (production)
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio GUI

## Next Steps

After database is set up:
1. Create API routes in `app/api/`
2. Update frontend to use API instead of hardcoded data
3. Implement NextAuth.js for authentication
4. Add file upload functionality

