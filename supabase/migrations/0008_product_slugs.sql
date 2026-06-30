-- ============================================================
-- Migration 0008 — SEO-friendly slugs for products
-- Run in Supabase SQL Editor
-- ============================================================

-- Add slug column
alter table public.products
  add column if not exists slug text;

-- Slug generator function
create or replace function generate_slug(input text)
returns text language plpgsql as $$
declare
  result text;
begin
  result := lower(input);
  result := regexp_replace(result, '[àáâãäå]', 'a', 'g');
  result := regexp_replace(result, '[èéêë]', 'e', 'g');
  result := regexp_replace(result, '[ìíîï]', 'i', 'g');
  result := regexp_replace(result, '[òóôõö]', 'o', 'g');
  result := regexp_replace(result, '[ùúûü]', 'u', 'g');
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(both '-' from result);
  return result;
end;
$$;

-- Backfill slugs for existing products (handle duplicates with id suffix)
do $$
declare
  rec record;
  base_slug text;
  final_slug text;
  counter int;
begin
  for rec in select id, name from public.products where slug is null loop
    base_slug := generate_slug(rec.name);
    final_slug := base_slug;
    counter := 1;
    -- Ensure uniqueness
    while exists (select 1 from public.products where slug = final_slug and id != rec.id) loop
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    end loop;
    update public.products set slug = final_slug where id = rec.id;
  end loop;
end;
$$;

-- Make slug unique and not null
alter table public.products
  alter column slug set not null;

create unique index if not exists products_slug_idx on public.products(slug);

-- Auto-generate slug on insert/update trigger
create or replace function set_product_slug()
returns trigger language plpgsql as $$
declare
  base_slug text;
  final_slug text;
  counter int := 1;
begin
  if NEW.slug is null or NEW.slug = '' then
    base_slug := generate_slug(NEW.name);
    final_slug := base_slug;
    while exists (select 1 from public.products where slug = final_slug and id != NEW.id) loop
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    end loop;
    NEW.slug := final_slug;
  end if;
  return NEW;
end;
$$;

drop trigger if exists products_slug_trigger on public.products;
create trigger products_slug_trigger
  before insert or update of name on public.products
  for each row execute function set_product_slug();
