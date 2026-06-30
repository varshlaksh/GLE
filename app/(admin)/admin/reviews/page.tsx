"use client";

import { useEffect, useState } from "react";

interface Review {
  id: string;
  name: string;
  email: string;
  location: string;
  rating: number;
  quote: string;
  avatar_url: string | null;
  is_approved: boolean;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchReviews = () => {
    fetch("/api/admin/reviews")
      .then(r => r.json())
      .then(j => setReviews(j.data ?? []))
      .catch(() => setReviews([]));
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleApproval = async (review: Review) => {
    setLoading(review.id);
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_approved: !review.is_approved }),
    });
    fetchReviews();
    setLoading(null);
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setLoading(id);
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    fetchReviews();
    setLoading(null);
  };

  const pending  = reviews?.filter(r => !r.is_approved) ?? [];
  const approved = reviews?.filter(r => r.is_approved) ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink">Customer Reviews</h1>
        <p className="mt-1 text-sm text-ink/60">
          Approve or reject submitted reviews. Only approved reviews appear on the homepage.
        </p>
      </div>

      {reviews === null ? (
        <div className="flex items-center gap-2 text-sm text-ink/60">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-clay border-t-transparent" />
          Loading reviews…
        </div>
      ) : (
        <>
          {/* Pending */}
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-display text-lg text-ink">Pending Approval</h2>
              {pending.length > 0 && (
                <span className="rounded-full bg-clay px-2 py-0.5 text-xs font-semibold text-white">
                  {pending.length}
                </span>
              )}
            </div>
            {pending.length === 0 ? (
              <p className="text-sm text-ink/50">No reviews pending. You&apos;re all caught up!</p>
            ) : (
              <div className="space-y-4">
                {pending.map(r => (
                  <ReviewCard
                    key={r.id} review={r} loading={loading === r.id}
                    onToggle={() => toggleApproval(r)}
                    onDelete={() => deleteReview(r.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Approved */}
          <section>
            <h2 className="mb-4 font-display text-lg text-ink">
              Approved ({approved.length})
            </h2>
            {approved.length === 0 ? (
              <p className="text-sm text-ink/50">No approved reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {approved.map(r => (
                  <ReviewCard
                    key={r.id} review={r} loading={loading === r.id}
                    onToggle={() => toggleApproval(r)}
                    onDelete={() => deleteReview(r.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i <= rating ? "#b3553c" : "none"}
          stroke={i <= rating ? "#b3553c" : "#ccc"}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({
  review, loading, onToggle, onDelete
}: {
  review: Review;
  loading: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`rounded-2xl border bg-white p-5 transition-all ${
      review.is_approved ? "border-moss/30" : "border-clay/30"
    }`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-sand">
            {review.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={review.avatar_url} alt={review.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-clay">
                {review.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">{review.name}</p>
            <p className="text-xs text-ink/50">{review.email} · {review.location}</p>
            <StarRating rating={review.rating} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink/40">
          <span>{new Date(review.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
          <span className={`rounded-full px-2 py-0.5 font-medium ${review.is_approved ? "bg-moss/10 text-moss" : "bg-clay/10 text-clay"}`}>
            {review.is_approved ? "Approved" : "Pending"}
          </span>
        </div>
      </div>

      <blockquote className="mt-3 text-sm leading-relaxed text-ink/80 border-l-2 border-sand-dark pl-3">
        &ldquo;{review.quote}&rdquo;
      </blockquote>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onToggle}
          disabled={loading}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
            review.is_approved
              ? "bg-sand text-ink hover:bg-sand-dark"
              : "bg-clay text-white hover:bg-clay-dark"
          }`}
        >
          {loading ? "…" : review.is_approved ? "Revoke Approval" : "✓ Approve"}
        </button>
        <button
          onClick={onDelete}
          disabled={loading}
          className="rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold text-ink/60 hover:border-clay hover:text-clay disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
