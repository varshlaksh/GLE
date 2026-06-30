import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { ApiResponse, Product } from "@/types"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Product not found" },
      { status: 404 }
    )
  }

  return NextResponse.json<ApiResponse<Product>>({ data })
}
