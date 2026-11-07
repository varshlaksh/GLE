"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { HomepageContent } from "@/lib/homepage-content";

export default function HeroCarousel({ content }: { content: HomepageContent }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = content.slides.length;

  const showSlide = useCallback(
    (index: number) => {
      setActiveIndex((index + slideCount) % slideCount);
    },
    [slideCount],
  );

  useEffect(() => {
    if (slideCount < 2 || content.carouselAutoplayMs <= 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;

    const updateAutoplay = () => {
      if (timer) clearInterval(timer);
      timer = undefined;

      if (!reducedMotion.matches) {
        timer = setInterval(
          () => setActiveIndex((current) => (current + 1) % slideCount),
          content.carouselAutoplayMs,
        );
      }
    };

    updateAutoplay();
    reducedMotion.addEventListener("change", updateAutoplay);

    return () => {
      if (timer) clearInterval(timer);
      reducedMotion.removeEventListener("change", updateAutoplay);
    };
  }, [content.carouselAutoplayMs, slideCount]);

  if (slideCount === 0) return null;

  return (
    <section className="border-b border-sand-dark/60 bg-sand">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-[0.9fr_1.1fr] md:py-20 lg:gap-14 lg:py-24">
        <div className="max-w-xl">
          <span className="text-sm font-medium uppercase tracking-widest text-clay">
            {content.heroEyebrow}
          </span>
          <h1 className="mt-5 font-display text-4xl leading-[1.06] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.6rem]">
            {content.heroHeadline}
          </h1>
          <span aria-hidden="true" className="mt-6 block h-0.5 w-16 bg-clay" />
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">
            {content.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={content.primaryCta.href}
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-clay-dark/20 bg-clay px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(184,80,47,0.18)] transition-all hover:-translate-y-0.5 hover:bg-clay-dark hover:shadow-[0_12px_28px_rgba(184,80,47,0.24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay sm:justify-start"
            >
              {content.primaryCta.label}
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href={content.secondaryCta.href}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-clay/55 bg-background/45 px-6 py-3 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] transition-all hover:-translate-y-0.5 hover:border-clay hover:bg-background hover:text-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
            >
              {content.secondaryCta.label}
            </Link>
          </div>
          <a
            href={content.supportCta.href}
            target="_blank"
            rel="noreferrer"
            className="group mt-5 inline-flex max-w-lg items-center gap-3 rounded-2xl border border-[#25D366]/20 bg-background/55 px-4 py-3 text-sm leading-snug text-ink/70 transition-colors hover:border-[#25D366]/40 hover:bg-background hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366]/12 text-[#168a43] transition-colors group-hover:bg-[#25D366]/18">
              <MessageCircle size={18} aria-hidden="true" />
            </span>
            <span>
              <strong className="font-semibold text-ink">{content.supportCta.title}</strong>{" "}
              {content.supportCta.label}
            </span>
          </a>
        </div>

        <div
          className="group relative aspect-[4/3] min-h-[22rem] overflow-hidden rounded-[1.75rem] bg-ink shadow-[0_24px_60px_rgba(43,35,29,0.16)]"
          role="region"
          aria-roledescription="carousel"
          aria-label="Homepage highlights"
        >
          {content.slides.map((slide, index) => {
            const active = index === activeIndex;

            return (
              <div
                key={`${slide.imagePath}-${slide.title}`}
                className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                  active ? "z-10 opacity-100" : "pointer-events-none opacity-0"
                }`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slideCount}`}
                aria-hidden={!active}
              >
                <Image
                  src={slide.imagePath}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                  <h2 className="font-display text-2xl sm:text-3xl">{slide.title}</h2>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-white/85">
                    {slide.description}
                  </p>
                  {slide.cta && (
                    <Link
                      href={slide.cta.href}
                      tabIndex={active ? undefined : -1}
                      className="mt-3 inline-flex text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
                    >
                      {slide.cta.label} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {slideCount > 1 && (
            <>
              <button
                type="button"
                onClick={() => showSlide(activeIndex - 1)}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/85 p-2 text-ink shadow-sm transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Show previous slide"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                onClick={() => showSlide(activeIndex + 1)}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/85 p-2 text-ink shadow-sm transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Show next slide"
              >
                <Chevron direction="right" />
              </button>
              <div className="absolute bottom-3 right-4 z-20 flex gap-2" aria-label="Choose slide">
                {content.slides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => showSlide(index)}
                    className={`h-2.5 rounded-full border border-white/80 transition-[width,background-color] motion-reduce:transition-none ${
                      index === activeIndex ? "w-7 bg-white" : "w-2.5 bg-white/25 hover:bg-white/60"
                    }`}
                    aria-label={`Show slide ${index + 1}: ${slide.title}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}
