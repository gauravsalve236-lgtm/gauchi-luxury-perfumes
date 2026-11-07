# GAUCHI — Luxury Perfumes & Haute Parfumerie
### Complete Production-Ready Full-Stack Ecommerce Platform

> *"More than a fragrance. A lasting connection."*

GAUCHI is a complete, production-ready ecommerce platform engineered for an independent luxury perfume brand. Designed with a bespoke **premium white & warm ivory aesthetic** (`#FAF8F5`), black typography, and champagne gold accents (`#C5A059`), the platform offers an end-to-end customer shopping journey and an executive administration dashboard.

The entire store—from product formulations, variants (20ml, 60ml, gift sets), fragrance notes pyramid, pricing, inventory deductions, promotional coupons, order pipelines with AWB tracking, to the unique unboxing **Gauchi QR Customer Experience**—is manageable through the secure Admin Portal without editing source code.

---

## ✦ System Architecture & Tech Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend Storefront** | **Next.js 16 (App Router) + React 19 + TypeScript** | Server components, client interactivity, search autocomplete, responsive PWA |
| **Styling & Design System** | **Tailwind CSS v4** | Pure luxury white/ivory theme, champagne gold gradients, custom serif typography |
| **Database & ORM** | **Prisma ORM + SQLite (local) / Supabase PostgreSQL (prod)** | 21 relational models, foreign keys, indexes, inventory audit trail |
| **Authentication & Security** | **HTTP-Only JWT + Bcrypt Password Hashing** | Role-based access control (`ADMIN` vs `CUSTOMER`), secure cookie persistence |
| **Cart & State Management** | **React Context + LocalStorage Persistence** | Real-time bag drawer, free shipping meter, live coupon calculations |
| **Payments** | **Razorpay Architecture + Test Simulation** | Server-side HMAC-SHA256 signature verification, webhook handler, COD toggle |
| **Unboxing Experience** | **The Gauchi QR System** | Box QR destinations, Amazon/Flipkart review routing, olfactory survey |
| **Mobile App Shell** | **Progressive Web App (PWA)** | Installable web app manifest, mobile-first design, standalone viewport |

---

## ✦ Quick Start Guide (Local Setup)

The repository is self-contained with zero external cloud dependencies required for local testing.

### 1. Clone & Install Dependencies
```bash
cd gauchi-perfumes
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration for local development:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="gauchi_super_secret_jwt_key_2026_luxury_perfumes_signature"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RAZORPAY_KEY_ID="rzp_test_gauchi_placeholder"
RAZORPAY_KEY_SECRET="rzp_test_secret_placeholder"
NEXT_PUBLIC_WHATSAPP_SUPPORT="+919876543210"
```

### 3. Initialize & Seed Database
Synchronize the relational database schema and populate the initial luxury perfume catalog, admin user, test customer, active coupons, and QR destinations:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ✦ Pre-configured Credentials

| Role | Email | Password | Access Route |
| :--- | :--- | :--- | :--- |
| **Chief Administrator** | `admin@gauchi.com` | `GauchiAdmin@2026` | `/admin` or `/admin/login` |
| **Sample Customer** | `customer@gauchi.com` | `Customer@2026` | `/login` / `/account` |

---

## ✦ Core Feature Modules

### 1. Customer Storefront
- **Luxury Homepage (`/`)**: Hero section, promotional privilege offer, best sellers showcase, fragrance collections carousel, olfactory notes pyramid visualization, brand philosophy narrative, customer testimonials, and newsletter privilege invitation.
- **Fragrance Catalog (`/shop`)**: Multidimensional filtering by price range, fragrance family (*Oud*, *Fresh & Aquatic*, *Floral & Fruity*, *Warm & Woody*), category (*Unisex*, *Men*, *Women*), and sorting by popularity, newest, price low-to-high, and price high-to-low.
- **Search with Autocomplete**: Real-time search across perfume names, subtitles, notes, and fragrance families.
- **Product Detail Page (`/shop/[slug]`)**:
  - Image gallery with zoom preview and thumbnail selector.
  - Size variants (20ml travel spray, 60ml full flacon, gift sets) with live price, MRP strike-through, discount %, and stock indicator.
  - Olfactory Pyramid: detailed breakdown of Top Notes (0-30 min), Heart Notes (30 min-4 hr), and Base Notes (4-16+ hr).
  - Add to Bag, 1-Click Buy Now, and Wishlist toggling.
  - Customer review list with **Verified Purchase** badges and submission modal.
  - Related fragrances and frequently bought together recommendations.
