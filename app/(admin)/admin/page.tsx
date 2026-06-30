"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatPrice } from "@/lib/mockData";
import type { AdminDashboardStats, Order } from "@/types";

const PIE_COLORS = ["#b3553c", "#6b7a5e", "#e0c9a6", "#2b2420", "#92402b", "#8fa88a", "#d4956a"];

const STATUS_COLORS: Record<string, string> = {
  pending:    "#e0c9a6",
  paid:       "#6b7a5e",
  processing: "#b3553c",
  shipped:    "#92402b",
  delivered:  "#2b2420",
  cancelled:  "#9ca3af",
};

// ── Custom pie label — shows only for segments > 5%
const renderPieLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, category,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number;
  percent: number; category: string;
}) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="#2b2420"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontFamily="inherit"
    >
      {category.length > 10 ? category.slice(0, 10) + "…" : category}{" "}
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((j) => (j.error ? setError(j.error) : setStats(j.data)))
      .catch(() => setError("Could not load stats"));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-sm font-medium uppercase tracking-widest text-clay">Dashboard</span>
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">Overview</h1>
      </div>

      {error && (
        <p className="rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay-dark">{error}</p>
      )}

      {!stats ? (
        <SkeletonCards />
      ) : (
        <>
          {/* ── Stat cards ─────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total revenue"    value={formatPrice(stats.totalRevenue)} />
            <StatCard label="Total orders"     value={String(stats.totalOrders)} />
            <StatCard label="Pending"          value={String(stats.pendingOrders)} highlight={stats.pendingOrders > 0} />
            <StatCard label="Products"         value={String(stats.totalProducts)} />
            <StatCard label="Low stock (≤5)"   value={String(stats.lowStockProducts)} highlight={stats.lowStockProducts > 0} />
            <StatCard label="Registered users" value={String(stats.totalUsers)} />
          </div>

          {/* ── Revenue line chart ──────────────────────── */}
          <ChartCard title="Revenue (last 30 days)">
            {stats.revenueByDay.length === 0 ? (
              <EmptyChart message="No paid orders yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.revenueByDay} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0d3bf" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#2b242066" }}
                    tickFormatter={(d) => d.slice(5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#2b242066" }}
                    tickFormatter={(v) => `₹${(v / 100).toLocaleString("en-IN")}`}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatPrice(v), "Revenue"]}
                    labelFormatter={(l) => `Date: ${l}`}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e0d3bf", fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#b3553c"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#b3553c", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* ── Orders by status + Products by category ─── */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bar chart */}
            <ChartCard title="Orders by status">
              {stats.ordersByStatus.length === 0 ? (
                <EmptyChart message="No orders yet" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={stats.ordersByStatus}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0d3bf" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#2b242066" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="status"
                      tick={{ fontSize: 12, fill: "#2b2420aa" }}
                      axisLine={false}
                      tickLine={false}
                      width={76}
                    />
                    <Tooltip
                      formatter={(v: number) => [v, "Orders"]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e0d3bf", fontSize: 12 }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={28}>
                      {stats.ordersByStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#b3553c"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Pie chart — fixed no-overlap version */}
            <ChartCard title="Products by category">
              {stats.topCategories.length === 0 ? (
                <EmptyChart message="No products yet" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie
                        data={stats.topCategories}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={renderPieLabel}
                      >
                        {stats.topCategories.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number, _name, props) => [
                          `${v} product${v !== 1 ? "s" : ""}`,
                          props.payload?.category,
                        ]}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e0d3bf", fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Clean legend below chart */}
                  <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                    {stats.topCategories.map((cat, i) => (
                      <div key={cat.category} className="flex items-center gap-1.5 text-xs text-ink/70">
                        <span
                          className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        {cat.category} ({cat.count})
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>
          </div>

          {/* ── Recent orders ───────────────────────────── */}
          <ChartCard title="Recent orders">
            {stats.recentOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink/50">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-sand-dark/60 text-ink/50">
                    <tr>
                      <th className="pb-2 pr-4 font-medium">Order ID</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 pr-4 font-medium">Total</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-dark/40">
                    {stats.recentOrders.map((order: Order) => (
                      <tr key={order.id} className="hover:bg-sand/30 transition-colors">
                        <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs capitalize font-medium"
                            style={{
                              background: (STATUS_COLORS[order.status] ?? "#e0d3bf") + "33",
                              color: STATUS_COLORS[order.status] ?? "#2b2420",
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 font-semibold text-ink">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-2.5 text-ink/60">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>

          {/* ── Quick actions ───────────────────────────── */}
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/products/new"
              className="rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white hover:bg-clay-dark">
              + Add product
            </Link>
            <Link href="/admin/orders"
              className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink hover:border-clay hover:text-clay">
              View all orders
            </Link>
            <Link href="/admin/users"
              className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink hover:border-clay hover:text-clay">
              View users
            </Link>
            <Link href="/admin/reviews"
              className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink hover:border-clay hover:text-clay">
              Manage reviews
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────
function StatCard({ label, value, highlight = false }: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-sand-dark/60 bg-white p-5">
      <p className="text-xs font-medium text-ink/50 uppercase tracking-wide">{label}</p>
      <p className={`mt-2 font-display text-2xl ${highlight ? "text-clay" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-sand-dark/60 bg-white p-5">
      <h2 className="mb-4 font-display text-lg text-ink">{title}</h2>
      {children}
    </div>
  );
}

function EmptyChart({ message = "No data yet" }: { message?: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-ink/40">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-4"/>
      </svg>
      {message}
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl border border-sand-dark/60 bg-white" />
      ))}
    </div>
  );
}
