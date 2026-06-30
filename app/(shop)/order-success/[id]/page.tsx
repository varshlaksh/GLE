"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/mockData";
import type { Order } from "@/types";

export default function OrderSuccessPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/orders/${params.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json.error) {
          setError(json.error);
        } else {
          setOrder(json.data);
        }
      })
      .catch(() => active && setError("Could not load order details"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params.id]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moss/10 text-moss">
        <CheckIcon />
      </div>
      <h1 className="mt-6 font-display text-3xl text-ink sm:text-4xl">
        Thank you for your order!
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Order ID: <span className="font-mono text-ink/80">{params.id}</span>
      </p>

      {loading && (
        <p className="mt-6 text-sm text-ink/50">Loading order details...</p>
      )}

      {error && !loading && (
        <p className="mt-6 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          {error}
        </p>
      )}

      {order && !loading && (
        <div className="mt-8 w-full rounded-2xl border border-sand-dark/60 bg-white p-6 text-left">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Order summary</h2>
            <div className="flex items-center gap-2">
              {order.payment_method === "cod" && (
                <span className="rounded-full bg-clay/10 px-3 py-1 text-xs font-medium text-clay-dark">
                  Cash on Delivery
                </span>
              )}
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium capitalize text-ink/70">
                {order.status}
              </span>
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-sm">
            {order.items?.map((item) => (
              <li key={item.id} className="flex justify-between text-ink/70">
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

          <div className="mt-4 flex justify-between border-t border-sand-dark/60 pt-4 text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>

          <div className="mt-4 border-t border-sand-dark/60 pt-4 text-sm text-ink/70">
            <p className="font-medium text-ink">Shipping to</p>
            <p>{order.shipping_address.full_name}</p>
            <p>{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
            <p>
              {order.shipping_address.city}, {order.shipping_address.state}{" "}
              {order.shipping_address.pincode}
            </p>
            <p>{order.shipping_address.phone}</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/orders"
          className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-clay hover:text-clay"
        >
          View order history
        </Link>
        <Link
          href="/products"
          className="rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
