import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import type { ApiResponse } from "@/types"

export async function GET() {
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  const { data, error: dbError } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })

  if (dbError) {
    return NextResponse.json<ApiResponse<never>>({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json<ApiResponse<unknown[]>>({ data: data ?? [] })
}
