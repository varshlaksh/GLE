"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/mockData";
import type { Order, OrderStatus } from "@/types";

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending",    label: "Order placed" },
  { status: "paid",       label: "Payment confirmed" },
  { status: "processing", label: "Processing" },
  { status: "shipped",    label: "Shipped" },
  { status: "delivered",  label: "Delivered" },
];

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-sand text-ink/70",
  paid:       "bg-moss/10 text-moss",
  processing: "bg-clay/10 text-clay-dark",
  shipped:    "bg-clay/10 text-clay-dark",
  delivered:  "bg-moss/10 text-moss",
  cancelled:  "bg-ink/10 text-ink/60",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder]     = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/orders/${params.id}`)
      .then(res => res.json())
      .then(json => {
        if (!active) return;
        if (json.error) setError(json.error);
        else setOrder(json.data);
      })
      .catch(() => active && setError("Could not load order"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="h-64 animate-pulse rounded-2xl border border-sand-dark/60 bg-white" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink">Order not found</h1>
        <p className="mt-2 text-sm text-ink/60">{error}</p>
        <Link href="/orders"
          className="mt-6 rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white hover:bg-clay-dark">
          Back to orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = TIMELINE_STEPS.findIndex(s => s.status === order.status);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/orders" className="text-sm font-medium text-ink/60 hover:text-clay">
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {order.payment_method === "cod" && (
            <span className="rounded-full bg-clay/10 px-3 py-1.5 text-sm font-medium text-clay-dark">
              Cash on Delivery
            </span>
          )}
          <span className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${STATUS_STYLES[order.status]}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Timeline — Amazon/Flipkart style */}
      <div className="mt-8 rounded-2xl border border-sand-dark/60 bg-white p-6">
        <h2 className="mb-6 font-display text-lg text-ink">Order tracking</h2>

        {isCancelled ? (
          <div className="flex items-center gap-3 rounded-xl bg-ink/5 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/15 text-ink/60">✕</span>
            <div>
              <p className="text-sm font-semibold text-ink">Order cancelled</p>
              <p className="text-xs text-ink/50">
                {order.status_history?.find(h => h.status === "cancelled")?.timestamp &&
                  new Date(order.status_history.find(h => h.status === "cancelled")!.timestamp)
                    .toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ) : (
          <ol className="relative ml-4">
            {TIMELINE_STEPS.map((step, i) => {
              const isComplete = i <= currentStepIndex;
              const isCurrent  = i === currentStepIndex;
              const historyEntry = order.status_history?.find(h => h.status === step.status);
              const isLast = i === TIMELINE_STEPS.length - 1;

              return (
                <li key={step.status} className="relative pb-8 last:pb-0">
                  {!isLast && (
                    <span className={`absolute left-[11px] top-6 h-full w-0.5 ${
                      isComplete && i < currentStepIndex ? "bg-clay" : "bg-sand-dark"
                    }`} />
                  )}
                  <div className="flex items-start gap-4">
                    <span className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      isComplete
                        ? isCurrent ? "bg-clay ring-4 ring-clay/20" : "bg-clay"
                        : "bg-sand-dark/60"
                    }`}>
                      {isComplete && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1 pt-0.5">
                      <p className={`text-sm font-semibold ${isComplete ? "text-ink" : "text-ink/40"}`}>
                        {step.label}
                      </p>
                      {historyEntry ? (
                        <>
                          <p className="mt-0.5 text-xs text-ink/50">
                            {new Date(historyEntry.timestamp).toLocaleString("en-IN", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                          {historyEntry.note && (
                            <p className="mt-0.5 text-xs text-ink/40">{historyEntry.note}</p>
                          )}
                        </>
                      ) : (
                        !isComplete && <p className="mt-0.5 text-xs text-ink/30">Pending</p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Items */}
      <div className="mt-6 rounded-2xl border border-sand-dark/60 bg-white p-6">
        <h2 className="mb-4 font-display text-lg text-ink">Items</h2>
        <ul className="divide-y divide-sand-dark/60">
          {order.items?.map(item => (
            <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                {item.product?.images?.[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{item.product?.name ?? "Product"}</p>
                <p className="text-xs text-ink/50">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-ink">{formatPrice(item.unit_price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-sand-dark/60 pt-4 text-base font-semibold text-ink">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Shipping */}
      <div className="mt-6 rounded-2xl border border-sand-dark/60 bg-white p-6">
        <h2 className="mb-3 font-display text-lg text-ink">Shipping address</h2>
        <div className="text-sm text-ink/70">
          <p className="font-medium text-ink">{order.shipping_address.full_name}</p>
          <p>{order.shipping_address.line1}</p>
          {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
          <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
          <p>{order.shipping_address.phone}</p>
        </div>
      </div>
    </div>
  );
}
