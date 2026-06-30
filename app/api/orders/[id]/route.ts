import { NextResponse } from "next/server"
import { requireUser } from "@/lib/adminAuth"
import type { ApiResponse, Order } from "@/types"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, status, supabase, user } = await requireUser()
  if (error || !user || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  // Check if user is admin — admins can view any order, others only their own
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.role === "admin"

  let query = supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*))")
    .eq("id", id)

  if (!isAdmin) {
    query = query.eq("user_id", user.id)
  }

  const { data, error: orderError } = await query.single()

  if (orderError || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Order not found" },
      { status: 404 }
    )
  }

  return NextResponse.json<ApiResponse<Order>>({ data })
}
