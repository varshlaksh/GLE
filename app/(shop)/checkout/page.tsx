"use client";

import { useEffect, useState } from "react";
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

type PaymentMethod = "online" | "cod";

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

  const [codEnabled, setCodEnabled]     = useState(false);
  const [codLoading, setCodLoading]     = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");

  // Check if COD is available
  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(j => setCodEnabled(Boolean(j.data?.cod_enabled)))
      .catch(() => setCodEnabled(false))
      .finally(() => setCodLoading(false));
  }, []);

  const handleChange =
    (field: keyof ShippingAddress) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((prev) => ({ ...prev, [field]: e.target.value }));

  const placeCodOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping_address: address,
          payment_method: "cod",
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Order could not be placed");

      clearCart();
      router.push(`/order-success/${json.data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const placeOnlineOrder = async () => {
    if (!scriptReady || !window.Razorpay) {
      setError("Payment SDK is still loading — please try again in a moment.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const createRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
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
                items,
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

    if (paymentMethod === "cod") {
      await placeCodOrder();
    } else {
      await placeOnlineOrder();
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Your cart is empty</h1>
        <p className="mt-2 max-w-sm text-sm text-ink/60">
          Add something to your cart before checking out.
        </p>
        <Link href="/products"
          className="mt-6 rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onReady={() => setScriptReady(true)} />

      <div className="mb-8">
        <span className="text-sm font-medium uppercase tracking-widest text-clay">Checkout</span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Shipping &amp; payment</h1>
      </div>

      {!userLoading && !user && (
        <p className="mb-6 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          You&apos;ll need to{" "}
          <Link href="/login" className="font-semibold underline">sign in</Link>{" "}
          to complete your order.
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-3">
        {/* Shipping form */}
        <div className="space-y-4 rounded-2xl border border-sand-dark/60 bg-white p-6 lg:col-span-2">
          <h2 className="font-display text-xl text-ink">Shipping address</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" id="full_name" value={address.full_name} onChange={handleChange("full_name")} required />
            <Field label="Phone" id="phone" type="tel" value={address.phone} onChange={handleChange("phone")} required />
          </div>

          <Field label="Address line 1" id="line1" value={address.line1} onChange={handleChange("line1")} required />
          <Field label="Address line 2 (optional)" id="line2" value={address.line2 ?? ""} onChange={handleChange("line2")} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" id="city" value={address.city} onChange={handleChange("city")} required />
            <Field label="State" id="state" value={address.state} onChange={handleChange("state")} required />
            <Field label="Pincode" id="pincode" value={address.pincode} onChange={handleChange("pincode")} required />
          </div>

          {/* Payment method selector */}
          <div className="border-t border-sand-dark/60 pt-4">
            <h2 className="font-display text-xl text-ink">Payment method</h2>
            <div className="mt-3 space-y-3">
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                paymentMethod === "online" ? "border-clay bg-clay/5" : "border-sand-dark hover:border-clay/40"
              }`}>
                <input type="radio" name="payment_method" value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="mt-0.5 h-4 w-4 text-clay focus:ring-clay/20" />
                <div>
                  <p className="text-sm font-semibold text-ink">Pay online</p>
                  <p className="text-xs text-ink/60">Cards, UPI, netbanking — secured by Razorpay</p>
                </div>
              </label>

              {!codLoading && codEnabled && (
                <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  paymentMethod === "cod" ? "border-clay bg-clay/5" : "border-sand-dark hover:border-clay/40"
                }`}>
                  <input type="radio" name="payment_method" value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-0.5 h-4 w-4 text-clay focus:ring-clay/20" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Cash on Delivery</p>
                    <p className="text-xs text-ink/60">Pay in cash when your order arrives</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-sand-dark/60 bg-white p-6">
            <h2 className="font-display text-xl text-ink">Order summary</h2>

            <ul className="mt-4 space-y-3 text-sm">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between gap-2 text-ink/70">
                  <span className="line-clamp-1">
                    {product.name} <span className="text-ink/40">× {quantity}</span>
                  </span>
                  <span className="whitespace-nowrap font-medium text-ink">
                    {formatPrice(product.price * quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-between border-t border-sand-dark/60 pt-4 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">{error}</p>
            )}

            <button type="submit" disabled={submitting}
              className="mt-6 w-full rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-clay-dark disabled:opacity-60">
              {submitting
                ? "Processing..."
                : paymentMethod === "cod"
                  ? `Place order — Pay ${formatPrice(total)} on delivery`
                  : `Pay ${formatPrice(total)}`}
            </button>

            <p className="mt-3 text-center text-xs text-ink/40">
              {paymentMethod === "cod"
                ? "You'll pay in cash when the order is delivered."
                : "Payments are securely processed by Razorpay."}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, id, value, onChange, type = "text", required = false,
}: {
  label: string; id: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
      <input id={id} name={id} type={type} value={value} onChange={onChange} required={required}
        className="mt-1.5 w-full rounded-lg border border-sand-dark bg-white px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20" />
    </div>
  );
}
