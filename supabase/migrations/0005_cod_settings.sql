-- ============================================================
-- Migration 0005 — Store settings + COD support
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Settings table — single row, key-value style for simplicity
create table if not exists public.store_settings (
  id          int primary key default 1,
  cod_enabled boolean not null default false,
  updated_at  timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.store_settings (id, cod_enabled)
values (1, false)
on conflict (id) do nothing;

alter table public.store_settings enable row level security;

-- Anyone can read settings (needed at checkout to show/hide COD option)
drop policy if exists "Public can view settings" on public.store_settings;
create policy "Public can view settings"
  on public.store_settings for select
  using (true);

-- Only admins can update settings
drop policy if exists "Admins can update settings" on public.store_settings;
create policy "Admins can update settings"
  on public.store_settings for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 2. Add payment_method to orders ('online' | 'cod')
alter table public.orders
  add column if not exists payment_method text not null default 'online'
    check (payment_method in ('online', 'cod'));

-- Razorpay fields are now optional for COD orders (already nullable, no change needed)
