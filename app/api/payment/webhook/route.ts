import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  // 1️⃣ Raw body required for HMAC verification
  const rawBody = await req.text();
  const hdrs = await headers();
  const signature = hdrs.get('x-razorpay-signature') ?? '';
  const eventId = hdrs.get('x-razorpay-event-id') ?? '';

  if (!eventId) {
    return NextResponse.json({ error: 'Missing x-razorpay-event-id header' }, { status: 400 });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  // Constant-time comparison
  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 2️⃣ Parse JSON payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  // 3️⃣ Call atomic DB function via service‑role RPC
  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.rpc('handle_razorpay_webhook', {
    p_event_id: eventId,
    p_payload: payload,
  });

  if (error) {
    const code = error?.code;
    let status = 500;
    if (code === 'P0001') status = 500;
    console.error('Webhook handling failed', error);
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ received: true });
}