"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import type { Product } from "@/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="inline-flex items-center rounded-full border border-sand-dark">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={outOfStock}
          className="px-4 py-2 text-lg text-ink/70 transition-colors hover:text-clay disabled:opacity-40"
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
            setQuantity((q) => Math.min(product.stock || 1, q + 1))
          }
          disabled={outOfStock}
          className="px-4 py-2 text-lg text-ink/70 transition-colors hover:text-clay disabled:opacity-40"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className="flex-1 rounded-full bg-clay px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-clay-dark disabled:cursor-not-allowed disabled:bg-ink/20"
      >
        {outOfStock ? "Out of stock" : added ? "Added to cart ✓" : "Add to cart"}
      </button>
    </div>
  );
}
