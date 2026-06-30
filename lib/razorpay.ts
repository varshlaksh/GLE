// lib/razorpay.ts
// Server-only helpers for creating and verifying Razorpay orders.
// Requires RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET in env (.env.local).
import crypto from "crypto"

const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1"

function getAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured in environment variables")
  }
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
  return `Basic ${credentials}`
}

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  status: string
  receipt?: string
}

/**
 * Create a Razorpay order for the given amount (in paise).
 */
export async function createRazorpayOrder(params: {
  amount: number // paise
  currency?: string
  receipt: string
  notes?: Record<string, string>
}): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency ?? "INR",
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Razorpay order creation failed: ${text}`)
  }

  return res.json()
}

/**
 * Verify the signature returned by Razorpay Checkout after a successful
 * payment. Uses HMAC SHA256 with the key secret as per Razorpay docs.
 */
export function verifyRazorpaySignature(params: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured")
  }

  const body = `${params.orderId}|${params.paymentId}`
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex")

  return expectedSignature === params.signature
}
