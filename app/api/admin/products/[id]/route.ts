import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import type { ApiResponse, Product } from "@/types"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  let body: Partial<Product>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: "Invalid request body" }, { status: 400 })
  }

  // Never allow id/created_at to be overwritten via this endpoint
  const { id: _id, created_at: _createdAt, ...updates } = body

  const { data, error: dbError } = await supabase
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  const { data, error: dbError } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select()

  if (dbError) {
    return NextResponse.json<ApiResponse<never>>({ error: dbError.message }, { status: 500 })
  }

  // RLS can silently block deletes (0 rows affected, no error thrown)
  if (!data || data.length === 0) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Product was not deleted — check that the delete RLS policy exists for admins." },
      { status: 403 }
    )
  }

  return NextResponse.json<ApiResponse<{ id: string }>>({ data: { id } })
}
