-- 0010_idempotency_and_webhooks.sql

-- 1️⃣ Drop every CHECK on public.orders whose pg_get_constraintdef mentions status, then add orders_status_check
DO $$
DECLARE
    c record;
BEGIN
    FOR c IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.orders'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%status%'
    LOOP
        EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS %I', c.conname);
    END LOOP;
END $$;

ALTER TABLE public.orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN (
        'pending','paid','processing','shipped',
        'delivered','cancelled','failed','refunded'));

-- 2️⃣ Partial unique index – one order per successful payment (keep existing)
CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_razorpay_payment_id
    ON public.orders (razorpay_payment_id)
    WHERE razorpay_payment_id IS NOT NULL;

-- 2b️⃣ Unique index on order_items(order_id, product_id)
CREATE UNIQUE INDEX IF NOT EXISTS ux_order_items_order_product
    ON public.order_items (order_id, product_id);

-- 3️⃣ Table for refund tracking
CREATE TABLE IF NOT EXISTS public.order_refunds (
    refund_id   text PRIMARY KEY,
    order_id    uuid REFERENCES public.orders(id),
    payment_id  text,
    amount      integer NOT NULL,
    created_at  timestamptz DEFAULT now()
);

-- Ensure refunded_amount column exists on orders
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS refunded_amount integer NOT NULL DEFAULT 0;

-- 4️⃣ Processed webhook events table (re-runnable)
CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
    event_id     text PRIMARY KEY,
    received_at  timestamptz NOT NULL DEFAULT now()
);

-- Drop all service_role policies
DROP POLICY IF EXISTS "Service role can manage processed_webhook_events" ON public.processed_webhook_events;
DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access order_items" ON public.order_items;

-- Revoke DELETE grant
REVOKE DELETE ON public.processed_webhook_events FROM service_role;

-- Enable RLS with no policies
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_refunds ENABLE ROW LEVEL SECURITY;

-- Revoke all from PUBLIC, anon, authenticated
REVOKE ALL ON public.processed_webhook_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.order_refunds FROM PUBLIC, anon, authenticated;

-- Grant minimal rights to service_role
GRANT SELECT, INSERT ON public.processed_webhook_events, public.order_refunds TO service_role;

