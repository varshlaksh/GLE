-- Allow public review submissions while ensuring they always enter moderation.
-- This migration is intentionally separate from 0011_security_hardening.sql.

grant insert on table public.reviews to anon, authenticated;

drop policy if exists "Anyone can insert review" on public.reviews;
drop policy if exists "Public can submit pending reviews" on public.reviews;

create policy "Public can submit pending reviews"
  on public.reviews
  for insert
  to anon, authenticated
  with check (is_approved = false);
