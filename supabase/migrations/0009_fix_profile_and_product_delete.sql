-- ============================================================
-- Migration 0009 — Fix missing profile columns + product delete RLS
-- Run in Supabase SQL Editor
-- ============================================================

-- ── Fix 1: Add missing gender + address columns to profiles ───
alter table public.profiles
  add column if not exists gender  text,
  add column if not exists address jsonb;

-- Optional: constrain gender to known values (skip if you want free text)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_gender_check'
  ) then
    alter table public.profiles
      add constraint profiles_gender_check
      check (gender is null or gender in ('male', 'female', 'other', 'prefer_not_to_say'));
  end if;
end $$;

-- ── Fix 2: Ensure admin can DELETE products (RLS policy missing) ──
alter table public.products enable row level security;

-- Public can view active products
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products for select
  using (is_active = true);

-- Admins can view all products (active + inactive)
drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
  on public.products for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can insert products
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can update products
drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can DELETE products — THIS WAS MISSING
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
