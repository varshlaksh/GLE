# Row Level Security (RLS) Policies

## Overview

All tables in the `public` schema have RLS enabled. Policies are defined in Supabase migrations `0003` through `0009`. This document extracts the **actual policies** from the migration files.

## Tables with RLS

| Table | RLS Enabled | Migration |
|-------|-------------|-----------|
| `profiles` | Yes | 0003, 0004, 0006 |
| `products` | Yes | 0009 |
| `orders` | Yes | (implied by FK to profiles) |
| `order_items` | Yes | (implied by FK to orders) |
| `reviews` | Yes | 0007 |
| `store_settings` | Yes | 0005 |
| `categories` | Unknown | Not in migrations 0003-0009 |

---

## `public.profiles`

**Migrations:** `0003_extend_profiles.sql`, `0004_timeline_profile.sql`, `0006_fix_admin_profiles_policy.sql`

### Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can insert profiles (for auth trigger)
CREATE POLICY "Service can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Admins can view ALL profiles (fixed in 0006)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

### Policy Matrix

| Operation | User (own) | Admin | Service Role | Public |
|-----------|------------|-------|--------------|--------|
| SELECT | ✅ | ✅ | ✅ | ❌ |
| INSERT | ❌ | ❌ | ✅ | ❌ |
| UPDATE | ✅ | ❌* | ✅ | ❌ |
| DELETE | ❌ | ❌ | ✅ | ❌ |

*Admin UPDATE not explicitly granted — would need separate policy

### Notes

- `role` column is `text` with values `'admin'` or `'customer'` (not `is_admin` boolean)
- Migration `0006` fixed a bug where original policy checked `is_admin = true` which never matched
- Trigger `on_auth_user_created` (referenced in AGENTS.md, not in 0003-0009) inserts profile on signup — requires "Service can insert profiles" policy

---

## `public.products`

**Migration:** `0009_fix_profile_and_product_delete.sql`

### Policies

```sql
-- Public can view active products only
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Admins can view all products (active + inactive)
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert products
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update products
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can DELETE products (THIS WAS MISSING before 0009)
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Policy Matrix

| Operation | Public | Admin | Service Role |
|-----------|--------|-------|--------------|
| SELECT (active) | ✅ | ✅ | ✅ |
| SELECT (inactive) | ❌ | ✅ | ✅ |
| INSERT | ❌ | ✅ | ✅ |
| UPDATE | ❌ | ✅ | ✅ |
| DELETE | ❌ | ✅ | ✅ |

### Notes

- `is_active` boolean controls public visibility
- Migration `0009` added the missing DELETE policy
- Slug generation via trigger `products_slug_trigger` (migration `0008`) runs as SECURITY DEFINER, bypassing RLS

---

## `public.reviews`

**Migrations:** `0007_reviews.sql`, `0012_secure_review_submissions.sql`

### Policies

```sql
-- Anyone can read approved reviews
CREATE POLICY "Public can view approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

-- Anonymous visitors and signed-in customers can submit pending reviews
GRANT INSERT ON TABLE public.reviews TO anon, authenticated;

CREATE POLICY "Public can submit pending reviews"
  ON public.reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (is_approved = false);

-- Admins can read all reviews (including pending)
CREATE POLICY "Admins can view all reviews"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update (approve/reject) reviews
CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Policy Matrix

| Operation | Public | Admin | Service Role |
|-----------|--------|-------|--------------|
| SELECT (approved) | ✅ | ✅ | ✅ |
| SELECT (pending) | ❌ | ✅ | ✅ |
| INSERT | ✅ | ✅ | ✅ |
| UPDATE | ❌ | ✅ | ✅ |
| DELETE | ❌ | ✅ | ✅ |

### Notes

- Reviews default to `is_approved = false`, and the INSERT policy rejects attempts to set it to `true`
- The public API does not request the inserted pending row back, because public SELECT policies intentionally hide pending reviews
- No user ownership check on INSERT — anyone can submit as any name/email
- Admin approval workflow: admin updates `is_approved` to `true`

---

## `public.store_settings`

**Migration:** `0005_cod_settings.sql`

### Policies

```sql
-- Anyone can read settings (needed at checkout)
CREATE POLICY "Public can view settings"
  ON public.store_settings FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON public.store_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Policy Matrix

| Operation | Public | Admin | Service Role |
|-----------|--------|-------|--------------|
| SELECT | ✅ | ✅ | ✅ |
| UPDATE | ❌ | ✅ | ✅ |
| INSERT | ❌* | ❌* | ✅ |
| DELETE | ❌ | ❌ | ✅ |

*Table has single-row constraint (`id = 1`), INSERT only via migration seed

### Notes

- Single-row table (`id` primary key with `CHECK (id = 1)`)
- Controls `cod_enabled` boolean for Cash on Delivery toggle
- Read at checkout to show/hide COD option

---

## `public.orders` & `public.order_items`

**Not explicitly in migrations 0003-0009** — policies inferred from:
- `orders.user_id` references `auth.users.id`
- `order_items.order_id` references `orders.id`
- API routes use `requireUser()` which enforces ownership via `.eq('user_id', user.id)`

### Expected Policies (Standard Pattern)

```sql
-- Orders: users see own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

-- Order items: users see items from own orders
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins see all
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
```

### Verification Needed

Check actual policies in Supabase Dashboard → Authentication → Policies for `orders` and `order_items` tables.

---

## `public.categories`

**Not in migrations 0003-0009** — RLS status unknown.

### Likely Policies

```sql
-- Public read access for navigation
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
```

---

## Admin Access Pattern

All admin policies use the same pattern:

```sql
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
```

This requires:
1. User authenticated (`auth.uid()` not null)
2. Profile row exists for user
3. Profile `role = 'admin'`

Set admin role manually in database:
```sql
UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';
```

---

## Service Role Bypass

`createServiceSupabaseClient()` uses `SUPABASE_SERVICE_ROLE_KEY` which:
- Bypasses ALL RLS policies
- Used in: `app/api/admin/users/route.ts` (when service key available)
- **Never expose to client** — server-only

---

## Policy Testing Checklist

| Table | Public Read | User Own Write | Admin Full | Service Bypass |
|-------|-------------|----------------|------------|----------------|
| profiles | ❌ (own only) | ✅ UPDATE | ✅ SELECT | ✅ |
| products | ✅ (active) | ❌ | ✅ CRUD | ✅ |
| reviews | ✅ (approved) | ✅ INSERT | ✅ CRUD | ✅ |
| store_settings | ✅ | ❌ | ✅ UPDATE | ✅ |
| orders | ❓ (expected own) | ❓ | ❓ | ✅ |
| order_items | ❓ (expected own) | ❓ | ❓ | ✅ |
| categories | ❓ | ❌ | ❓ | ✅ |

---

## Adding New Policies

1. Create new migration: `supabase/migrations/XXX_new_policy.sql`
2. Use `DROP POLICY IF EXISTS` before `CREATE POLICY`
3. Test with:
   - Unauthenticated request
   - Authenticated non-admin user
   - Authenticated admin user
   - Service role client
4. Document in this file
