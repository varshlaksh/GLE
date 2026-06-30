import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import type { ApiResponse, StoreSettings } from "@/types"

export async function GET() {
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  const { data, error: dbError } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single()

  if (dbError || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { error: dbError?.message ?? "Settings not found" },
      { status: 404 }
    )
  }

  return NextResponse.json<ApiResponse<StoreSettings>>({ data })
}

export async function PATCH(request: Request) {
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  let body: { cod_enabled?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: "Invalid body" }, { status: 400 })
  }

  if (typeof body.cod_enabled !== "boolean") {
    return NextResponse.json<ApiResponse<never>>(
      { error: "cod_enabled must be a boolean" },
      { status: 400 }
    )
  }

  const { data, error: dbError } = await supabase
    .from("store_settings")
    .update({ cod_enabled: body.cod_enabled, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single()

  if (dbError || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { error: dbError?.message ?? "Could not update settings" },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResponse<StoreSettings>>({ data })
}
