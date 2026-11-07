import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import CollectionsSection from "@/components/home/CollectionsSection";
import HeroCarousel from "@/components/home/HeroCarousel";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import { homepageContent } from "@/lib/homepage-content";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Product } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ganagallery.shop";

export const metadata: Metadata = {
  title: "3D Infinity Tunnel Tables & Custom Interiors — The Gana Gallery",
  description:
    "Discover 3D infinity tunnel center tables, wall décor and custom interior solutions by Ganalaxmi Enterprises for homes, cafés, restaurants and reception spaces.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "3D Infinity Tunnel Tables by Ganalaxmi Enterprises",
    description:
      "Statement center tables, wall décor and custom interior solutions for homes and commercial spaces.",
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
};

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4)
    // Keep the static homepage available when Supabase is slow or offline.
    .abortSignal(AbortSignal.timeout(3000));
  if (error || !data) return [];
  return data;
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      {/* Hero */}
      <HeroCarousel content={homepageContent} />

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
