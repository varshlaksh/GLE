import { NextResponse } from "next/server"
import { requireUser } from "@/lib/adminAuth"
import { verifyRazorpaySignature } from "@/lib/razorpay"
import type { ApiResponse } from "@/types"

interface VerifyBody {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

/**
 * Standalone signature check. Note: /api/orders also verifies the
 * signature before writing an order, so this endpoint is mainly useful
 * for client-side "payment succeeded" UI feedback before the order
 * record is created.
 */
export async function POST(request: Request) {
  const { error, status, user } = await requireUser()
  if (error || !user) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  let body: VerifyBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Missing payment verification details" },
      { status: 400 }
    )
  }

  try {
    const success = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })
    return NextResponse.json<ApiResponse<{ success: boolean }>>({ data: { success } })
  } catch (err) {
    return NextResponse.json<ApiResponse<never>>(
      { error: err instanceof Error ? err.message : "Verification failed" },
      { status: 500 }
    )
  }
}
