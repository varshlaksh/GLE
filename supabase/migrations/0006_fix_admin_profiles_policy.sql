-- ============================================================
-- Migration 0006 — Fix admin profile visibility (Users page bug)
-- Run in Supabase SQL Editor
-- ============================================================
-- The original "Admins can view all profiles" policy (from migration
-- 0001) checked `is_admin = true`, but this project's actual schema
-- uses a `role` text column ('admin' | 'customer'), not `is_admin`.
-- That mismatch means the policy never matched anything, so the
-- Admin > Users page could return an empty/forbidden result even for
-- a real admin. This migration drops the broken policy and recreates
-- it correctly against `role = 'admin'`.

drop policy if exists "Admins can view all profiles" on public.profiles;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Verify: as an admin, this should now return every row (not just your own)
-- select id, role, full_name from public.profiles;
