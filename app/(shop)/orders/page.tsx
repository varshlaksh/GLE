"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { formatPrice } from "@/lib/mockData";
import type { Order, OrderStatus } from "@/types";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-sand text-ink/70",
  paid: "bg-moss/10 text-moss",
  processing: "bg-clay/10 text-clay-dark",
  shipped: "bg-clay/10 text-clay-dark",
  delivered: "bg-moss/10 text-moss",
  cancelled: "bg-ink/10 text-ink/60",
};

export default function OrdersPage() {
  const { user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setOrders([]);
      return;
    }
    let active = true;
    fetch("/api/orders")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json.error) setError(json.error);
        else setOrders(json.data ?? []);
      })
      .catch(() => active && setError("Could not load orders"));
    return () => {
      active = false;
    };
  }, [user, userLoading]);

  if (!userLoading && !user) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">
          Sign in to view your orders
        </h1>
        <Link
          href="/login"
          className="mt-6 rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <span className="text-sm font-medium uppercase tracking-widest text-clay">
          Account
        </span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Order history
        </h1>
      </div>

      {error && (
        <p className="rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          {error}
        </p>
      )}

      {orders === null && !error && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-sand-dark/60 bg-white" />
          ))}
        </div>
      )}

      {orders && orders.length === 0 && !error && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-sand-dark py-20 text-center">
          <h3 className="font-display text-xl text-ink">No orders yet</h3>
          <p className="mt-2 max-w-sm text-sm text-ink/60">
            Once you place an order, it will show up here.
          </p>
          <Link
            href="/products"
            className="mt-6 rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
          >
            Start shopping
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`}
                className="block rounded-2xl border border-sand-dark/60 bg-white p-5 transition-colors hover:border-clay">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-ink/50">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-sm text-ink/60">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-sand-dark/60 pt-3">
                  <p className="text-sm text-ink/70">
                    {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                  <p className="font-semibold text-ink">{formatPrice(order.total)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
