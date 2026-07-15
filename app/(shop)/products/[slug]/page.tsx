import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductCard from "@/components/product/ProductCard";
import { createServerSupabaseClient, createPublicSupabaseClient } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/mockData";
import type { Product } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://theganagallery.com";

// ── Data fetchers ─────────────────────────────────────────────
async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createServerSupabaseClient();

  // Try slug first
  let { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    // Fallback: treat param as UUID id (handles old bookmarks)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(slug)) {
      ({ data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("id", slug)
        .eq("is_active", true)
        .single());
    }
  }

  if (error || !data) return null;
  return data;
}

async function getRelated(product: Product): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("category_id", product.category_id)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(4);

  if (error || !data) return [];
  return data;
}

// ── generateStaticParams — uses PUBLIC client (no cookies, build-time safe)
export async function generateStaticParams() {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("is_active", true);

  return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
}

// ── Dynamic SEO Metadata ──────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found | TheGanaGallery" };
  }

  const categoryName = product.categories?.name ?? product.category;
  const title       = `${product.name} | TheGanaGallery`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.name} — handcrafted ${categoryName} from TheGanaGallery.`;
  const image = product.images[0];
  const url   = `${SITE_URL}/products/${product.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "TheGanaGallery",
      images: image ? [{ url: image, width: 800, height: 800, alt: product.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: { canonical: url },
    other: {
      "product:price:amount":   String(product.price / 100),
      "product:price:currency": "INR",
    },
  };
}

// ── Page Component ────────────────────────────────────────────
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug }  = await params;
  const product   = await getProduct(slug);

  if (!product) notFound();

  const related = await getRelated(product);
  const categoryName = product.categories?.name ?? product.category;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "Product",
    name:        product.name,
    description: product.description,
    image:       product.images,
    sku:         product.id,
    category:    categoryName,
    offers: {
      "@type":        "Offer",
      price:          (product.price / 100).toFixed(2),
      priceCurrency:  "INR",
      availability:   product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url:    `${SITE_URL}/products/${product.slug}`,
      seller: { "@type": "Organization", name: "TheGanaGallery" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/50">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="hover:text-clay">Home</Link></li>
            <li aria-hidden="true" className="mx-1">/</li>
            <li><Link href="/products" className="hover:text-clay">Shop</Link></li>
            <li aria-hidden="true" className="mx-1">/</li>
            <li>
              <Link
                href={`/products?category=${encodeURIComponent(categoryName)}`}
                className="hover:text-clay"
              >
                {categoryName}
              </Link>
            </li>
            <li aria-hidden="true" className="mx-1">/</li>
            <li className="text-ink" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} />

          <div className="flex flex-col">
            <span className="text-sm font-medium uppercase tracking-widest text-clay">
              {categoryName}
            </span>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-semibold text-ink">
              {formatPrice(product.price)}
            </p>

            <StockBadge stock={product.stock} />

            <p className="mt-6 max-w-prose text-sm leading-relaxed text-ink/70">
              {product.description}
            </p>

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-sand-dark/60 pt-6 text-sm">
              <div>
                <dt className="text-ink/50">Category</dt>
                <dd className="font-medium text-ink">{categoryName}</dd>
              </div>
              <div>
                <dt className="text-ink/50">Availability</dt>
                <dd className="font-medium text-ink">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              You may also like
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-ink/10 px-3 py-1 text-xs font-medium text-ink/70">
        <span className="h-2 w-2 rounded-full bg-ink/40" /> Out of stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-clay/10 px-3 py-1 text-xs font-medium text-clay-dark">
        <span className="h-2 w-2 rounded-full bg-clay" /> Only {stock} left in stock
      </span>
    );
  }
  return (
    <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-moss/10 px-3 py-1 text-xs font-medium text-moss">
      <span className="h-2 w-2 rounded-full bg-moss" /> In stock
    </span>
  );
}