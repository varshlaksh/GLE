import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import CollectionsSection from "@/components/home/CollectionsSection";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Product } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://theganagallery.com";

export const metadata: Metadata = {
  title: "TheGanaGallery — Handcrafted Indian Decor & Art",
  description:
    "Shop handcrafted Wall Decor, Cherial Art, Metal Ware, Carved Wooden Decor, Clock Art Paintings and more — made by skilled artisans across India.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "TheGanaGallery — Handcrafted Indian Decor & Art",
    description: "Shop handcrafted Indian home decor from independent artisans.",
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
};

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4);
  if (error || !data) return [];
  return data;
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-sand-dark/60 bg-sand">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="text-sm font-medium uppercase tracking-widest text-clay">
              Made by hand, chosen with care
            </span>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl md:text-6xl">
              Everyday objects, woven and thrown by hand
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
              TheGanaGallery brings together handcrafted decor from independent
              makers — each piece carrying the small marks of the hands that
              made it.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-full bg-clay px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
              >
                Shop the collection
              </Link>
              <Link
                href="#collections"
                className="rounded-full border border-ink/15 px-7 py-3 text-sm font-semibold text-ink transition-colors hover:border-clay hover:text-clay"
              >
                Browse collections
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1000&q=80"
              alt="Handwoven baskets arranged on a shelf"
              fill priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-sm font-medium uppercase tracking-widest text-clay">New &amp; notable</span>
              <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Featured pieces</h2>
            </div>
            <Link href="/products" className="hidden text-sm font-semibold text-ink/70 hover:text-clay sm:block">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Link href="/products" className="mt-8 block text-center text-sm font-semibold text-ink/70 hover:text-clay sm:hidden">
            View all products →
          </Link>
        </section>
      )}

      {/* Collections */}
      <div id="collections" className="border-t border-sand-dark/40">
        <CollectionsSection />
      </div>

      {/* Reviews */}
      <div className="border-t border-sand-dark/40 bg-sand">
        <ReviewsCarousel />
      </div>

      {/* CTA */}
      <section className="border-t border-sand-dark/60 bg-clay">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-white sm:text-4xl">Bring a little craft into your home</h2>
            <p className="mt-2 max-w-md text-sm text-white/85">
              New pieces added regularly — create an account to save favourites and check out faster.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-clay hover:bg-sand">Start shopping</Link>
            <Link href="/signup" className="rounded-full border border-white/60 px-7 py-3 text-sm font-semibold text-white hover:border-white">Create account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
