# AGENTS.md — TheGanaGallery Project Handoff
> Last updated: Phase 3 (Checkout, Razorpay, Admin) — done by Daksh
> Lakshya → Backend | Daksh → Frontend

---

## What This File Is

This file keeps both of us in sync. Every time Lakshya finishes a phase or a new file is ready, this doc gets updated. Read this before starting any work session.

---

## Project Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database + Auth | Supabase (PostgreSQL) |
| Cart State | Zustand |
| Payments | Razorpay (Phase 4) |
| Image Storage | Cloudinary (Phase 5) |
| Deploy | Vercel |

---

## Repo Rules

- `main` → production only, never push directly
- `dev` → shared branch, both of us PR into this
- Branch naming: `feat/your-feature-name`
- Always pull from `dev` before starting new work

```bash
git checkout dev
git pull origin dev
git checkout -b feat/your-feature-name
```

---

## Current Status

### ✅ Phase 1 — Foundation (DONE by Lakshya)

| File | What it does | You need this? |
|---|---|---|
| `lib/supabase-browser.ts` | Supabase client for browser | Import when needed |
| `lib/supabase-server.ts` | Supabase client for server | Don't import in client files |
| `middleware.ts` | Auto session refresh + admin route protection | Already wired, don't touch |
| `types/index.ts` | All shared types — Product, Order, CartItem, etc | ✅ Yes, import everywhere |
| `lib/auth.ts` | Auth hooks and functions | ✅ Yes, use these |
| `lib/cartStore.ts` | Cart state (Zustand) | ✅ Yes, use these |

---

### ✅ Phase 2 — Core Storefront UI (DONE by Daksh)

All pages below are built, styled (warm clay/sand theme, Fraunces display font),
and wired to the existing `lib/auth.ts` and `lib/cartStore.ts`. Mock data lives
in `lib/mockData.ts` until the real `/api/products` routes are ready.

| Page | Path | Status | Notes |
|---|---|---|---|
| Homepage | `app/(shop)/page.tsx` | ✅ Done | Hero, Featured Products, Categories, Testimonials, CTA |
| Product listing | `app/(shop)/products/page.tsx` | ✅ Done | Search, category filter, loading skeleton, empty state. Uses `mockProducts` |
| Product detail | `app/(shop)/products/[id]/page.tsx` | ✅ Done | Gallery, stock badge, Add to Cart, related products |
| Login | `app/(auth)/login/page.tsx` | ✅ Done | Uses `signIn()` |
| Signup | `app/(auth)/signup/page.tsx` | ✅ Done | Uses `signUp()` |
| Cart | `app/(shop)/cart/page.tsx` | ✅ Done | Uses `useCartStore()` — list, qty +/-, remove, clear, totals, empty state |

**Shared components/files added:**
- `components/layout/Navbar.tsx` — responsive, auth-aware (`useUser`/`signOut`), cart badge
- `components/layout/Footer.tsx`
- `components/product/ProductCard.tsx`
- `components/product/ProductGallery.tsx` (client — image thumbnails)
- `components/product/AddToCartButton.tsx` (client — qty + `addItem`)
- `lib/mockData.ts` — mock `Product[]` + `formatPrice`, `getProductById`, `getRelatedProducts`
- `app/(shop)/layout.tsx` — wraps shop pages with Navbar + Footer
- `app/(auth)/layout.tsx` — centered auth card layout
- `app/globals.css` — clay/sand color tokens, Fraunces display font
- `next.config.ts` — `images.remotePatterns` for Unsplash / Cloudinary / placehold.co

> ⚠️ **Not yet verified**: `npm run build` could not be run in the dev sandbox
> (no network access for `npm install`). Please run `npm install && npm run build`
> locally and report any TS/build errors.

---

### ✅ Phase 3 — Checkout, Razorpay, Admin (DONE by Daksh)

| Page | Path | Status | Notes |
|---|---|---|---|
| Checkout | `app/(shop)/checkout/page.tsx` | ✅ Done | Shipping form + Razorpay Checkout.js flow |
| Order success | `app/(shop)/order-success/[id]/page.tsx` | ✅ Done | Confirmation + order summary |
| Order history | `app/(shop)/orders/page.tsx` | ✅ Done | Uses `/api/orders` (GET) |
| Admin layout | `app/(admin)/admin/layout.tsx` | ✅ Done | Server-side `is_admin` check + sidebar |
| Admin overview | `app/(admin)/admin/page.tsx` | ✅ Done | Stats cards via `/api/admin/stats` |
| Admin products | `app/(admin)/admin/products/page.tsx` + `new/` + `[id]/` | ✅ Done | Full CRUD |
| Admin orders | `app/(admin)/admin/orders/page.tsx` | ✅ Done | List + status update dropdown |

**New API routes (Lakshya — please review these, they were built by Daksh out of necessity for the Razorpay flow):**

