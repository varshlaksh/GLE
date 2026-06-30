# TheGanaGallery

A modern Next.js e-commerce storefront for handcrafted Indian home decor — Wall Decor, Cherial Art, Metal Ware, Carved Wooden Decor, Clock Art Paintings, and more.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 (custom luxury/artisan design tokens)
- **Database & Auth:** Supabase (Postgres + Row Level Security)
- **State:** Zustand (cart)
- **Charts:** Recharts (admin dashboard)
- **Fonts:** Fraunces (display), Geist Sans (body)

## Getting Started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key   # required for admin user list
NEXT_PUBLIC_SITE_URL=https://yourdomain.com                 # used in SEO metadata, sitemap, OG tags

# Optional — if using Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Database Setup

Run all migrations **in order** in the Supabase SQL Editor (`supabase/migrations/`):

| File | Purpose |
|---|---|
| `0003_extend_profiles.sql` | Adds `full_name`, `phone`, `avatar_url` to profiles |
| `0004_timeline_profile.sql` | Order status timeline support |
| `0005_cod_settings.sql` | Cash-on-delivery toggle (store settings) |
| `0006_fix_admin_profiles_policy.sql` | Admin RLS policy fix for profiles |
| `0007_reviews.sql` | Customer reviews table + approval workflow |
| `0008_product_slugs.sql` | SEO-friendly product URL slugs |
| `0009_fix_profile_and_product_delete.sql` | Adds `gender`/`address` to profiles; fixes missing product DELETE policy |

`0001` and `0002` are legacy reference files (`.bak`) — not run.

## Key Features

- **Shop by Collection** — homepage section linking to 8 curated collections
- **Product cards** — primary/secondary image hover crossfade, centered brand label, fixed 4:5 aspect ratio
- **SEO** — slug-based product URLs, per-page metadata, OpenGraph/Twitter cards, JSON-LD structured data, auto-generated `sitemap.xml` and `robots.txt`
- **Customer reviews** — submission form with email verification, admin approval workflow, auto-scrolling carousel with avatars
- **Floating WhatsApp button** — fixed bottom-right, all pages
- **Admin panel** (`/admin`) — dashboard with revenue/order/category charts, product management (with collection dropdown + image previews), order management, registered users (live from Supabase Auth), review moderation, store settings

## Project Structure

```
app/
  (shop)/          Public storefront routes
  (admin)/admin/   Admin panel routes
  api/             API routes (REST-style, Supabase-backed)
  sitemap.ts       Auto-generated sitemap
  robots.ts        Auto-generated robots.txt
components/
  product/         ProductCard, ProductGallery, ProductsClient
  home/            CollectionsSection, ReviewsCarousel
  admin/           ProductForm, AdminSidebar
  ui/              WhatsAppButton
lib/
  supabase-server.ts   Cookie-aware (request-time) + public (build-time) Supabase clients
  adminAuth.ts         requireAdmin / requireUser helpers
supabase/migrations/   SQL migrations, run in order
types/index.ts          Shared TypeScript types
```

## Notes

- `createServerSupabaseClient()` uses cookies — only call it at **request time** (server components, API routes).
- `createPublicSupabaseClient()` is cookie-free — use it in `generateStaticParams`, `sitemap.ts`, or anywhere that runs at **build time**.
- Product URLs are slug-based (`/products/your-product-slug`) with automatic fallback to UUID for old links.