# Development Setup

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20.x | CI uses Node 20; recommend `nvm`/`fnm` |
| npm | 10.x | Comes with Node 20 |
| Git | Latest | For version control |
| Supabase CLI | Latest | Optional: for local database |

## Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd gle_store

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local  # or create manually

# 4. Configure .env.local with your values
# See docs/environment/variables.md for all required variables

# 5. Start development server
npm run dev
```

Visit `http://localhost:3000`

## Environment Configuration

Create `.env.local` in project root:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URL (required for SEO, email redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Razorpay (required for checkout/payments)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-test-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx

# Cloudinary (optional - for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Database Setup

### Option A: Use Hosted Supabase (Recommended for Development)

1. Create a Supabase project at `https://supabase.com`
2. Go to SQL Editor
3. Run migrations **in order** from `supabase/migrations/`:
   - `0003_extend_profiles.sql`
   - `0004_timeline_profile.sql`
   - `0005_cod_settings.sql`
   - `0006_fix_admin_profiles_policy.sql`
   - `0007_reviews.sql`
   - `0008_product_slugs.sql`
   - `0009_fix_profile_and_product_delete.sql`
4. Configure Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/login`, `http://localhost:3000/auth/callback`
5. Enable Email provider in Authentication → Providers

### Option B: Local Supabase (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase  # or: brew install supabase/tap/supabase

# Start local stack
supabase start

# Apply migrations
supabase db reset  # runs all migrations in supabase/migrations/

# Get local credentials
supabase status
# Copy API URL and anon key to .env.local
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build (type-check + compile) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Development Workflow

### Branching Strategy (from AGENTS.md)

```bash
# Before starting work
git checkout dev
git pull origin dev
git checkout -b feat/your-feature-name

# After changes
git add .
git commit -m "feat: your feature description"
git push origin feat/your-feature-name

# Create PR to dev branch
```

### Commit Convention

```
feat: new feature
fix: bug fix
docs: documentation only
style: formatting, no code change
refactor: code restructure
test: add/modify tests
chore: maintenance
```

### Code Quality Checks

```bash
# Type checking (runs in CI)
npx tsc --noEmit

# Linting
npm run lint

# Build verification
npm run build
```

## Project Structure Reference

```
├── app/                    # Next.js App Router
│   ├── (shop)/            # Public storefront routes
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (admin)/admin/     # Admin panel routes
│   ├── api/               # API routes
│   ├── sitemap.ts         # Auto-generated sitemap
│   ├── robots.ts          # Auto-generated robots.txt
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── product/           # ProductCard, ProductGallery, etc.
│   ├── home/              # CollectionsSection, ReviewsCarousel
│   ├── admin/             # ProductForm, AdminSidebar
│   ├── layout/            # Navbar, Footer
│   └── ui/                # WhatsAppButton
├── lib/                   # Utilities & clients
│   ├── supabase-browser.ts    # Client-side Supabase
│   ├── supabase-server.ts     # Server-side Supabase (3 variants)
│   ├── auth.ts                # Auth hooks + actions
│   ├── adminAuth.ts           # requireUser, requireAdmin
│   ├── cartStore.ts           # Zustand cart store
│   ├── razorpay.ts            # Payment helpers
│   └── mockData.ts            # Fallback product data
├── types/                 # Shared TypeScript types
│   └── index.ts
├── supabase/
│   └── migrations/        # SQL migrations (run in order)
└── public/                # Static assets
```

## Key Development Patterns

### Supabase Client Selection

| Context | Client Function | File |
|---------|-----------------|------|
| Client Component (browser) | `createClient()` | `lib/supabase-browser.ts` |
| Server Component / API Route (request time) | `createServerSupabaseClient()` | `lib/supabase-server.ts` |
| Server Component / API Route (build time) | `createPublicSupabaseClient()` | `lib/supabase-server.ts` |
| Admin / Service Role (bypass RLS) | `createServiceSupabaseClient()` | `lib/supabase-server.ts` |

**Rule:** `createServerSupabaseClient()` uses cookies — only call at request time (not in `generateStaticParams` or `sitemap.ts`).

### Authentication in Components

```typescript
// Client Component
import { useUser, signIn, signUp, signOut } from '@/lib/auth'

const { user, loading } = useUser()
// user = null if not authenticated
```

### Admin Checks in API Routes

```typescript
// API Route
import { requireUser, requireAdmin } from '@/lib/adminAuth'

export async function GET() {
  const { error, status, supabase, user } = await requireUser()
  // or requireAdmin() for admin-only
}
```

### Cart Operations

```typescript
import { useCartStore } from '@/lib/cartStore'

const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore()

addItem(product)           // adds 1
addItem(product, 3)        // adds 3
removeItem(product.id)
updateQuantity(product.id, 2)

// Display
<p>₹{(total() / 100).toFixed(2)}</p>  // prices in paise
<span>{itemCount()}</span>
```

## Common Development Tasks

### Adding a New API Route

1. Create `app/api/your-route/route.ts`
2. Import auth guard: `requireUser()` or `requireAdmin()`
3. Use `createServerSupabaseClient()` for database operations
4. Return standard response: `{ data?: T, error?: string }`

### Adding a Database Migration

1. Create `supabase/migrations/XXX_description.sql`
2. Use `IF NOT EXISTS` / `DROP IF EXISTS` for idempotency
3. Include RLS policies for new tables
4. Document in README.md migration table
5. Test locally: `supabase db reset`

### Adding a New Page

1. Create `app/(shop)/your-page/page.tsx` (or `(auth)`/`(admin)`)
2. Add to Navbar if needed (`components/layout/Navbar.tsx`)
3. Use appropriate layout (shop, auth, admin)

## Debugging Tips

### Supabase Issues
- Check Supabase Dashboard → Logs → Auth / Database / Realtime
- Use `supabase functions logs` for Edge Functions
- Local: `supabase status` shows all service URLs

### Authentication Issues
- Check browser DevTools → Application → Cookies for `sb-*-auth-token`
- Middleware runs on every request — check server logs for `getUser()` calls
- `useUser()` hook subscribes to `onAuthStateChange` — check React DevTools

### Build Failures
- Run `npx tsc --noEmit` locally to see TypeScript errors
- Check `npm run build` output for Next.js specific errors
- Common: missing environment variables at build time (use `createPublicSupabaseClient` for build-time queries)

## Known Development Issues

1. **Email confirmation broken on localhost** — Supabase redirects to production Site URL
   - Workaround: Set Supabase Site URL to `http://localhost:3000` during local dev
   - See `docs/authentication/signup-flow.md`

2. **No test framework** — Manual testing only

3. **No hot reload for Supabase schema changes** — Restart dev server after migrations

4. **Image upload requires Cloudinary credentials** — Skip if not configured