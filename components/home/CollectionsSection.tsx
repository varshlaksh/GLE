import CollectionCard, { type CollectionItem } from "./CollectionCard";

const collections: CollectionItem[] = [
  {
    name: "Wall Decor",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    href: "/products?category=Wall+Decor",
  },
  {
    name: "Decals Decor",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    href: "/products?category=Decals+Decor",
  },
  {
    name: "Table Decor",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    href: "/products?category=Table+Decor",
  },
  {
    name: "Cherial Art",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
    href: "/products?category=Cherial+Art",
  },
  {
    name: "Dix Decor",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80",
    href: "/products?category=Dix+Decor",
  },
  {
    name: "Metal Ware",
    image: "https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=600&q=80",
    href: "/products?category=Metal+Ware",
  },
  {
    name: "Carved Wooden Decor",
    image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&q=80",
    href: "/products?category=Carved+Wooden+Decor",
  },
  {
    name: "Clock Art Painting",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    href: "/products?category=Clock+Art+Painting",
  },
];

export default function CollectionsSection() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-medium uppercase tracking-widest text-clay">
              Curated for you
            </span>
            <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Shop by Collection
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
              Explore our handpicked collections — each piece telling a story of craft and culture.
            </p>
          </div>
          <a
            href="/products"
            className="hidden text-sm font-semibold text-ink/70 transition-colors hover:text-clay sm:block"
          >
            View all products →
          </a>
        </div>

        {/* Grid — 2 cols mobile, 4 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
          {collections.map((collection) => (
            <CollectionCard key={collection.name} collection={collection} />
          ))}
        </div>

        {/* Mobile view-all */}
        <a
          href="/products"
          className="mt-8 block text-center text-sm font-semibold text-ink/70 hover:text-clay sm:hidden"
        >
          View all products →
        </a>
      </div>
    </section>
  );
}
