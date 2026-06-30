-- ============================================================
-- Migration 0003 — Extend profiles + fix policies
-- Run in Supabase SQL Editor
-- ============================================================

-- Add new columns if they don't exist
alter table public.profiles
  add column if not exists full_name   text,
  add column if not exists phone       text,
  add column if not exists avatar_url  text;

-- Drop old conflicting policies if any
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

-- Users can read their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- Fix: make sure insert policy exists for the trigger
-- (trigger runs as security definer so RLS is bypassed,
--  but add it anyway for safety)
-- ============================================================
create policy "Service can insert profiles"
  on public.profiles for insert
  with check (true);
