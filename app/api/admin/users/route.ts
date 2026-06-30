import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import { createClient } from "@supabase/supabase-js"
import type { ApiResponse } from "@/types"

export async function GET() {
  const { error, status } = await requireAdmin()
  if (error) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  // Need service role to read auth.users
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    // Fallback: read only from profiles table
    const { createServerSupabaseClient } = await import("@/lib/supabase-server")
    const supabase = await createServerSupabaseClient()
    const { data, error: dbError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
    if (dbError) return NextResponse.json<ApiResponse<never>>({ error: dbError.message }, { status: 500 })
    return NextResponse.json<ApiResponse<unknown[]>>({ data: data ?? [] })
  }

  // Use service role client to get all auth users
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Get auth users list
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authError) {
    return NextResponse.json<ApiResponse<never>>({ error: authError.message }, { status: 500 })
  }

  // Get profiles for extra info (name, phone, role)
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, phone, role, avatar_url, created_at")

  const profileMap = new Map((profiles ?? []).map((p: Record<string, unknown>) => [p.id, p]))

  // Merge auth users with profile data
  const users = (authData.users ?? []).map((u) => {
    const profile = profileMap.get(u.id) as Record<string, unknown> | undefined
    return {
      id:         u.id,
      email:      u.email,
      full_name:  profile?.full_name ?? null,
      phone:      u.phone ?? profile?.phone ?? null,
      role:       (profile?.role as string) ?? "user",
      avatar_url: profile?.avatar_url ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      email_confirmed: !!u.email_confirmed_at,
    }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json<ApiResponse<unknown[]>>({ data: users })
}
