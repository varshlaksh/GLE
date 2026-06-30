import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about TheGanaGallery — a gallery built around the people who make things. Fairly sourced, handcrafted Indian decor from independent makers.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us | TheGanaGallery",
    description: "A gallery built around the people who make things.",
  },
};

const values = [
  {
    title: "Made by hand",
    body:  "Every piece in our gallery is handwoven, hand-thrown, or hand-finished. We work only with makers who use traditional techniques passed down through generations.",
  },
  {
    title: "Fairly sourced",
    body:  "We visit every maker we work with, understand their process, and ensure they are paid fairly — well above market rates — for their time and skill.",
  },
  {
    title: "Small batches only",
    body:  "We never push makers to produce more than feels right. Small batches keep the quality high and the work sustainable.",
  },
  {
    title: "No middlemen",
    body:  "When you buy from TheGanaGallery, the money goes directly to the maker. We take a small, transparent margin to keep the lights on.",
  },
];

const makers = [
  {
    name:     "Bankura Weavers Collective",
    location: "West Bengal",
    craft:    "Seagrass and bamboo baskets",
    image:    "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80",
  },
  {
    name:     "Kutch Pottery Studio",
    location: "Gujarat",
    craft:    "Terracotta and earthenware",
    image:    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80",
  },
  {
    name:     "Jaipur Block Print House",
    location: "Rajasthan",
    craft:    "Hand block-printed textiles",
    image:    "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?w=600&q=80",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-sand-dark/60 bg-sand">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="text-sm font-medium uppercase tracking-widest text-clay">
              Our story
            </span>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              A gallery built around the people who make things
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
              TheGanaGallery started as a simple idea — what if buying something
              beautiful for your home also meant supporting the person who
              made it? We have been building that idea since 2024.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1000&q=80"
              alt="Handwoven baskets"
              fill priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <span className="text-sm font-medium uppercase tracking-widest text-clay">
          What we stand for
        </span>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Our values
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {values.map(v => (
            <div key={v.title}
              className="rounded-2xl border border-sand-dark/60 bg-white p-6">
              <h3 className="font-display text-xl text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Makers */}
      <section className="bg-sand py-16">
        <div className="mx-auto max-w-6xl px-6">
          <span className="text-sm font-medium uppercase tracking-widest text-clay">
            The people behind the pieces
          </span>
          <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Meet our makers
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {makers.map(m => (
              <div key={m.name}
                className="overflow-hidden rounded-2xl border border-sand-dark/60 bg-white">
                <div className="relative aspect-[4/3]">
                  <Image src={m.image} alt={m.name} fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg text-ink">{m.name}</h3>
                  <p className="mt-0.5 text-sm font-medium text-clay">{m.location}</p>
                  <p className="mt-1 text-sm text-ink/60">{m.craft}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-sand-dark/60 bg-clay">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-white sm:text-4xl">
              Ready to find something special?
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Browse the full collection and bring a little craft into your home.
            </p>
          </div>
          <Link href="/products"
            className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-clay transition-colors hover:bg-sand">
            Shop now
          </Link>
        </div>
      </section>
    </div>
  );
}

// This export is added at module level for Next.js to pick up
