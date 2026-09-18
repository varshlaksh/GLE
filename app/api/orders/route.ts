import { NextResponse } from "next/server"
import { requireUser } from "@/lib/adminAuth"
import { verifyRazorpaySignature } from "@/lib/razorpay"
import type { ApiResponse, CartItem, Order, ShippingAddress } from "@/types"

interface CreateOrderBody {
  items: CartItem[]
  shipping_address: ShippingAddress
  payment_method: "online" | "cod"
  // Required when payment_method === "online"
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
}

export async function POST(request: Request) {
  const { error, status, supabase, user } = await requireUser()

  if (error || !user || !supabase) {
    return NextResponse.json<ApiResponse<never>>(
      { error },
      { status }
    )
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

  const {
    items,
    shipping_address,
    payment_method,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = body

  if (!items?.length) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Cart is empty" },
      { status: 400 }
    )
  }

  if (!shipping_address) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Shipping address is required" },
      { status: 400 }
    )
  }

  if (payment_method !== "online" && payment_method !== "cod") {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Invalid payment method" },
      { status: 400 }
    )
  }

  let orderStatus: Order["status"]
  let timelineNote: string

  if (payment_method === "cod") {
    // Server-side check: COD must actually be enabled — never trust the client
    const { data: settings } = await supabase
      .from("store_settings")
      .select("cod_enabled")
      .eq("id", 1)
      .single()

    if (!settings?.cod_enabled) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Cash on Delivery is not available right now" },
        { status: 400 }
      )
    }

    orderStatus = "pending"
    timelineNote = "Order placed — Cash on Delivery"
  } else {
    // Online payment — verify Razorpay signature
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Missing payment verification details" },
        { status: 400 }
      )
    }

    let signatureValid: boolean

    try {
      signatureValid = verifyRazorpaySignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      })
    } catch (err) {
      return NextResponse.json<ApiResponse<never>>(
        {
          error:
            err instanceof Error
              ? err.message
              : "Signature verification failed",
        },
        { status: 500 }
      )
    }

    if (!signatureValid) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Payment verification failed" },
        { status: 400 }
      )
    }

    orderStatus = "paid"
    timelineNote = "Payment confirmed"
  }

  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  )

  const statusHistory = [
    {
      status: "pending",
      timestamp: new Date().toISOString(),
      note: "Order placed",
    },
  ]

  if (orderStatus !== "pending") {
    statusHistory.push({
      status: orderStatus,
      timestamp: new Date().toISOString(),
      note: timelineNote,
    })
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: orderStatus,
      status_history: statusHistory,
      total,
      shipping_address,
      payment_method,

      // Razorpay payment details
      ...(payment_method === "online" && {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature, // FIX: save signature
      }),
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json<ApiResponse<never>>(
      { error: orderError?.message ?? "Failed to create order" },
      { status: 500 }
    )
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)

  if (itemsError) {
    return NextResponse.json<ApiResponse<never>>(
      { error: itemsError.message },
      { status: 500 }
    )
  }

  return NextResponse.json<
    ApiResponse<{ orderId: string; status: string }>
  >({
    data: {
      orderId: order.id,
      status: order.status,
    },
  })
}

export async function GET() {
  const { error, status, supabase, user } = await requireUser()

  if (error || !user || !supabase) {
    return NextResponse.json<ApiResponse<never>>(
      { error },
      { status }
    )
  }

  const { data, error: ordersError } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (ordersError) {
    return NextResponse.json<ApiResponse<never>>(
      { error: ordersError.message },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResponse<Order[]>>({
    data: data ?? [],
  })
}