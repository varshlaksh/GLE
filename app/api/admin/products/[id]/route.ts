import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import { createServiceSupabaseClient } from "@/lib/supabase-server"
import type { ApiResponse, Product } from "@/types"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Step 1 — verify admin identity first (uses anon cookie client)
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  // Step 2 — use service client for DB mutations (bypasses RLS safely)
  // Safe because requireAdmin() already confirmed this is an admin
  const db = createServiceSupabaseClient()

  // Step 3 — check if product has orders
  const { data: orderItems } = await db
    .from("order_items")
    .select("id")
    .eq("product_id", id)
    .limit(1)

  if (orderItems && orderItems.length > 0) {
    // Has orders — archive instead of delete
    const { error: archiveError } = await db
      .from("products")
      .update({ is_archived: true, is_active: false })
      .eq("id", id)

    if (archiveError) {
      return NextResponse.json<ApiResponse<never>>(
        { error: archiveError.message },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<{ id: string; archived: boolean }>>({
      data: { id, archived: true },
    })
  }

  // No orders — hard delete
  const { data, error: dbError } = await db
    .from("products")
    .delete()
    .eq("id", id)
    .select()

  if (dbError) {
    return NextResponse.json<ApiResponse<never>>({ error: dbError.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Product was not deleted — check that the delete RLS policy exists for admins." },
      { status: 403 }
    )
  }

  return NextResponse.json<ApiResponse<{ id: string; archived: boolean }>>({
    data: { id, archived: false },
  })
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

  const db = createServiceSupabaseClient()

  let body: Partial<Product>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: "Invalid request body" }, { status: 400 })
  }

  const { id: _id, created_at: _createdAt, ...updates } = body

  const { data, error: dbError } = await db
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (dbError || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { error: dbError?.message ?? "Product not found" },
      { status: 404 }
    )
  }

  return NextResponse.json<ApiResponse<Product>>({ data })
}