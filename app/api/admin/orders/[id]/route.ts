import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import type { ApiResponse, Order, OrderStatus, OrderTimelineEntry } from "@/types"
import {
  canAdminTransitionOrder,
  isOrderStatus,
  ORDER_STATUSES,
} from "@/lib/order-status"

const STATUS_NOTES: Record<OrderStatus, string> = {
  pending:    "Order received, awaiting payment",
  paid:       "Payment confirmed",
  processing: "Order is being prepared",
  shipped:    "Order has been shipped",
  delivered:  "Order delivered successfully",
  cancelled:  "Order cancelled",
  failed:     "Payment failed",
  refunded:   "Payment refunded",
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  let body: { status?: OrderStatus; note?: string }
  try { body = await request.json() }
  catch { return NextResponse.json<ApiResponse<never>>({ error: "Invalid body" }, { status: 400 }) }

  if (!isOrderStatus(body.status)) {
    return NextResponse.json<ApiResponse<never>>(
      { error: `status must be one of: ${ORDER_STATUSES.join(", ")}` },
      { status: 400 }
    )
  }

  // Fetch current order to get existing history
  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select("status, status_history")
    .eq("id", id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json<ApiResponse<never>>({ error: "Order not found" }, { status: 404 })
  }

  if (!isOrderStatus(existing.status)) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "This order has an unsupported status" },
      { status: 409 }
    )
  }

  if (!canAdminTransitionOrder(existing.status, body.status)) {
    return NextResponse.json<ApiResponse<never>>(
      {
        error:
          existing.status === "pending" && body.status === "paid"
            ? "Payment confirmation is controlled by Razorpay and cannot be set manually"
            : `Cannot change order status from ${existing.status} to ${body.status}`,
      },
      { status: 409 }
    )
  }

  const newEntry: OrderTimelineEntry = {
    status:    body.status,
    timestamp: new Date().toISOString(),
    note:      body.note ?? STATUS_NOTES[body.status],
  }

  const updatedHistory = [
    ...(existing.status_history ?? []),
    newEntry,
  ]

  const { data, error: dbError } = await supabase
    .from("orders")
    .update({
      status:         body.status,
      status_history: updatedHistory,
    })
    .eq("id", id)
    .eq("status", existing.status)
    .select("*, items:order_items(*, product:products(*))")
    .maybeSingle()

  if (dbError) {
    return NextResponse.json<ApiResponse<never>>(
      { error: dbError.message },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Order status changed elsewhere. Refresh and try again." },
      { status: 409 }
    )
  }

  return NextResponse.json<ApiResponse<Order>>({ data })
}
