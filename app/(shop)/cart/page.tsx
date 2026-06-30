"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cartStore";
import { formatPrice } from "@/lib/mockData";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useCartStore((s) => s.total());

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sand text-clay">
          <CartIcon />
        </div>
        <h1 className="mt-4 font-display text-2xl text-ink sm:text-3xl">
          Your cart is empty
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink/60">
          Looks like you haven&apos;t added anything yet. Browse the
          collection and find something you love.
        </p>
        <Link
          href="/products"
          className="mt-6 rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium uppercase tracking-widest text-clay">
            Your cart
          </span>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Shopping cart
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-sm font-medium text-ink/50 transition-colors hover:text-clay"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-sand-dark/60 rounded-2xl border border-sand-dark/60 bg-white">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-4 p-4 sm:p-6">
                <Link
                  href={`/products/${product.id}`}
                  className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand sm:h-24 sm:w-24"
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-clay">
                        {product.category}
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        className="block font-display text-base text-ink hover:text-clay sm:text-lg"
                      >
                        {product.name}
                      </Link>
                    </div>
                    <p className="whitespace-nowrap font-semibold text-ink">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-full border border-sand-dark">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(product.id, quantity - 1)
                        }
                        className="px-3 py-1.5 text-base text-ink/70 transition-colors hover:text-clay"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-ink">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            Math.min(product.stock || quantity + 1, quantity + 1)
                          )
                        }
                        className="px-3 py-1.5 text-base text-ink/70 transition-colors hover:text-clay"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="text-sm font-medium text-ink/50 transition-colors hover:text-clay"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-clay"
          >
            ← Continue shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-sand-dark/60 bg-white p-6">
            <h2 className="font-display text-xl text-ink">Order summary</h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink/70">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-sand-dark/60 pt-4 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-full bg-clay px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
