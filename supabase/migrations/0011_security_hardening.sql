DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
REVOKE EXECUTE ON FUNCTION public.create_order(uuid, jsonb, jsonb) FROM PUBLIC, anon, authenticated;