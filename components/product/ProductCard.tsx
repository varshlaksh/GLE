"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/mockData";

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock    = product.stock <= 0;
  const primaryImage  = product.images?.[0] ?? null;
  const secondaryImage = product.images?.[1] ?? null;
  const [hovered, setHovered] = useState(false);

  // Use slug when available, fallback to id for safety
  const href = `/products/${product.slug ?? product.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand-dark/60 bg-white transition-all duration-300 hover:shadow-lg hover:shadow-clay/10 hover:-translate-y-0.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
{/* Image — fixed 4:5 portrait ratio for consistency */}
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {/* Primary image */}
        {primaryImage && (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-all duration-500 ease-in-out ${
              secondaryImage && hovered
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100"
            }`}
          />
        )}

        {/* Secondary image — desktop hover only */}
        {secondaryImage && (
          <Image
            src={secondaryImage}
            alt={`${product.name} — alternate view`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`hidden object-cover transition-all duration-500 ease-in-out md:block ${
              hovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          />
        )}

        {/* Sold out badge */}
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white">
            Sold out
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-0.5 p-4 text-center">
        {/* Brand / Category */}
        <span className="text-xs font-semibold uppercase tracking-widest text-clay">
          {product.categories?.name ?? product.category}
        </span>

        {/* Product name */}
        <h3 className="mt-1 font-display text-base leading-snug text-ink sm:text-lg">
          {product.name}
        </h3>

        {/* Price */}
        <p className="mt-auto pt-2 text-base font-semibold text-ink">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
