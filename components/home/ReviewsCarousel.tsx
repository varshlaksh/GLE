"use client";

import { useEffect, useRef, useState } from "react";

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  avatar_url: string | null;
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= rating ? "#b3553c" : "none"}
          stroke={i <= rating ? "#b3553c" : "#d4c9bc"}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [imgError, setImgError] = useState(false);
  const initial = name.charAt(0).toUpperCase();
  const colors = ["#b3553c", "#6b7a5e", "#92402b", "#5a6b4e", "#c4674e"];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (avatarUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-white shadow-sm text-lg font-bold text-white"
      style={{ background: color }}
    >
      {initial}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-sand-dark/60 bg-white p-6 shadow-sm">
      <div>
        <StarRating rating={review.rating} />
        <blockquote className="mt-4 text-sm leading-relaxed text-ink/80">
          &ldquo;{review.quote}&rdquo;
        </blockquote>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Avatar name={review.name} avatarUrl={review.avatar_url} />
        <div>
          <p className="text-sm font-semibold text-ink">{review.name}</p>
          {review.location && (
            <p className="text-xs text-ink/50">{review.location}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Submit Review Modal ────────────────────────────────
function SubmitReviewModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", location: "", rating: 5, quote: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.quote.trim()) {
      setError("Please fill in all required fields."); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Something went wrong");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl text-ink">Share Your Experience</h3>
            <p className="mt-1 text-xs text-ink/50">Your review will appear after admin approval.</p>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Rating *</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <button
                  key={i} type="button"
                  onClick={() => set("rating", i)}
                  className="transition-transform hover:scale-110"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24"
                    fill={i <= form.rating ? "#b3553c" : "none"}
                    stroke={i <= form.rating ? "#b3553c" : "#ccc"}
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Your Name *</label>
              <input
                type="text" value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Ananya R."
                className="w-full rounded-lg border border-sand-dark px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">City</label>
              <input
                type="text" value={form.location} onChange={e => set("location", e.target.value)}
                placeholder="Bengaluru"
                className="w-full rounded-lg border border-sand-dark px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Email Address *</label>
            <input
              type="email" value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-sand-dark px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
            />
            <p className="mt-1 text-xs text-ink/40">Used for verification only. Not displayed publicly.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Your Review *</label>
            <textarea
              value={form.quote} onChange={e => set("quote", e.target.value)}
              rows={3} placeholder="Tell us about your experience with our products…"
              className="w-full rounded-lg border border-sand-dark px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20 resize-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit" disabled={submitting}
              className="flex-1 rounded-full bg-clay py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
            <button
              type="button" onClick={onClose}
              className="rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink hover:border-clay hover:text-clay"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Carousel Component ─────────────────────────────
export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [current, setCurrent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(j => setReviews(j.data ?? []));
  }, []);

  // Cards per slide based on width
  const [perPage, setPerPage] = useState(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setPerPage(1);
      else if (window.innerWidth < 1024) setPerPage(2);
      else setPerPage(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalSlides = Math.max(1, reviews.length - perPage + 1);

  const startAuto = () => {
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % totalSlides);
    }, 4000);
  };

  const stopAuto = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (reviews.length > perPage) { startAuto(); }
    return stopAuto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews.length, perPage, totalSlides]);

  const prev = () => { stopAuto(); setCurrent(c => (c - 1 + totalSlides) % totalSlides); startAuto(); };
  const next = () => { stopAuto(); setCurrent(c => (c + 1) % totalSlides); startAuto(); };

  const visibleReviews = reviews.slice(current, current + perPage);

  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-medium uppercase tracking-widest text-clay">
            From our customers
          </span>
          <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Words from the gallery
          </h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto rounded-full border border-clay px-5 py-2.5 text-sm font-semibold text-clay transition-colors hover:bg-clay hover:text-white"
        >
          + Write a Review
        </button>
      </div>

      {/* Submitted success */}
      {submitted && (
        <div className="mb-6 rounded-xl bg-moss/10 border border-moss/20 px-4 py-3 text-sm text-moss font-medium">
          ✓ Thank you! Your review has been submitted and will appear after admin approval.
        </div>
      )}

      {/* Carousel */}
      <div className="relative" onMouseEnter={stopAuto} onMouseLeave={startAuto}>
        {/* Cards */}
        <div
          className="grid gap-4 transition-all duration-500"
          style={{ gridTemplateColumns: `repeat(${perPage}, 1fr)` }}
        >
          {visibleReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Nav arrows */}
        {reviews.length > perPage && (
          <>
            <button
              onClick={prev}
              className="absolute -left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-sand-dark bg-white shadow-sm transition-colors hover:border-clay hover:text-clay sm:-left-5"
              aria-label="Previous"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute -right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-sand-dark bg-white shadow-sm transition-colors hover:border-clay hover:text-clay sm:-right-5"
              aria-label="Next"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {reviews.length > perPage && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => { stopAuto(); setCurrent(i); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-clay" : "w-2 bg-sand-dark"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <SubmitReviewModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 8000);
          }}
        />
      )}
    </section>
  );
}
