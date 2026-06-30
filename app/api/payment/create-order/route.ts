import { NextResponse } from "next/server"
import { requireUser } from "@/lib/adminAuth"
import { createRazorpayOrder } from "@/lib/razorpay"
import type { ApiResponse } from "@/types"

interface CreateOrderBody {
  amount: number // paise
}

export async function POST(request: Request) {
  const { error, status, user } = await requireUser()
  if (error || !user) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  let body: CreateOrderBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }

  if (!body.amount || body.amount <= 0) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Amount must be greater than 0" },
      { status: 400 }
    )
  }

  try {
    const razorpayOrder = await createRazorpayOrder({
      amount: body.amount,
      receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { user_id: user.id },
    })

    return NextResponse.json<ApiResponse<{ razorpayOrderId: string; amount: number; currency: string }>>({
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    })
  } catch (err) {
    return NextResponse.json<ApiResponse<never>>(
      { error: err instanceof Error ? err.message : "Failed to create payment order" },
      { status: 500 }
    )
  }
}
