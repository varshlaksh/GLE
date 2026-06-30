import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { ApiResponse, Product } from "@/types"

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category")

  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (category && category !== "All") {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json<ApiResponse<never>>(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResponse<Product[]>>({ data: data ?? [] })
}
