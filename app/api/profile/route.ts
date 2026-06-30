import { NextResponse } from "next/server"
import { requireUser } from "@/lib/adminAuth"
import type { ApiResponse, Profile, Gender, ProfileAddress } from "@/types"

export async function GET() {
  const { error, status, supabase, user } = await requireUser()
  if (error || !user || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  const { data, error: dbError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (dbError || !data) {
    return NextResponse.json<ApiResponse<never>>({ error: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json<ApiResponse<Profile>>({ data })
}

export async function PATCH(request: Request) {
  const { error, status, supabase, user } = await requireUser()
  if (error || !user || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  let body: {
    full_name?:  string
    phone?:      string
    avatar_url?: string
    gender?:     Gender
    address?:    ProfileAddress
  }
  try { body = await request.json() }
  catch { return NextResponse.json<ApiResponse<never>>({ error: "Invalid body" }, { status: 400 }) }

  const updates: Record<string, unknown> = {}
  if (body.full_name  !== undefined) updates.full_name  = body.full_name
  if (body.phone      !== undefined) updates.phone      = body.phone
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url
  if (body.gender     !== undefined) updates.gender     = body.gender
  if (body.address    !== undefined) updates.address    = body.address

  const { data, error: dbError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single()

  if (dbError || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { error: dbError?.message ?? "Could not update profile" },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResponse<Profile>>({ data })
}
