import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { ApiResponse, StoreSettings } from "@/types"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single()

    if (error || !data) {
      // Table not migrated yet or no row — default to COD disabled
      return NextResponse.json<ApiResponse<StoreSettings>>({
        data: { id: 1, cod_enabled: false, updated_at: new Date().toISOString() },
      })
    }

    return NextResponse.json<ApiResponse<StoreSettings>>({ data })
  } catch {
    return NextResponse.json<ApiResponse<StoreSettings>>({
      data: { id: 1, cod_enabled: false, updated_at: new Date().toISOString() },
    })
  }
}