- **Curated Collection Pages (`/collections/[slug]`)**: Tailored collection views for *Oud Collection*, *Fresh & Aquatic*, *Floral & Fruity*, *Warm & Woody*, and *Discovery Gift Sets*.

### 2. Shopping Bag & Checkout
- **Cart Slide-out Drawer**: Accessible anywhere via bag icon; live quantity adjustment, item removal, free express delivery progress meter (threshold ₹1,499), and coupon validation.
- **Secure Checkout (`/checkout`)**: Multi-step checkout with customer contact, shipping address, order review, coupon application, and payment method selection (*Online Payment via UPI/Cards/Netbanking* or *Cash on Delivery*).
- **Order Confirmation (`/order-confirmation/[orderNumber]`)**: Live order status tracker, delivery destination snapshot, courier tracking AWB, and **Print Tax Invoice** action.

### 3. Customer Account Portal (`/account`)
- Client profile management (name, phone, saved address).
- Order History with real-time status badges, itemized details, and courier tracking numbers.
- Self-service order cancellation for eligible unfulfilled orders (automatically restores inventory!).
- Wishlist with 1-click Add-to-Bag.

### 4. The Gauchi QR Customer Experience (`/experience/[code]`)
*Designed specifically for QR codes printed inside Gauchi perfume packaging:*
- Tagline: *"More than a fragrance. A lasting connection."*
- Unique destination per flacon (e.g. `/experience/black-oud-60ml`, `/experience/wild-nectar-60ml`, `/experience/gift-sets`).
- Includes welcome message, fragrance pyramid guide, pulse-point application ritual, and temperature/light storage instructions.
- **Platform-Specific Review Links**: Direct buttons to review on **Amazon**, **Flipkart**, or the official Gauchi website.
- **Olfactory Preference Survey & Feedback**: Scent ratings, comments, and optional customer registration for private extrait releases with explicit marketing consent.
- **Direct WhatsApp Concierge**: Instant chat button for personalized fragrance advice.
- **Scan & Click Analytics**: Tracks scans and clicks accurately without claiming a click equals a completed review.

### 5. Complete Executive Admin Dashboard (`/admin`)
- **Dashboard Overview (`/admin`)**: Total revenue, total orders, customer count, active flacons, pending vs delivered pipeline, monthly revenue breakdown, and low stock inventory alerts.
- **Product Management (`/admin/products`)**: Add new flacons, edit descriptions, adjust 60ml and 20ml variant prices, MRP, and stock, manage top/heart/base notes, set image URLs, and toggle featured/bestseller/published status.
- **Order Management (`/admin/orders`)**: Filter orders by status (*Pending*, *Confirmed*, *Processing*, *Packed*, *Shipped*, *Out for Delivery*, *Delivered*, *Cancelled*, *Refunded*), assign courier name (*BlueDart Express*, *Delhivery*) and Air Waybill (AWB) tracking numbers, record private internal notes, and export all orders to CSV.
- **Customer Directory (`/admin/customers`)**: View registered clients, lifetime spend totals, order counts, add internal VIP/concierge notes, and export customer data to CSV.
- **Coupons & Promotions (`/admin/coupons`)**: Create percentage discounts, fixed rupee discounts, or free shipping coupons with minimum order values, maximum discount caps, usage limits, and start/expiry dates.
- **Customer Review Moderation (`/admin/reviews`)**: View customer submissions, approve or hide reviews, write official Gauchi Concierge responses, and delete inappropriate content.
- **QR Box Destinations (`/admin/qr`)**: Create and manage packaging QR destinations, configure Amazon/Flipkart review URLs, and inspect scan counts, review clicks, and survey feedback.
- **CMS Content Block Editor (`/admin/content`)**: Update homepage hero headline, top announcement bar with countdown, brand philosophy, shipping policy, and returns policy directly through the admin panel without touching code.
- **Store Settings (`/admin/settings`)**: Configure free shipping cart thresholds, flat delivery rates, Cash on Delivery toggles, GST registration numbers, and concierge WhatsApp contacts.

