# Environment Variables

## Overview

All environment variables used by the application. **Never commit actual secret values.** Use `.env.local` for local development and Vercel/GitHub secrets for CI/CD.

## Required Variables

### Supabase (Database + Auth)

| Variable | Description | Used In | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (e.g., `https://xxx.supabase.co`) | `lib/supabase-browser.ts`, `lib/supabase-server.ts`, `middleware.ts`, `app/api/admin/users/route.ts` | **Yes** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (safe for client) | All Supabase client initializations | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, bypasses RLS) | `lib/supabase-server.ts` (`createServiceSupabaseClient`), `app/api/admin/users/route.ts` | **Yes** (for admin user list) |

### Application

| Variable | Description | Used In | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SITE_URL` | Production site URL for SEO, sitemap, OG tags, email redirects | `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/(shop)/products/[slug]/page.tsx`, `app/(shop)/page.tsx` | **Yes** (fallback in code: `https://www.ganagallery.shop`) |

### Razorpay (Payments)

| Variable | Description | Used In | Required |
|----------|-------------|---------|----------|
| `RAZORPAY_KEY_ID` | Razorpay Key ID (server-side) | `lib/razorpay.ts` (`getAuthHeader`) | **Yes** (if payments enabled) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret (server-side, **never expose to client**) | `lib/razorpay.ts` (`getAuthHeader`, `verifyRazorpaySignature`) | **Yes** (if payments enabled) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (client-side, safe for browser) | Checkout page (Razorpay Checkout.js) | **Yes** (if payments enabled) |

### Cloudinary (Image Uploads) - Optional

| Variable | Description | Used In | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `app/api/upload/route.ts` | No (upload disabled if missing) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `app/api/upload/route.ts` | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (server-only) | `app/api/upload/route.ts` | No |

## Variable Usage by File

### `lib/supabase-browser.ts`
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### `lib/supabase-server.ts`
```typescript
// createServerSupabaseClient()
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// createPublicSupabaseClient()
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// createServiceSupabaseClient()
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.SUPABASE_SERVICE_ROLE_KEY
```

### `middleware.ts`
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### `lib/razorpay.ts`
```typescript
process.env.RAZORPAY_KEY_ID
process.env.RAZORPAY_KEY_SECRET
```

### `app/api/upload/route.ts`
```typescript
process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
process.env.CLOUDINARY_API_KEY
process.env.CLOUDINARY_API_SECRET
```

### `app/api/admin/users/route.ts`
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.SUPABASE_SERVICE_ROLE_KEY  // for service role client
```

### SEO/Metadata Files
```typescript
// app/layout.tsx, app/sitemap.ts, app/robots.ts, app/(shop)/page.tsx, app/(shop)/products/[slug]/page.tsx
process.env.NEXT_PUBLIC_SITE_URL  // fallback: "https://www.ganagallery.shop"
```

## Environment-Specific Values

### Local Development (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-local-or-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-test-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
# Cloudinary optional for local
```

### Vercel Preview Deployments
- Automatically gets `VERCEL_URL` (e.g., `https://gle-git-feature-branch.vercel.app`)
- **Current gap:** `NEXT_PUBLIC_SITE_URL` not dynamically set for previews
- Email confirmation redirects will point to production domain

### Vercel Production
```bash
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
NEXT_PUBLIC_SITE_URL=https://www.ganagallery.shop
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=prod-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
# Cloudinary production credentials
```

## CI/CD Secrets (GitHub Actions)

Configured in `.github/workflows/ci.yml` as repository secrets:

| Secret Name | Maps To |
|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `NEXT_PUBLIC_RAZORPAY_KEY_ID` |
| `RAZORPAY_KEY_SECRET` | `RAZORPAY_KEY_SECRET` |

## Security Notes

- **Never** prefix server-only secrets with `NEXT_PUBLIC_`
- `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS — only use in server code (`lib/supabase-server.ts`, admin API routes)
- `RAZORPAY_KEY_SECRET` used for HMAC signature verification — never expose to client
- `CLOUDINARY_API_SECRET` used for signed uploads — server-only
- Rotate keys periodically via Supabase/Razorpay/Cloudinary dashboards

## Validation

No runtime validation exists. Missing variables cause runtime errors in API routes. Consider adding a startup check in `lib/env-validation.ts` (future).