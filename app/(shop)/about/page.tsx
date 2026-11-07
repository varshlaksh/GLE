import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  CalendarDays,
  Frame,
  HardHat,
  Leaf,
  Lightbulb,
  MapPin,
  MessageCircle,
  Utensils,
  Zap,
} from "lucide-react";
import { getWhatsAppUrl } from "@/lib/business-details";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Discover TheGanaGallery's journey since 2018 through lighting, site work, bamboo, teak wood, LED solutions and custom interiors.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Our Story | TheGanaGallery",
    description:
      "Hands-on lighting experience, thoughtful materials and custom solutions for distinctive spaces.",
  },
};

const expertise = [
  { title: "Lighting Design", icon: Lightbulb },
  { title: "Site Experience", icon: HardHat },
  { title: "Bamboo Craft", icon: Leaf },
  { title: "Teak Wood", icon: Box },
  { title: "LED Solutions", icon: Zap },
];

const applications = [
  {
    title: "3D Infinity Pieces",
    description: "Statement furniture where craft and light meet.",
    image: "/images/homepage/Infinity Mirror Console Table with Ivy Glow.png",
    imagePosition: "object-center",
    icon: Box,
  },
  {
    title: "Restaurants & Cafés",
    description: "Site lighting designed around the guest experience.",
    image: "/images/about/premium-restaurant-ambience.png",
    imagePosition: "object-center",
    icon: Utensils,
  },
  {
    title: "Bamboo Objects",
    description: "Functional pieces shaped with a handcrafted finish.",
    image: "/images/about/premium-bamboo-table-lamp.png",
    imagePosition: "object-center",
    icon: Leaf,
  },
  {
    title: "Wall & Accent Lighting",
    description: "Custom illumination that adds depth and character.",
    image: "/images/homepage/20260920_091500.jpg.jpeg",
    imagePosition: "object-center",
    icon: Frame,
  },
];

