import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import type { ApiResponse } from "@/types"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  let body: { is_approved: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: "Invalid request" }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from("reviews")
    .update({ is_approved: body.is_approved })
    .eq("id", id)
    .select()
    .single()

  if (dbError || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { error: dbError?.message ?? "Review not found" },
      { status: 404 }
    )
  }

  return NextResponse.json<ApiResponse<unknown>>({ data })
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

  const { error: dbError } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)

  if (dbError) {
    return NextResponse.json<ApiResponse<never>>({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json<ApiResponse<{ id: string }>>({ data: { id } })
}
