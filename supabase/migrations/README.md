# Migrations — what actually ran

Lakshya's Supabase project already had `products`, `orders`, `order_items`,
and `profiles` tables before this batch of work started, with a schema
that differs from this repo's *original* planning migration
(`0001_phase3_orders_admin.sql` / `0002_promote_admin.sql`). Those two
files are kept for reference only (renamed `.sql.bak`) — **do not run
them** against this project; they reference a column (`profiles.is_admin`)
that doesn't exist in the real schema (`profiles.role` is used instead).

## Actual run order, against the real DB

1. `0003_extend_profiles.sql` — adds `full_name`, `phone`, `avatar_url` to
   `profiles`; re-creates the self-view/self-update policies correctly.
2. `0004_timeline_profile.sql` — adds `orders.status_history`, plus
   `profiles.gender` and `profiles.address`.
3. `0005_cod_settings.sql` — creates `store_settings` table (COD toggle)
   and adds `orders.payment_method`.
4. `0006_fix_admin_profiles_policy.sql` — fixes a broken
   `is_admin`-based RLS policy left over from the unused `0001` file so
   that `/admin/users` can actually see all profiles.

## Manually-applied fixes (not in a migration file — run once, already done)

These were run ad hoc in the Supabase SQL editor while debugging and are
**not** captured as `.sql` files in this repo. If you ever rebuild this
DB from scratch, you'll also need:

```sql
-- orders: insert policy (was missing entirely)
create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- orders: update policy, for admin status changes (was missing entirely)
create policy "Admins can update orders"
  on public.orders for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- order_items: insert policy (was missing entirely)
create policy "Users can insert own order items"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
```

If `/admin/orders` or checkout ever throws an RLS error again, check
`pg_policies` for the table in question first:

```sql
select policyname, cmd, qual, with_check
from pg_policies
where tablename = '<table_name>'
order by cmd;
```
