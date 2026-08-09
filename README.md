# James Sax Corner

E-commerce web app for **James Sax Corner** (jamessaxcorner.com) — a premium new & used saxophone retailer (Yamaha, Yanagisawa, Selmer, and more) based in Hanoi, Vietnam, selling primarily to the US market. Built with Next.js 15 (App Router), Prisma + MongoDB, NextAuth, PayPal, and Cloudinary.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 18, TypeScript
- **Database:** MongoDB via Prisma ORM
- **Auth:** NextAuth v5 (credentials + Google/Facebook OAuth), JWT sessions
- **Payments:** PayPal (REST API + IPN "Standard Button" fallback)
- **Media:** Cloudinary (custom image loader)
- **Styling/UI:** Tailwind CSS, Radix UI primitives, shadcn-style `components/ui`
- **Rich text:** Tiptap (used for blog/admin content editing)
- **Email:** Nodemailer (SMTP)
- **State:** Zustand (cart/store), React Context (site settings, wishlist)
- **Analytics:** Google Analytics 4 (incl. GA4 Realtime API for admin dashboard)

## Project Structure

```
app/
  page.tsx                 Homepage
  shop/                    Product listing/search
  item/[slug]              Product detail pages
  b/[slug], p/[slug]       Brand / model pages
  blog/                    Blog listing & posts
  cart/, checkout/         Cart & checkout flow (incl. PayPal)
  account/                 Customer account (orders, profile, wishlist)
  auth/                    Login, register, password reset, email/OTP verification
  order-secure/[slug]      Tokenized guest order tracking pages
  admin/                   Full admin dashboard (see below)
  api/                     All backend route handlers (REST-style)
components/                UI components, grouped by feature area
lib/                       Business logic, integrations, helpers
prisma/                    schema.prisma, seed scripts
scripts/                   One-off maintenance/verification scripts (tsx)
contexts/                  React context providers
hooks/                     Custom React hooks
data/                      Static data (blog posts, Reverb import data)
docs/                      Internal project notes
public/                    Static assets/images
```

### Admin dashboard (`app/admin`)

Covers products, categories, brands, orders, invoices, blog (with draft/schedule + auto-publish cron), banners, promos, popup ads, testimonials, reviews, FAQs, shipping zones, site settings, users, subscribers, inquiries, announcements, featured collections, and analytics (GA4 realtime).

### Data model (`prisma/schema.prisma`)

Key models: `Product`, `Category`/`SubCategory`, `Brand`, `Order`/`OrderItem`, `Invoice`, `User`/`Account`/`Session` (NextAuth), `Review`, `BlogPost`, `PromoBanner`, `Banner`, `FAQ`, `Testimonial`, `SiteSettings`, `HomepageContent`, `Inquiry`, `ShippingZone`, `Wishlist`, `PopupAd`, `Subscriber`, and more. MongoDB is the datastore (Prisma `mongodb` provider).

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A MongoDB database (e.g. MongoDB Atlas)
- Accounts/keys for: Cloudinary, PayPal Developer, SMTP email provider, and optionally Google/Facebook OAuth and Google Analytics

### Setup

```bash
# 1. Install dependencies (also runs `prisma generate` via postinstall)
npm install

# 2. Configure environment variables
cp .env.example .env
# then fill in DATABASE_URL, CLOUDINARY_URL, PayPal keys, NEXTAUTH_SECRET, SMTP creds, etc.

# 3. Push the Prisma schema to your MongoDB database
npm run db:push

# 4. (Optional) Seed initial data
npm run db:seed

# 5. Run the dev server
npm run dev
```

App runs at `http://localhost:3000`.

### Environment Variables

See `.env.example` for the full list. Required for core functionality:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MongoDB connection string |
| `CLOUDINARY_URL` | Image hosting/delivery |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | PayPal REST checkout |
| `NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL` | PayPal Standard button fallback |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Auth session handling |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `EMAIL_FROM` | Transactional emails (verification, orders, invoices) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Facebook OAuth (optional) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (optional) |

## Available Scripts

```bash
npm run dev              # Start dev server
npm run build             # prisma generate + next build
npm run start             # Start production server (Next.js)
npm run start:standalone  # Start via custom server.js (for VPS/Hostinger-style hosting)
npm run lint               # ESLint

npm run db:generate        # Regenerate Prisma client
npm run db:push            # Push schema to MongoDB (no migration history)
npm run db:migrate         # Prisma migrate (dev)
npm run db:seed            # Seed database (prisma/seed.ts)
npm run db:studio          # Open Prisma Studio

npm run seo:inspect        # Inspect sitemap (scripts/inspect-sitemap.ts)
npm run verify:shipping    # Verify shipping-country logic
npm run verify:critical    # Run critical-path checks
```

`scripts/` also contains several ad hoc maintenance scripts (checking DB state, popup ads, product visibility, Selmer/Yanagisawa data fixes, serial-number search, etc.) runnable via `npx tsx scripts/<name>.ts`.

## Deployment

The app supports multiple deployment targets:

- **Vercel** (`vercel.json`) — recommended; includes per-route caching headers and a cron job for scheduled blog auto-publishing.
- **Render** (`render.yaml`) — builds with `npm install && npm run build && npm run db:generate`, health check at `/api/health`.
- **Self-hosted / VPS (e.g. Hostinger)** — use `npm run build` then `npm run start:standalone`, which runs the custom Node server in `server.js`. Enable `output: 'standalone'` in `next.config.js` if needed for this path.

## Notable Implementation Details

- **Images** are served through a custom Cloudinary loader (`lib/cloudinary-loader.ts`) rather than the default Next.js image loader.
- **Payments** support both PayPal's modern REST API (`api/paypal/create-order`, `capture-order`) and a simpler PayPal Standard Button + IPN flow (`api/paypal/create-standard-order`, `api/paypal/ipn`) for redundancy.
- **Guest checkout** is supported — orders can be tracked via a tokenized link at `/order-secure/[slug]` without an account, and later claimed by a registered user (`lib/claim-guest-orders.ts`).
- **Invoicing**: orders can generate branded HTML invoices (`lib/invoice.ts`), stored with revision/status tracking (`Invoice` model).
- **Shipping cost** is calculated per destination country via configurable `ShippingZone` records.
- **Auth middleware** (`middleware.ts` + `lib/auth.config.ts`) protects `/api/admin`, orders, uploads, and content-management API routes, plus enforces `noindex` on admin/auth/account/checkout pages.
- **SEO**: dynamic `sitemap.ts`/`robots.ts`, per-product/brand meta title & description overrides, auto-generated meta descriptions for used items based on condition.

## Documentation

- `docs/google-search-console-setup.md` — GSC setup notes
- `docs/questions-for-user.md`, `docs/report-for-cuong.md` — internal working notes from a prior development pass (in Vietnamese); kept for historical context, not required reading for setup.
