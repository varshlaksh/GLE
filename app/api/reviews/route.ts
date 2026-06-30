import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { ApiResponse } from "@/types"

export interface Review {
  id: string
  name: string
  email: string
  location: string
  rating: number
  quote: string
  avatar_url: string | null
  is_approved: boolean
  created_at: string
}

// GET /api/reviews — public, returns only approved reviews
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("id,name,location,rating,quote,avatar_url,created_at")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json<ApiResponse<never>>({ error: error.message }, { status: 500 })
  }
  return NextResponse.json<ApiResponse<Review[]>>({ data: data ?? [] })
}

// POST /api/reviews — public, create pending review
export async function POST(request: Request) {
  let body: { name: string; email: string; location?: string; rating: number; quote: string; avatar_url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: "Invalid request" }, { status: 400 })
  }

  if (!body.name?.trim() || !body.email?.trim() || !body.quote?.trim() || !body.rating) {
    return NextResponse.json<ApiResponse<never>>({ error: "name, email, rating and review are required" }, { status: 400 })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return NextResponse.json<ApiResponse<never>>({ error: "Invalid email address" }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      name:      body.name.trim(),
      email:     body.email.trim().toLowerCase(),
      location:  body.location?.trim() ?? "",
      rating:    Math.min(5, Math.max(1, Number(body.rating))),
      quote:     body.quote.trim(),
      avatar_url: body.avatar_url ?? null,
      is_approved: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json<ApiResponse<never>>({ error: error.message }, { status: 500 })
  }

  return NextResponse.json<ApiResponse<Review>>({ data, message: "Review submitted! It will appear after admin approval." }, { status: 201 })
}
