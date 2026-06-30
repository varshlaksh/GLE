-- ============================================================
-- Migration 0004 — Order timeline + extended profile
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add status_history to orders (JSONB array of {status, timestamp, note})
alter table public.orders
  add column if not exists status_history jsonb not null default '[]'::jsonb;

-- 2. Backfill existing orders with their current status as first history entry
update public.orders
set status_history = jsonb_build_array(
  jsonb_build_object(
    'status', status,
    'timestamp', created_at,
    'note', 'Order placed'
  )
)
where status_history = '[]'::jsonb;

-- 3. Extend profiles with gender + address
alter table public.profiles
  add column if not exists full_name   text,
  add column if not exists phone       text,
  add column if not exists avatar_url  text,
  add column if not exists gender      text check (gender in ('male','female','other','prefer_not_to_say')),
  add column if not exists address     jsonb;  
  -- address shape: { line1, line2, city, state, pincode }

-- 4. Allow users to update their own profile (safe to re-run)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Service can insert profiles" on public.profiles;
create policy "Service can insert profiles"
  on public.profiles for insert
  with check (true);
