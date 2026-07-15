import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import type { ApiResponse, Product } from "@/types"

export async function GET() {
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  const { data, error: dbError } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .order("created_at", { ascending: false })

  if (dbError) {
    return NextResponse.json<ApiResponse<never>>({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json<ApiResponse<Product[]>>({ data: data ?? [] })
}

interface CreateProductBody {
  name: string
  description: string
  price: number
  images: string[]
  category_id: string
  stock: number
  is_active?: boolean
}

export async function POST(request: Request) {
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  let body: CreateProductBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>({ error: "Invalid request body" }, { status: 400 })
  }

if (!body.name || body.price == null || !body.category_id) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "name, price, and category are required" },
      { status: 400 }
    )
  }
  const { data, error: dbError } = await supabase
    .from("products")
    .insert({
      name: body.name,
      description: body.description ?? "",
      price: body.price,
      images: body.images ?? [],
      category_id: body.category_id,
      stock: body.stock ?? 0,
      is_active: body.is_active ?? true,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json<ApiResponse<never>>({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json<ApiResponse<Product>>({ data }, { status: 201 })
}