-- 5️⃣ Atomic handler – SECURITY INVOKER, schema-qualified, no manual DELETE/exception block
CREATE OR REPLACE FUNCTION public.handle_razorpay_webhook(
    p_event_id text,
    p_payload  jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_event            text;
    v_payment_id       text;
    v_order_id         uuid;
    v_order_total      integer;
    v_order_status     text;
    v_refund_id        text;
    v_refund_status    text;
    v_refund_amount    integer;
    v_refunded_sum     integer;
BEGIN
    -- 1. Try to claim the event
    INSERT INTO public.processed_webhook_events (event_id)
    VALUES (p_event_id)
    ON CONFLICT DO NOTHING
    RETURNING event_id INTO v_event;

    IF v_event IS NULL THEN
        RETURN;  -- duplicate delivery
    END IF;

    -- 2. Extract event type
    v_event := p_payload ->> 'event';

    -- 3. Branch on event type
    IF v_event = 'payment.captured' THEN
        v_payment_id := COALESCE(
            p_payload -> 'payload' -> 'payment' -> 'entity' ->> 'id',
            p_payload -> 'payload' -> 'refund' -> 'entity' ->> 'payment_id'
        );

        IF v_payment_id IS NULL THEN
            RETURN;
        END IF;

        -- Lookup by razorpay_order_id: the order row is created up-front at
        -- create-order time (status 'pending', no payment_id yet), so this
        -- must not depend on razorpay_payment_id already being set.
        SELECT id, total, status INTO v_order_id, v_order_total, v_order_status
        FROM public.orders
        WHERE razorpay_order_id = (p_payload -> 'payload' -> 'payment' -> 'entity' ->> 'order_id');

        IF v_order_id IS NULL THEN
            RAISE EXCEPTION 'order_not_found_for_payment_id %', v_payment_id
                USING ERRCODE = 'P0001';
        END IF;

        IF v_order_status = 'pending' THEN
            IF v_order_total = (p_payload -> 'payload' -> 'payment' -> 'entity' ->> 'amount')::integer THEN
                UPDATE public.orders
                SET status = 'paid',
                    razorpay_payment_id = v_payment_id,
                    status_history = COALESCE(status_history, '[]'::jsonb) ||
                                     jsonb_build_array(jsonb_build_object(
                                         'status', 'paid',
                                         'timestamp', now(),
                                         'note', 'Webhook payment.captured'))
                WHERE id = v_order_id;
            ELSE
                UPDATE public.orders
                SET status_history = COALESCE(status_history, '[]'::jsonb) ||
                                     jsonb_build_array(jsonb_build_object(
                                         'status', 'pending',
                                         'timestamp', now(),
                                         'note', 'Webhook payment.captured amount mismatch'))
                WHERE id = v_order_id;
            END IF;
        END IF;

    ELSIF v_event = 'payment.failed' THEN
        -- Mark the pending order as failed. Guarded by status='pending' so
        -- this can never downgrade an already paid/refunded order.
        UPDATE public.orders
        SET status = 'failed',
            status_history = COALESCE(status_history,'[]'::jsonb) ||
                             jsonb_build_array(jsonb_build_object(
                                 'status','failed',
                                 'timestamp',now(),
                                 'note','Webhook payment.failed'))
        WHERE razorpay_order_id = (p_payload -> 'payload' -> 'payment' -> 'entity' ->> 'order_id')
          AND status = 'pending';
        RETURN;

    ELSIF v_event = 'refund.processed' THEN
        v_refund_id := p_payload -> 'payload' -> 'refund' -> 'entity' ->> 'id';
        v_refund_status := p_payload -> 'payload' -> 'refund' -> 'entity' ->> 'status';
        v_refund_amount := (p_payload -> 'payload' -> 'refund' -> 'entity' ->> 'amount')::integer;
        v_payment_id := COALESCE(
            p_payload -> 'payload' -> 'payment' -> 'entity' ->> 'id',
            p_payload -> 'payload' -> 'refund' -> 'entity' ->> 'payment_id'
        );

        IF v_payment_id IS NULL THEN
            RETURN;
        END IF;

        -- Refunds only ever happen after a payment was captured, so
        -- razorpay_payment_id is guaranteed to be set by this point.
        -- This lookup intentionally stays on razorpay_payment_id.
        SELECT id, total, status INTO v_order_id, v_order_total, v_order_status
        FROM public.orders
        WHERE razorpay_payment_id = v_payment_id;

        IF v_order_id IS NULL THEN
            RAISE EXCEPTION 'order_not_found_for_payment_id %', v_payment_id
                USING ERRCODE = 'P0001';
        END IF;

        -- Insert refund record
        INSERT INTO public.order_refunds (refund_id, order_id, payment_id, amount)
        VALUES (v_refund_id, v_order_id, v_payment_id, v_refund_amount)
        ON CONFLICT (refund_id) DO NOTHING;

        -- Calculate sum of refunds for this order
        SELECT COALESCE(SUM(amount), 0) INTO v_refunded_sum
        FROM public.order_refunds
        WHERE order_id = v_order_id;

        UPDATE public.orders
        SET refunded_amount = v_refunded_sum
        WHERE id = v_order_id;

        IF v_refunded_sum >= v_order_total AND v_order_status <> 'refunded' THEN
            UPDATE public.orders
            SET status = 'refunded',
                status_history = COALESCE(status_history, '[]'::jsonb) ||
                                 jsonb_build_array(jsonb_build_object(
                                     'status', 'refunded',
                                     'timestamp', now(),
                                     'note', 'Webhook refund.processed'))
            WHERE id = v_order_id;
        END IF;

    ELSIF v_event IN ('refund.created', 'refund.failed', 'refund.speed_changed') THEN
        RETURN;

    ELSE
        RETURN;
    END IF;
END;
$$;

-- 6️⃣ Grant execute only to service_role
REVOKE EXECUTE ON FUNCTION public.handle_razorpay_webhook(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_razorpay_webhook(text, jsonb) TO service_role;