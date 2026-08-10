import type { MetadataRoute } from "next";
import { createPublicSupabaseClient } from "@/lib/supabase-server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ganagallery.shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Uses public client — no cookies needed at build time
  const supabase = createPublicSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select("slug, created_at")
    .eq("is_active", true);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,               lastModified: new Date(), changeFrequency: "daily",   priority: 1   },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/about`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url:             `${SITE_URL}/products/${p.slug}`,
    lastModified:    new Date(p.created_at),
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