| Route | Method | Status | Notes |
|---|---|---|---|
| `/api/products` | GET | ✅ Done | Reads `products` table, falls back to `mockData` if empty/unreachable |
| `/api/products/[id]` | GET | ✅ Done | Same fallback pattern |
| `/api/orders` | GET/POST | ✅ Done | POST verifies Razorpay signature, writes `orders` + `order_items` |
| `/api/orders/[id]` | GET | ✅ Done | Single order, owner-only |
| `/api/payment/create-order` | POST | ✅ Done | Creates Razorpay order via `lib/razorpay.ts` |
| `/api/payment/verify` | POST | ✅ Done | Standalone signature check |
| `/api/admin/products` | GET/POST | ✅ Done | Admin-only (checks `profiles.is_admin`) |
| `/api/admin/products/[id]` | PATCH/DELETE | ✅ Done | Admin-only |
| `/api/admin/orders` | GET | ✅ Done | Admin-only |
| `/api/admin/orders/[id]` | PATCH | ✅ Done | Status update, admin-only |
| `/api/admin/stats` | GET | ✅ Done | Dashboard numbers, admin-only |

**New supporting files:**
- `lib/razorpay.ts` — server-only Razorpay order creation + HMAC signature verification
- `lib/adminAuth.ts` — `requireUser()` / `requireAdmin()` helpers for API routes
- `supabase/migrations/0001_phase3_orders_admin.sql` — **⚠️ Lakshya: please run this migration.** Creates `products`, `orders`, `order_items`, `profiles` tables + RLS policies + an `on_auth_user_created` trigger that auto-creates a `profiles` row (with `is_admin = false`) for every new signup.
- `.env.example` — added `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`

**To make yourself an admin** (after signing up normally):
```sql
update public.profiles set is_admin = true where id = '<your-user-uuid>';
```
Then visit `/admin`.

**Cart persistence fix:** `lib/cartStore.ts` now uses Zustand's `persist` middleware
(localStorage key: `thegana-cart`). Public API (`addItem`, `removeItem`,
`updateQuantity`, `clearCart`, `total`, `itemCount`) is unchanged — no
changes needed in existing components.

> ⚠️ **Not yet verified**: `npm run build` could not be run in the dev sandbox
> (no network access for `npm install`). Please run `npm install && npm run build`
> locally, run the SQL migration, set up `.env.local` with Razorpay test keys,
> and report any errors.

---

### 🟠 Phase 4 — Remaining / Nice-to-have

- Order detail page for users (`/orders/[id]`) — currently only `/order-success/[id]` exists
- Admin: bulk product image upload via Cloudinary (Phase 5 per stack table)
- Webhook handler for Razorpay (`/api/payment/webhook`) as a fallback to the client-side verification flow
- Pagination for `/api/admin/orders` and `/api/admin/products` once catalogue grows

---

## Daksh: How To Use Auth

**Never call Supabase directly in UI.** Use these from `lib/auth.ts`:

```tsx
import { useUser, signIn, signUp, signOut } from '@/lib/auth'

const { user, loading } = useUser()
// user = null if not logged in
// user.email, user.id when logged in

await signIn(email, password)
await signUp(email, password)
await signOut()
```

---

## Daksh: How To Use Cart

Import from `lib/cartStore.ts`:

```tsx
import { useCartStore } from '@/lib/cartStore'

const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore()

addItem(product)           // adds 1
addItem(product, 3)        // adds 3
removeItem(product.id)

<p>₹{(total() / 100).toFixed(2)}</p>
<span>{itemCount()}</span>
```

> ✅ Already implemented in `app/(shop)/cart/page.tsx` — reuse this pattern,
> don't build a second cart UI.

---

## Daksh: Shared Types

Import from `@/types`:

```tsx
import type { Product, CartItem, Order, ShippingAddress } from '@/types'
```

Key types to know:
- `Product` — id, name, description, price (paise), images[], category, stock
- `CartItem` — product, quantity
- `Order` — id, user_id, items, status, total, shipping_address
- `OrderStatus` — `'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'`
- `ShippingAddress` — full_name, phone, line1, line2?, city, state, pincode

---

## Daksh: API Contract

> See the "Phase 3 — Checkout, Razorpay, Admin" section above for the full,
> up-to-date list of implemented routes. Summary: all `/api/products`,
> `/api/orders`, `/api/payment/*`, and `/api/admin/*` routes are now ✅ done.

All responses follow this shape:
```ts
{ data?: T, error?: string, message?: string }
```

---

## Daksh: Mock Data (now centralized)

Mock products now live in `lib/mockData.ts` (8 products across Baskets,
Pottery, Textiles, Decor categories) — used by the homepage, listing, and
detail pages. Helper functions available:

```tsx
import { mockProducts, categories, getProductById, getRelatedProducts, formatPrice } from '@/lib/mockData'
```

Switch `app/(shop)/products/page.tsx` and `[id]/page.tsx` from
`mockProducts`/`getProductById` to real fetches once `/api/products` is ✅.

---

## Environment Setup (first time pulling the repo)

```bash
git clone <repo-url>
cd gle_store
npm install
```

Create `.env.local` in root — ask Lakshya for the values:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Then:
```bash
npm run dev
# Visit http://localhost:3000
```

---

## Questions / Blockers

Drop a message on WhatsApp or add a comment in `API_CONTRACT.md`. Don't wait — if you're blocked, say so immediately.
