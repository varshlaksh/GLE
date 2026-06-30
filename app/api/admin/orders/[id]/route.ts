import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import type { ApiResponse, Order, OrderStatus, OrderTimelineEntry } from "@/types"

const VALID_STATUSES: OrderStatus[] = [
  "pending","paid","processing","shipped","delivered","cancelled",
]

const STATUS_NOTES: Record<OrderStatus, string> = {
  pending:    "Order received, awaiting payment",
  paid:       "Payment confirmed",
  processing: "Order is being prepared",
  shipped:    "Order has been shipped",
  delivered:  "Order delivered successfully",
  cancelled:  "Order cancelled",
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

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json<ApiResponse<never>>(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    )
  }

  // Fetch current order to get existing history
  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select("status_history")
    .eq("id", id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json<ApiResponse<never>>({ error: "Order not found" }, { status: 404 })
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
    .select("*, items:order_items(*, product:products(*))")
    .single()

  if (dbError || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { error: dbError?.message ?? "Order not found" },
      { status: 404 }
    )
  }

  return NextResponse.json<ApiResponse<Order>>({ data })
}
