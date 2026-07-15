import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/adminAuth"
import { createClient } from "@supabase/supabase-js"
import type { AdminDashboardStats, ApiResponse, Order } from "@/types"

export async function GET() {
  const { error, status, supabase } = await requireAdmin()
  if (error || !supabase) {
    return NextResponse.json<ApiResponse<never>>({ error }, { status })
  }

  // Parallel queries
const [ordersRes, productsRes, profilesRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status, total, created_at, items:order_items(product:products(category_id, categories(name)))")
      .order("created_at", { ascending: false }),
    supabase.from("products").select("id, stock, category_id, categories(name)"),
    supabase.from("profiles").select("id, created_at"),
  ])

  if (ordersRes.error)    return NextResponse.json<ApiResponse<never>>({ error: ordersRes.error.message },    { status: 500 })
  if (productsRes.error)  return NextResponse.json<ApiResponse<never>>({ error: productsRes.error.message },  { status: 500 })
  if (profilesRes.error)  return NextResponse.json<ApiResponse<never>>({ error: profilesRes.error.message },  { status: 500 })

  const orders   = ordersRes.data   ?? []
  const products = productsRes.data ?? []
  const profiles = profilesRes.data ?? []

  // ── Basic stats ─────────────────────────────────────
  const paidOrders = orders.filter(o =>
    o.status !== "pending" && o.status !== "cancelled"
  )
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total ?? 0), 0)

  // ── Revenue by day (last 30 days) ───────────────────
  const revenueMap: Record<string, number> = {}
  paidOrders.forEach(o => {
    const day = o.created_at.slice(0, 10) // "YYYY-MM-DD"
    revenueMap[day] = (revenueMap[day] ?? 0) + (o.total ?? 0)
  })
  const revenueByDay = Object.entries(revenueMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, revenue]) => ({ date, revenue }))

  // ── Orders by status ────────────────────────────────
  const statusMap: Record<string, number> = {}
  orders.forEach(o => {
    statusMap[o.status] = (statusMap[o.status] ?? 0) + 1
  })
  const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }))

  // ── Top categories ───────────────────────────────────
const catMap: Record<string, number> = {}
  products.forEach(p => {
   const catName = (p as unknown as { categories?: { name: string } | null }).categories?.name
    if (catName) catMap[catName] = (catMap[catName] ?? 0) + 1
  })
  const topCategories = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  // ── Recent 5 orders ──────────────────────────────────
  const recentOrders = orders.slice(0, 5) as unknown as Order[]

  const stats: AdminDashboardStats = {
    totalRevenue,
    totalOrders:      orders.length,
    pendingOrders:    orders.filter(o => o.status === "pending").length,
    totalProducts:    products.length,
    lowStockProducts: products.filter(p => (p.stock ?? 0) <= 5).length,
    totalUsers:       profiles.length,
    revenueByDay,
    ordersByStatus,
    topCategories,
    recentOrders,
  }

  return NextResponse.json<ApiResponse<AdminDashboardStats>>({ data: stats })
}
