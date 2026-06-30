-- ============================================================
-- Migration 0007 — Customer Reviews with Admin Approval
-- Run in Supabase SQL Editor
-- ============================================================

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  location     text not null default '',
  rating       int  not null check (rating between 1 and 5),
  quote        text not null,
  avatar_url   text,          -- optional Cloudinary avatar
  is_approved  boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Anyone can read approved reviews
drop policy if exists "Public can view approved reviews" on public.reviews;
create policy "Public can view approved reviews"
  on public.reviews for select
  using (is_approved = true);

-- Anyone can submit a review (pending approval)
drop policy if exists "Anyone can insert review" on public.reviews;
create policy "Anyone can insert review"
  on public.reviews for insert
  with check (true);

-- Admins can read all reviews (including pending)
drop policy if exists "Admins can view all reviews" on public.reviews;
create policy "Admins can view all reviews"
  on public.reviews for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can update (approve/reject)
drop policy if exists "Admins can update reviews" on public.reviews;
create policy "Admins can update reviews"
  on public.reviews for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can delete reviews
drop policy if exists "Admins can delete reviews" on public.reviews;
create policy "Admins can delete reviews"
  on public.reviews for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Seed a few approved sample reviews
insert into public.reviews (name, email, location, rating, quote, avatar_url, is_approved) values
  ('Ananya R.', 'ananya@example.com', 'Bengaluru', 5,
   'The basket arrived even better than the photos — you can feel the work that went into it. It''s the first thing people ask about when they visit.',
   'https://api.dicebear.com/7.x/thumbs/svg?seed=ananya&backgroundColor=b6e3f4', true),
  ('Devika M.', 'devika@example.com', 'Pune', 5,
   'Ordered the stoneware set for a housewarming gift and kept it for myself instead. Packaging was careful and the glaze is gorgeous in person.',
   'https://api.dicebear.com/7.x/thumbs/svg?seed=devika&backgroundColor=ffd5dc', true),
  ('Rohan K.', 'rohan@example.com', 'Delhi', 4,
   'Loved being able to read about where each piece comes from. It changes how you think about the things in your home.',
   'https://api.dicebear.com/7.x/thumbs/svg?seed=rohan&backgroundColor=d1f4cc', true)
on conflict do nothing;