export default function AboutPage() {
  return (
    <div className="overflow-hidden bg-[#fbf7f0]">
      <section className="relative border-b border-sand-dark/60">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-clay/5 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[0.82fr_1.18fr] md:py-24">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-clay">
              Our story
            </span>
            <h1 className="mt-5 max-w-xl font-display text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              Lighting spaces with <span className="text-clay">craft and experience</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">
              Since 2018, our journey has grown through lighting work, site experience,
              and a practical understanding of bamboo, teak wood and LED solutions.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Since 2018", "Custom work", "Interior solutions"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-clay/20 bg-white px-4 py-2 text-xs font-medium text-ink/70"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <figure className="overflow-hidden rounded-[2rem] border border-sand-dark/70 bg-white shadow-[0_24px_70px_rgba(42,35,30,0.10)]">
            <div className="relative aspect-[16/10] min-h-[330px]">
              <Image
                src="/images/about/premium-hospitality-hero.png"
                alt="Completed hospitality interior with custom bamboo pendant and ambient lighting"
                fill
                priority
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-cover object-center"
              />
            </div>
            <figcaption className="p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
                Selected site work
              </p>
              <p className="mt-2 font-display text-xl leading-tight text-ink sm:text-2xl">
                Bamboo craft, ambient light and a complete hospitality experience
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/60">
                {["Concept", "Custom fabrication", "On-site execution"].map((label) => (
                  <span key={label} className="rounded-full border border-sand-dark bg-sand/60 px-3 py-1.5">
                    {label}
                  </span>
                ))}
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-[0.82fr_1.18fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
              The person behind the work
            </span>
            <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
              Materials, light and real spaces
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/70">
              TheGanaGallery is shaped by practical site work and an eye for how light,
              wood and handcrafted materials transform a space. The focus is simple:
              thoughtful custom solutions that feel right in their setting.
            </p>
            <div className="mt-7 flex items-center gap-3 text-sm text-ink/65">
              <MapPin className="text-clay" size={19} />
              Experience shaped through projects and spaces in Goa and beyond
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-sand-dark/70 bg-white p-4">
                <Lightbulb className="text-clay" size={21} />
                <p className="mt-3 text-sm font-medium text-ink">Lighting concepts</p>
              </div>
              <div className="rounded-2xl border border-sand-dark/70 bg-white p-4">
                <HardHat className="text-clay" size={21} />
                <p className="mt-3 text-sm font-medium text-ink">On-site learning</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <figure className="overflow-hidden rounded-[1.75rem] border border-sand-dark/70 bg-white">
              <div className="relative aspect-[3/4]">
                <Image
                  src="/images/about/premium-bamboo-pendants.png"
                  alt="Handcrafted bamboo pendant light cluster"
                  fill
                  sizes="(min-width: 768px) 28vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="px-4 py-3 text-xs font-medium text-ink/65">Handcrafted pendants</figcaption>
            </figure>
            <figure className="mt-10 overflow-hidden rounded-[1.75rem] border border-sand-dark/70 bg-white">
              <div className="relative aspect-[3/4]">
                <Image
                  src="/images/about/premium-bamboo-accent.png"
                  alt="Warm bamboo accent light casting a soft pattern"
                  fill
                  sizes="(min-width: 768px) 24vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="px-4 py-3 text-xs font-medium text-ink/65">Warm accent lighting</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="border-y border-sand-dark/60 bg-sand/70 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            Our expertise
          </span>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            From materials to meaningful spaces
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            {expertise.map(({ title, icon: Icon }) => (
              <div
                key={title}
                className="group rounded-2xl border border-sand-dark/70 bg-white p-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-clay/10 text-clay">
                  <Icon size={21} />
                </div>
                <h3 className="mt-5 font-display text-lg text-ink">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid overflow-hidden rounded-[2rem] border border-sand-dark/70 bg-ink md:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[330px] md:min-h-[430px]">
            <Image
              src="/images/about/premium-led-sculpture.png"
              alt="Blue and green sculptural LED installation"
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-8 text-white sm:p-10">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-light">
              Light as a material
            </span>
            <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              Designed to change how a space feels
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/70">
              From handcrafted bamboo to custom LED forms, every project balances material,
              atmosphere and the way people experience a room.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            Our journey
          </span>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            Shaped by spaces and people
          </h2>
        </div>
        <div className="relative mt-10 grid gap-4 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-clay/25 md:block" />
          {[
            { icon: CalendarDays, label: "2018", title: "The journey begins" },
            { icon: MapPin, label: "Goa", title: "Learning through real spaces" },
            { icon: Lightbulb, label: "Today", title: "TheGanaGallery" },
          ].map(({ icon: Icon, label, title }) => (
            <div key={label} className="relative rounded-2xl border border-sand-dark/70 bg-white p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-clay/25 bg-[#fbf7f0] text-clay">
                <Icon size={22} />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-clay">{label}</p>
              <h3 className="mt-2 font-display text-xl text-ink">{title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-sand-dark/60 bg-sand/70 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            Our applications
          </span>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            Crafted for different spaces
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {applications.map(({ title, description, image, imagePosition, icon: Icon }) => (
              <article
                key={title}
                className="overflow-hidden rounded-2xl border border-sand-dark/70 bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={image}
                    alt={`${title} lighting and décor application`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className={`object-cover transition-transform duration-500 hover:scale-105 ${imagePosition}`}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <Icon className="text-clay" size={18} />
                    <h3 className="font-display text-xl text-ink">{title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-ink/60">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-clay">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 px-6 py-14 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Have a space in mind?</h2>
            <p className="mt-2 text-sm text-white/80">
              Talk to our team about custom lighting, décor and interior solutions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={getWhatsAppUrl("Hello, I would like to discuss a custom lighting, décor, or interior solution.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-clay transition-colors hover:bg-sand"
            >
              <MessageCircle size={17} />
              Chat on WhatsApp
            </a>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View collection
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
