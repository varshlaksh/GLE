"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/mockData";
import type { Order, OrderStatus } from "@/types";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-sand text-ink/70",
  paid: "bg-moss/10 text-moss",
  processing: "bg-clay/10 text-clay-dark",
  shipped: "bg-clay/10 text-clay-dark",
  delivered: "bg-moss/10 text-moss",
  cancelled: "bg-ink/10 text-ink/60",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setOrders(json.data ?? []);
      })
      .catch(() => setError("Could not load orders"));
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setOrders((prev) =>
        prev?.map((o) => (o.id === orderId ? { ...o, status } : o)) ?? null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <span className="text-sm font-medium uppercase tracking-widest text-clay">
          Sales
        </span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Orders
        </h1>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          {error}
        </p>
      )}

      {orders === null && !error && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-sand-dark/60 bg-white" />
          ))}
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-sand-dark py-16 text-center">
          <h3 className="font-display text-xl text-ink">No orders yet</h3>
          <p className="mt-2 max-w-sm text-sm text-ink/60">
            Orders will appear here once customers start checking out.
          </p>
        </div>
      )}

      {orders && orders.length > 0 && (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-sand-dark/60 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link href={`/orders/${order.id}`}
                    className="font-mono text-xs text-ink/50 hover:text-clay hover:underline">
                    Order #{order.id.slice(0, 8)} ↗
                  </Link>
                  <p className="mt-1 text-sm text-ink/60">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-2 text-sm text-ink">
                    {order.shipping_address?.full_name}
                    <span className="ml-2 text-ink/50">
                      {order.shipping_address?.phone}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {order.payment_method === "cod" && (
                    <span className="rounded-full bg-clay/10 px-3 py-1 text-xs font-medium text-clay-dark">
                      COD
                    </span>
                  )}
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="rounded-lg border border-sand-dark bg-white px-2.5 py-1.5 text-xs font-medium text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ul className="mt-4 space-y-1 border-t border-sand-dark/60 pt-3 text-sm text-ink/70">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.product?.name ?? "Product"}{" "}
                      <span className="text-ink/40">× {item.quantity}</span>
                    </span>
                    <span className="font-medium text-ink">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex justify-between border-t border-sand-dark/60 pt-3 text-sm font-semibold text-ink">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
