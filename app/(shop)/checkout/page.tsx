"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useCartStore } from "@/lib/cartStore";
import { useUser } from "@/lib/auth";
import { formatPrice } from "@/lib/mockData";
import type { ShippingAddress } from "@/types";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const emptyAddress: ShippingAddress = {
  full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const items     = useCartStore((s) => s.items);
  const total     = useCartStore((s) => s.total());
  const clearCart = useCartStore((s) => s.clearCart);

  const [address, setAddress]         = useState<ShippingAddress>(emptyAddress);
  const [scriptReady, setScriptReady] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // ── All handlers preserved exactly ────────────────────────────────────────
  const handleChange =
    (field: keyof ShippingAddress) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((prev) => ({ ...prev, [field]: e.target.value }));

  const placeOnlineOrder = async () => {
    if (!scriptReady || !window.Razorpay) {
      setError("Payment SDK is still loading — please try again in a moment.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const cartItems = items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      }));
      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, shipping_address: address }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || createData.error) {
        throw new Error(createData.error ?? "Could not start payment");
      }

      const { razorpayOrderId, amount, currency } = createData.data;

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount, currency,
        name: "TheGanaGallery",
        description: `Order for ${items.length} item${items.length > 1 ? "s" : ""}`,
        order_id: razorpayOrderId,
        prefill: {
          name: address.full_name,
          email: user?.email ?? undefined,
          contact: address.phone,
        },
        theme: { color: "#b3553c" },
        modal: { ondismiss: () => setSubmitting(false) },
        handler: async (response) => {
          try {
            const orderRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: cartItems,
                shipping_address: address,
                payment_method: "online",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok || orderData.error) {
              throw new Error(orderData.error ?? "Order could not be saved");
            }
            clearCart();
            router.push(`/order-success/${orderData.data.orderId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setSubmitting(false);
          }
        },
      });
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) { router.push("/login"); return; }
    if (items.length === 0) { setError("Your cart is empty."); return; }
    await placeOnlineOrder();
  };
  // ── End preserved handlers ─────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Your cart is empty</h1>
        <p className="mt-2 max-w-sm text-sm text-ink/60">
          Add something beautiful to your cart before checking out.
        </p>
        <Link
          href="/products"
          className="mt-6 rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/30">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
      />

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-sand-dark/40 bg-white px-6 py-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 text-xs font-medium text-ink/40">
            <Link href="/cart" className="transition-colors hover:text-clay">Cart</Link>
            <span>/</span>
            <span className="text-ink">Checkout</span>
          </div>
          <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
            Shipping &amp; payment
          </h1>
        </div>
      </div>

      {/* ── Sign-in nudge ─────────────────────────────────────────────────────── */}
      {!userLoading && !user && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm text-amber-800">
          You&apos;ll need to{" "}
          <Link href="/login" className="font-semibold underline">sign in</Link>{" "}
          to complete your order.
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 lg:py-12"
      >
        {/* ════════════════════════════════════════════
            LEFT — Shipping address + Payment card
        ════════════════════════════════════════════ */}
        <div className="space-y-5">

          {/* ── Shipping address ── */}
          <section className="rounded-2xl border border-sand-dark/50 bg-white p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="text-clay"><IconLocation /></span>
              <h2 className="font-display text-xl text-ink">Shipping address</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"  id="full_name" value={address.full_name} onChange={handleChange("full_name")} required />
              <Field label="Phone"      id="phone"     type="tel" value={address.phone} onChange={handleChange("phone")} required />
            </div>

            <div className="mt-4 grid gap-4">
              <Field label="Address line 1"           id="line1" value={address.line1}        onChange={handleChange("line1")} required />
              <Field label="Address line 2 (optional)" id="line2" value={address.line2 ?? ""} onChange={handleChange("line2")} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="City"    id="city"    value={address.city}    onChange={handleChange("city")}    required />
              <Field label="State"   id="state"   value={address.state}   onChange={handleChange("state")}   required />
              <Field label="Pincode" id="pincode" value={address.pincode} onChange={handleChange("pincode")} required />
            </div>
          </section>

          {/* ── Payment information card ── */}
          <section className="rounded-2xl border border-sand-dark/50 bg-white p-6">
            <div className="flex items-center gap-2.5">
              <span className="text-clay"><IconLock /></span>
              <h2 className="font-display text-xl text-ink">Payment</h2>
            </div>

            <div className="mt-4 rounded-xl border border-sand-dark/60 bg-sand/30 px-4 py-4">
              {/* Header */}
              <div className="flex items-center gap-2">
                <IconShieldCheck />
                <p className="text-sm font-medium text-ink">Secure online payment</p>
              </div>
              <p className="mt-0.5 text-xs text-ink/50">UPI · Cards · Net Banking</p>

              {/* Method pills — visual indicators only, not interactive */}
              <div
                className="mt-3 flex flex-wrap items-center gap-2"
                role="list"
                aria-label="Accepted payment methods"
              >
                {/* GPay */}
                <div role="listitem" title="Google Pay"
                  className="flex h-7 items-center gap-0.5 rounded border border-sand-dark/50 bg-white px-2.5">
                  <span style={{ fontFamily: "Arial, sans-serif", fontSize: 12, fontWeight: 700, color: "#4285F4" }}>G</span>
                  <span style={{ fontFamily: "Arial, sans-serif", fontSize: 12, fontWeight: 500, color: "#3C4043" }}>Pay</span>
                </div>
                {/* UPI */}
                <div role="listitem" title="UPI"
                  className="flex h-7 items-center rounded border border-sand-dark/50 bg-white px-2.5">
                  <span style={{ fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, color: "#097939" }}>U</span>
                  <span style={{ fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, color: "#ED752E" }}>P</span>
                  <span style={{ fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, color: "#097939" }}>I</span>
                </div>
                {/* Visa */}
                <div role="listitem" title="Visa"
                  className="flex h-7 items-center rounded border border-sand-dark/50 bg-white px-2.5">
                  <span style={{ fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: "1px", color: "#1A1F71" }}>VISA</span>
                </div>
                {/* Mastercard */}
                <div role="listitem" title="Mastercard"
                  className="flex h-7 items-center rounded border border-sand-dark/50 bg-white px-2.5">
                  <svg width="30" height="18" viewBox="0 0 30 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="11" cy="9" r="8" fill="#EB001B" />
                    <circle cx="19" cy="9" r="8" fill="#F79E1B" />
                    <path d="M15 2.2a8 8 0 0 1 0 13.6A8 8 0 0 1 15 2.2Z" fill="#FF5F00" />
                  </svg>
                </div>
                {/* RuPay */}
                <div role="listitem" title="RuPay"
                  className="flex h-7 items-center gap-0 rounded border border-sand-dark/50 bg-white px-2.5">
                  <span style={{ fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, color: "#0066B3" }}>Ru</span>
                  <span style={{ fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, color: "#00A650" }}>Pay</span>
                </div>
              </div>

              {/* Razorpay attribution */}
              <div className="mt-3 flex items-center gap-1.5 border-t border-sand-dark/40 pt-3">
                <IconLock size={11} />
                <p className="text-[11px] text-ink/40">Securely processed by Razorpay</p>
              </div>
            </div>
          </section>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT — Order summary + Pay button
        ════════════════════════════════════════════ */}
        <div className="mt-6 lg:mt-0">
          <div className="sticky top-6 rounded-2xl border border-sand-dark/50 bg-white p-6">
            <h2 className="font-display text-xl text-ink">Order summary</h2>

            {/* Items */}
            <ul className="mt-4 divide-y divide-sand-dark/40">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-sand-dark/40 bg-sand">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                      : <span className="flex h-full w-full items-center justify-center text-[10px] text-ink/30">IMG</span>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                    <p className="text-xs text-ink/50">Qty {quantity}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-ink">
                    {formatPrice(product.price * quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Promo — future feature, no functional UI */}
            <p className="mt-3 text-xs text-ink/35">Have a promo code? Coming soon.</p>

            {/* Cost breakdown */}
            <dl className="mt-4 space-y-2 border-t border-sand-dark/40 pt-4 text-sm">
              <div className="flex justify-between text-ink/70">
                <dt>Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)</dt>
                <dd className="font-medium text-ink">{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between text-ink/40">
                <dt>Shipping</dt>
                <dd>—</dd>
              </div>
              <div className="flex justify-between text-ink/40">
                <dt>GST / Tax</dt>
                <dd>—</dd>
              </div>
            </dl>

            {/* Total */}
            <div className="mt-4 flex items-baseline justify-between border-t border-sand-dark/60 pt-4">
              <span className="font-display text-base text-ink">Total</span>
              <span className="font-display text-2xl text-ink">{formatPrice(total)}</span>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg border border-clay/30 bg-clay/10 px-3 py-2.5 text-sm text-clay-dark">
                {error}
              </div>
            )}

            {/* Pay button */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-full bg-clay px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing…
                </span>
              ) : (
                `Pay ${formatPrice(total)}`
              )}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink/40">
              <IconLock size={11} />
              Payments are securely processed by Razorpay
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Field({
  label, id, value, onChange, type = "text", required = false,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-sand-dark bg-white px-3.5 py-2.5 text-sm text-ink transition-shadow focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
      />
    </div>
  );
}

// ── Structural icons ───────────────────────────────────────────────────────────

function IconLocation() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconLock({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconShieldCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ color: "#4a7c59", flexShrink: 0 }}>
      <path d="M8 1.5 L13.5 3.5 L13.5 8.5 C13.5 11.5 10.5 13.8 8 14.5 C5.5 13.8 2.5 11.5 2.5 8.5 L2.5 3.5 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5.5 8.2l1.6 1.6L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}