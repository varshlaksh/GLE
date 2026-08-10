export const metadata = { title: "Returns & Refunds | TheGanaGallery" };

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Returns & Refunds</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink/80">
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Return window</h2>
          {/* TODO: confirm actual return window, e.g. 7 days */}
          <p>You may request a return within 7 days of delivery, provided the item is unused, in its original packaging, and in the same condition you received it.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Non-returnable items</h2>
          <p>Custom or made-to-order pieces, and items marked as final sale, cannot be returned unless they arrive damaged or defective.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">How to request a return</h2>
          <p>Contact us at our support email with your order number and reason for return. We'll confirm eligibility and share pickup/drop-off instructions.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Refunds</h2>
          {/* TODO: confirm actual refund timeline */}
          <p>Once we receive and inspect the returned item, refunds are processed to your original payment method within 5–7 business days.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Damaged or incorrect items</h2>
          <p>If you receive a damaged, defective, or incorrect item, contact us within 48 hours of delivery with photos — we'll arrange a free replacement or full refund, no return shipping cost to you.</p>
        </section>
      </div>
    </div>
  );
}