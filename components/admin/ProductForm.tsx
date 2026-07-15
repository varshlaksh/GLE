"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import type { Product } from "@/types";

type Category = { id: string; name: string; slug: string };

interface FormValues {
  name:        string;
  description: string;
  price:       string;
  category_id: string;
  stock:       string;
  images:      string[];
  is_active:   boolean;
}

function toFormValues(product?: Product): FormValues {
  if (!product) return { name:"", description:"", price:"", category_id:"", stock:"0", images:[], is_active:true }
  return {
    name:        product.name,
    description: product.description,
    price:       (product.price / 100).toString(),
    category_id: product.category_id ?? "",
    stock:       product.stock.toString(),
    images:      product.images,
    is_active:   product.is_active,
  }
}

export default function ProductForm({ product }: { product?: Product }) {
  const router   = useRouter();
  const isEdit   = Boolean(product);
  const supabase = createClient();
  const [values, setValues]         = useState<FormValues>(toFormValues(product));
  const [error,  setError]          = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("display_order");
      if (!error && data) setCategories(data);
    }
    loadCategories();
  }, []);

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setValues(prev => ({ ...prev, [k]: v }));

  const handleCategoryChange = (val: string) => {
    if (val === "__custom__") {
      setUseCustom(true);
      set("category_id", "");
    } else {
      setUseCustom(false);
      set("category_id", val);
    }
  };

  function slugify(name: string) {
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function resolveCategoryId(): Promise<string> {
    if (!useCustom) return values.category_id;

    const slug = slugify(customCategory);
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) return existing.id;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: customCategory.trim(), slug, is_active: false, display_order: 99 })
      .select("id")
      .single();

    if (error) throw new Error("Could not create custom category");
    return data.id;
  }

  // ── Cloudinary upload ────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "products");
        const res  = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? "Upload failed");
        urls.push(json.data.url);
      }
      set("images", [...values.images, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (url: string) =>
    set("images", values.images.filter(u => u !== url));

  const moveImage = (from: number, to: number) => {
    const imgs = [...values.images];
    const [moved] = imgs.splice(from, 1);
    imgs.splice(to, 0, moved);
    set("images", imgs);
  };

  // ── Submit ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const price = Number(values.price);
    const stock = Number(values.stock);
    if ((!useCustom && !values.category_id) || (useCustom && !customCategory.trim())) {
      setError("Name and category are required"); return;
    }
    if (!values.name.trim()) { setError("Name and category are required"); return; }
    if (Number.isNaN(price) || price < 0) { setError("Price must be a valid number"); return; }
    if (Number.isNaN(stock) || stock < 0) { setError("Stock must be a valid number"); return; }

    setSubmitting(true);
    try {
      const resolvedCategoryId = await resolveCategoryId();
      const payload = {
        name:        values.name.trim(),
        description: values.description.trim(),
        price:       Math.round(price * 100),
        category_id: resolvedCategoryId,
        stock:       Math.round(stock),
        images:      values.images,
        is_active:   values.is_active,
      };
      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const res  = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Something went wrong");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-sand-dark/60 bg-white p-6">

      {/* Name */}
      <Field label="Product Name" id="name" value={values.name}
        onChange={e => set("name", e.target.value)} required />

      {/* Category — dropdown with all collections */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-ink">
          Collection / Category
        </label>
        <p className="mt-0.5 text-xs text-ink/50">
          Select which collection this product belongs to.
        </p>
        <select
          id="category"
          value={useCustom ? "__custom__" : values.category_id}
          onChange={e => handleCategoryChange(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-sand-dark bg-white px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
        >
          <option value="">— Select a collection —</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
          <option value="__custom__">Other (custom)…</option>
        </select>
        {useCustom && (
          <input
            type="text"
            value={customCategory}
            onChange={e => setCustomCategory(e.target.value)}
            placeholder="Enter custom category…"
            className="mt-2 w-full rounded-lg border border-sand-dark bg-white px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
          />
        )}
        {(values.category_id || (useCustom && customCategory)) && (
          <p className="mt-1 text-xs text-moss">
            ✓ Category: <strong>
              {useCustom ? customCategory : categories.find(c => c.id === values.category_id)?.name}
            </strong>
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="desc" className="block text-sm font-medium text-ink">Description</label>
        <textarea id="desc" value={values.description} rows={4}
          onChange={e => set("description", e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-sand-dark bg-white px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20" />
      </div>

      {/* Price + Stock */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price (₹)" id="price" type="number" value={values.price}
          onChange={e => set("price", e.target.value)} required />
        <Field label="Stock" id="stock" type="number" value={values.stock}
          onChange={e => set("stock", e.target.value)} required />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-ink">Product Images</label>
        <p className="mt-0.5 text-xs text-ink/50">
          First image = primary display. Second image = hover preview on card. Previews shown in <strong>4:5 ratio</strong> (portrait) — same as product cards on the site. Upload square or portrait images for best results.
        </p>

        {values.images.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
            {values.images.map((url, idx) => (
              <div key={url} className="group relative overflow-hidden rounded-xl border border-sand-dark bg-sand" style={{ aspectRatio: "4/5" }}>
                <Image src={url} alt="product" fill sizes="150px" className="object-cover" />
                {/* Badge */}
                <span className="absolute left-1 top-1 rounded bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {idx === 0 ? "Primary" : idx === 1 ? "Hover" : `#${idx+1}`}
                </span>
                {/* Controls */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-1">
                    {idx > 0 && (
                      <button type="button" onClick={() => moveImage(idx, idx - 1)}
                        className="rounded bg-white/80 px-1.5 py-0.5 text-xs text-ink hover:bg-white">←</button>
                    )}
                    {idx < values.images.length - 1 && (
                      <button type="button" onClick={() => moveImage(idx, idx + 1)}
                        className="rounded bg-white/80 px-1.5 py-0.5 text-xs text-ink hover:bg-white">→</button>
                    )}
                  </div>
                  <button type="button" onClick={() => removeImage(url)}
                    className="rounded bg-clay/90 px-2 py-0.5 text-xs text-white hover:bg-clay">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3">
          <input ref={fileRef} type="file" accept="image/*" multiple
            className="hidden" id="image-upload" onChange={handleFileChange} />
          <label htmlFor="image-upload"
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-sand-dark px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-clay hover:text-clay ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            {uploading ? (
              <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-clay border-t-transparent" />
              Uploading...</>
            ) : (
              <><UploadIcon /> Upload images</>
            )}
          </label>
        </div>
      </div>

      {/* Active toggle */}
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
        <input type="checkbox" checked={values.is_active}
          onChange={e => set("is_active", e.target.checked)}
          className="h-4 w-4 rounded border-sand-dark text-clay focus:ring-clay/20" />
        Active (visible in store)
      </label>

      {error && (
        <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={submitting || uploading}
          className="rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark disabled:opacity-60">
          {submitting ? "Saving..." : isEdit ? "Save changes" : "Create product"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")}
          className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink hover:border-clay hover:text-clay">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, id, value, onChange, type = "text", required = false, placeholder = "" }: {
  label: string; id: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
      <input id={id} name={id} type={type} value={value} onChange={onChange}
        required={required} placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-sand-dark bg-white px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20" />
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}