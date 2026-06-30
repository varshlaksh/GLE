import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsClient from "@/components/product/ProductsClient";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse our full collection of handcrafted Indian decor — Wall Decor, Cherial Art, Metal Ware, Carved Wooden pieces, Clock Art Paintings, Decals, and more.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Shop All Products | TheGanaGallery",
    description: "Browse handcrafted Indian home decor from independent artisans.",
  },
};

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-sand-dark/60 bg-white">
          <div className="aspect-[4/5] animate-pulse bg-sand" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-sand" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-sand" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-sand" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-12"><LoadingGrid /></div>}>
      <ProductsClient />
    </Suspense>
  );
}
