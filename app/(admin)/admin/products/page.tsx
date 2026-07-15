"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/mockData";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setProducts(json.data ?? []);
      })
      .catch(() => setError("Could not load products"));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setProducts((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-sm font-medium uppercase tracking-widest text-clay">
            Catalogue
          </span>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Products
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
        >
          + Add product
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          {error}
        </p>
      )}

      {products === null && !error && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-sand-dark/60 bg-white" />
          ))}
        </div>
      )}

      {products && products.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-sand-dark py-16 text-center">
          <h3 className="font-display text-xl text-ink">No products yet</h3>
          <p className="mt-2 max-w-sm text-sm text-ink/60">
            Add your first product to start building the catalogue.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-6 rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
          >
            + Add product
          </Link>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-sand-dark/60 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sand-dark/60 text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark/60">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-sand">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium text-ink">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{product.categories?.name ?? product.category}</td>
                  <td className="px-4 py-3 text-ink/70">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-ink/70">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.is_active
                          ? "bg-moss/10 text-moss"
                          : "bg-ink/10 text-ink/60"
                      }`}
                    >
                      {product.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium text-ink/60 hover:text-clay"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="font-medium text-clay hover:text-clay-dark disabled:opacity-50"
                      >
                        {deletingId === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