---

## ✦ End-to-End Verification Test Results

An automated system audit script (`prisma/verify-e2e.ts`) was executed to verify all critical ecommerce capabilities:

```
=================================================
  GAUCHI LUXURY PERFUMES — SYSTEM E2E AUDIT
=================================================

✓ [PASS] 1. Executive Admin Account is configured with ADMIN role
✓ [PASS] 2. Admin master password hashes correctly via bcrypt
✓ [PASS] 3. Luxury product catalog contains 6 artisanal extraits
✓ [PASS] 4. Black Oud Royale contains 60ml & 20ml variants and full 3-tier olfactory pyramid
✓ [PASS] 5. Privilege coupon GAUCHI10 is active (10% off)
✓ [PASS] 6. Coupon discount math verified on server (10% of ₹1999 = ₹199.9)
✓ [PASS] 7. Stock auto-deduction confirmed: 120 -> 119
✓ [PASS] 8. Inventory audit trail recorded correctly
✓ [PASS] 9. Admin order pipeline update to SHIPPED with tracking AWB BD99283746IN verified
✓ [PASS] 10. Review submission requires admin moderation before public display
✓ [PASS] 11. Admin review approval & concierge reply verified
✓ [PASS] 12. Box QR Destination 'black-oud-60ml' has Amazon & Flipkart review targets verified
✓ [PASS] 13. Box QR scan counter incrementation verified
✓ [PASS] 14. CMS hero banner block editable from admin verified
✓ [PASS] 15. Store setting: Free shipping cart threshold is set to ₹1,499

=================================================
  RESULT: 15 / 15 TESTS PASSED
  ALL CRITICAL ECOMMERCE WORKFLOWS VERIFIED!
=================================================
```

---

## ✦ Production Deployment Guide

### Deploying on Vercel + Supabase (PostgreSQL)

1. **Database Setup with Supabase**:
   - Create a new project in [Supabase](https://supabase.com).
   - In Supabase SQL Editor, paste and execute the included production script [`prisma/supabase-schema.sql`](prisma/supabase-schema.sql).
   - Copy the PostgreSQL connection URI from your Supabase Project Settings.

2. **Update Prisma Datasource (for PostgreSQL)**:
   In `prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   Run `npx prisma generate`.

3. **Deploy to Vercel**:
   - Push your code to a GitHub repository.
   - Import the repository in [Vercel](https://vercel.com).
   - Configure Environment Variables in the Vercel Dashboard:
     - `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
     - `JWT_SECRET`: A long random secret key
     - `NEXT_PUBLIC_APP_URL`: Your production domain (`https://gauchi.com`)
     - `RAZORPAY_KEY_ID`: Your live Razorpay Key ID
     - `RAZORPAY_KEY_SECRET`: Your live Razorpay Secret
     - `NEXT_PUBLIC_WHATSAPP_SUPPORT`: Your official WhatsApp business phone number
   - Click **Deploy**. Vercel will run `npm run build` and launch your production storefront and admin dashboard.

---

## ✦ Security & Best Practices
- **Server-Side Validation**: All product prices, stock constraints, and coupon discounts are calculated and verified server-side to prevent client-side price tampering.
- **Role-Based Protection**: Admin API routes and dashboard pages enforce strict role validation (`requireAdmin()`), rejecting unauthorized requests with HTTP 403.
- **Sensitive Credentials**: Payment gateway secrets, JWT signing keys, and webhook secrets reside exclusively in server-side environment variables and are never committed or exposed in client bundles.
- **Stock Integrity**: Stock deductions during order placement and stock restorations during cancellations are executed within atomic database transactions with inventory movement tracking.
