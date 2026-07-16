import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { ApiResponse, Product } from "@/types"

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category")

  const supabase = await createServerSupabaseClient()
  const hasFilter = Boolean(category && category !== "All")

  let query = supabase
    .from("products")
    .select(hasFilter ? "*, categories!inner(name, slug)" : "*, categories(name, slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (hasFilter) {
    query = query.eq("categories.name", category as string)
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