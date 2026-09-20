import { NextResponse } from "next/server"
import { requireUser } from "@/lib/adminAuth"
import { verifyRazorpaySignature, fetchRazorpayPayment, fetchRazorpayOrder, cartHash } from "@/lib/razorpay"
import { createServiceSupabaseClient } from "@/lib/supabase-server"
import type { ApiResponse, Order, ShippingAddress } from "@/types"

interface CartItemInput {
  productId: string
  quantity: number
}

interface CreateOrderBody {
  items: CartItemInput[]
  shipping_address: ShippingAddress
  payment_method: "online" | "cod"
  // Required when payment_method === "online"
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
}

const MAX_QUANTITY = 99
const MAX_ORDER_AMOUNT_PAISE = 10_000_000 // ₹1,00,000

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

  const productIds = items.map((i) => i.productId)
  const uniqueProductIds = [...new Set(productIds)]
  if (uniqueProductIds.length !== productIds.length) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Duplicate products in cart" },
      { status: 400 }
    )
  }

  for (const item of items) {
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

  for (const item of items) {
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
  for (const item of items) {
    const product = productMap.get(item.productId)!
    totalPaise += product.price * item.quantity
  }

  if (totalPaise <= 0 || totalPaise > MAX_ORDER_AMOUNT_PAISE) {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Invalid order amount" },
      { status: 400 }
    )
  }

  let orderStatus: Order["status"]
  let timelineNote: string

  if (payment_method === "cod") {
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

    // Fetch payment and order from Razorpay for additional validation
    let payment: Awaited<ReturnType<typeof fetchRazorpayPayment>>
    let rpOrder: Awaited<ReturnType<typeof fetchRazorpayOrder>>
    try {
      payment = await fetchRazorpayPayment(razorpay_payment_id)
      rpOrder = await fetchRazorpayOrder(razorpay_order_id)
    } catch (err) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Failed to fetch payment details from Razorpay" },
        { status: 500 }
      )
    }

    // Handle authorized status with retries
    if (payment.status === "authorized") {
      for (let attempt = 0; attempt < 3; attempt++) {
        await new Promise(res => setTimeout(res, 1000))
        try {
          payment = await fetchRazorpayPayment(razorpay_payment_id)
        } catch {
          // ignore fetch errors during retry
        }
        if (payment.status === "captured") break
      }
      if (payment.status !== "captured") {
        return NextResponse.json<ApiResponse<never>>(
          { error: "Payment not captured yet" },
          { status: 409 }
        )
      }
    } else if (payment.status !== "captured") {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Payment not captured" },
        { status: 400 }
      )
    }

    // Validate payment and order details
    const expectedHash = cartHash(items)
    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== totalPaise ||
      payment.currency !== "INR" ||
      rpOrder.amount !== totalPaise ||
      rpOrder.notes?.user_id !== user.id ||
      rpOrder.notes?.cart_hash !== expectedHash
    ) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Payment details mismatch" },
        { status: 400 }
      )
    }

    orderStatus = "paid"
    timelineNote = "Payment confirmed"
  }

  const serviceSupabase = createServiceSupabaseClient()

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

  let order;

  if (payment_method === "online" && razorpay_payment_id) {
    // Attempt insert; on unique conflict fetch existing and verify ownership
    const { data: inserted, error: insertError } = await serviceSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: orderStatus,
        status_history: statusHistory,
        total: totalPaise,
        shipping_address,
        payment_method,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      })
      .select()
      .single();

    if (!insertError) {
      order = inserted!;
    } else if (insertError.code === "23505") {
      // Unique conflict on razorpay_payment_id – fetch existing order
      const { data: existing, error: fetchError } = await serviceSupabase
        .from("orders")
        .select("*")
        .eq("razorpay_payment_id", razorpay_payment_id)
        .maybeSingle();

      if (fetchError || !existing) {
        return NextResponse.json<ApiResponse<never>>(
          { error: fetchError?.message ?? "Failed to resolve existing order" },
          { status: 500 }
        );
      }
      if (existing.user_id !== user.id || existing.razorpay_order_id !== razorpay_order_id) {
        return NextResponse.json<ApiResponse<never>>(
          { error: "Order ownership mismatch" },
          { status: 400 }
        );
      }
      order = existing;
    } else {
      return NextResponse.json<ApiResponse<never>>(
        { error: insertError.message ?? "Failed to create order" },
        { status: 500 }
      );
    }
  } else {
    // COD or other methods – normal insert
    const { data: inserted, error: insertError } = await serviceSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: orderStatus,
        status_history: statusHistory,
        total: totalPaise,
        shipping_address,
        payment_method,
        ...(payment_method === "online" && {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }),
      })
      .select()
      .single();

    if (insertError || !inserted) {
      return NextResponse.json<ApiResponse<never>>(
        { error: insertError?.message ?? "Failed to create order" },
        { status: 500 }
      );
    }
    order = inserted;
  }

  // Insert order_items with upsert (ignore duplicates) for both new and existing orders
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: productMap.get(item.productId)!.price,
  }));

  const { error: itemsError } = await serviceSupabase
    .from("order_items")
    .upsert(orderItems, { onConflict: "order_id,product_id", ignoreDuplicates: true });

  if (itemsError) {
    return NextResponse.json<ApiResponse<never>>(
      { error: itemsError.message },
      { status: 500 }
    );
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