import { NextResponse } from "next/server"
import { requireUser } from "@/lib/adminAuth"
import { createRazorpayOrder, cartHash } from "@/lib/razorpay"
import { createServiceSupabaseClient } from "@/lib/supabase-server"
import type { ApiResponse } from "@/types"

interface CartItemInput {
  productId: string
  quantity: number
}

interface CreateOrderBody {
  items: CartItemInput[]
}

const MAX_QUANTITY = 99
const MAX_ORDER_AMOUNT_PAISE = 10_000_000 // ₹1,00,000

export async function POST(request: Request) {
  const { error, status, user, supabase } = await requireUser()
  if (error || !user || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  let body: CreateOrderBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }

  if (!body.items?.length) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Cart is empty" },
      { status: 400 }
    )
  }

  const productIds = body.items.map((i) => i.productId)
  const uniqueProductIds = [...new Set(productIds)]
  if (uniqueProductIds.length !== productIds.length) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Duplicate products in cart" },
      { status: 400 }
    )
  }

  for (const item of body.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return NextResponse.json<ApiResponse<never>>(
        { error: `Invalid quantity for product ${item.productId}` },
        { status: 400 }
      )
    }
    if (item.quantity > MAX_QUANTITY) {
      return NextResponse.json<ApiResponse<never>>(
        { error: `Quantity exceeds maximum allowed (${MAX_QUANTITY})` },
        { status: 400 }
      )
    }
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price, stock, is_active")
    .in("id", uniqueProductIds)

  if (productsError) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Failed to fetch product prices" },
      { status: 500 }
    )
  }

  if (!products || products.length !== uniqueProductIds.length) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "One or more products not found" },
      { status: 404 }
    )
  }

  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const item of body.items) {
    const product = productMap.get(item.productId)
    if (!product?.is_active) {
      return NextResponse.json<ApiResponse<never>>(
        { error: `Product ${item.productId} is not available` },
        { status: 400 }
      )
    }
    if (product.stock < item.quantity) {
      return NextResponse.json<ApiResponse<never>>(
        { error: `Insufficient stock for product ${item.productId}` },
        { status: 400 }
      )
    }
  }

  let totalPaise = 0
  for (const item of body.items) {
    const product = productMap.get(item.productId)!
    totalPaise += product.price * item.quantity
  }

  if (totalPaise <= 0 || totalPaise > MAX_ORDER_AMOUNT_PAISE) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Invalid order amount" },
      { status: 400 }
    )
  }

  try {
    const hash = cartHash(body.items)
    const razorpayOrder = await createRazorpayOrder({
      amount: totalPaise,
      receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { user_id: user.id, cart_hash: hash },
    })

    // Persist a pending order locally right away (service role – bypasses RLS).
    // This is what lets the webhook find a matching row even if it arrives
    // before the browser's own /api/orders confirmation call finishes.
    const serviceSupabase = createServiceSupabaseClient()

    const statusHistory = [
      {
        status: "pending",
        timestamp: new Date().toISOString(),
        note: "Order placed",
      },
    ]

    const { data: order, error: orderError } = await serviceSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        status_history: statusHistory,
        total: totalPaise,
        shipping_address: {},
        payment_method: "online",
        razorpay_order_id: razorpayOrder.id,
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Failed to initialize order" },
        { status: 500 }
      )
    }

    const orderItems = body.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: productMap.get(item.productId)!.price,
    }))

    const { error: itemsError } = await serviceSupabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Failed to initialize order" },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<{ razorpayOrderId: string; amount: number; currency: string }>>({
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    })
  } catch (err) {
    return NextResponse.json<ApiResponse<never>>(
      { error: err instanceof Error ? err.message : "Failed to create payment order" },
      { status: 500 }
    )
  }
}