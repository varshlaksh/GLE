// lib/adminAuth.ts
// Server-only helper for admin API routes.
// NOTE: Supabase schema uses `role` (text) column in profiles table.
// Admin check: role = 'admin'
import { createServerSupabaseClient } from "./supabase-server"

export async function requireAdmin() {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: "Unauthorized" as const, status: 401 as const, supabase: null, user: null }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    return { error: "Forbidden" as const, status: 403 as const, supabase: null, user: null }
  }

  return { error: null, status: 200 as const, supabase, user }
}

export async function requireUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { error: "Unauthorized" as const, status: 401 as const, supabase: null, user: null }
  }
  return { error: null, status: 200 as const, supabase, user }
}
