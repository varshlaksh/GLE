"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

function ProductsContent() {
  const searchParams    = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "All";

  const [products,       setProducts]       = useState<Product[] | null>(null);
  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    let active = true;
    setProducts(null);
    fetch("/api/products")
      .then((r) => r.json())
      .then((j) => { if (active) setProducts(j.data ?? []); })
      .catch(() => active && setProducts([]));
    return () => { active = false; };
  }, []);

const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(
      new Set(products.map((p) => p.categories?.name ?? p.category).filter(Boolean))
    ) as string[];
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const catName     = p.categories?.name ?? p.category;
      const matchCat    = activeCategory === "All" || catName === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <span className="text-sm font-medium uppercase tracking-widest text-clay">Shop</span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">All products</h1>
        <p className="mt-2 max-w-xl text-sm text-ink/70">
          Browse our full collection of handcrafted pieces.
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="search" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-sand-dark bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink/40 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-clay text-white"
                  : "bg-sand text-ink/70 hover:bg-sand-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8">
        {products === null ? (
          <LoadingGrid />
        ) : filtered.length === 0 ? (
          <EmptyState onReset={() => { setSearch(""); setActiveCategory("All"); }} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-sand-dark py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-clay">
        <SearchIcon />
      </div>
      <h3 className="mt-4 font-display text-xl text-ink">No products found</h3>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        We couldn&apos;t find anything matching your search or filter.
      </p>
      <button
        onClick={onReset}
        className="mt-6 rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white hover:bg-clay-dark"
      >
        Reset filters
      </button>
    </div>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export default function ProductsClient() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-12"><LoadingGrid /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
