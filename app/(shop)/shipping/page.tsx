export const metadata = { title: "Shipping & Delivery | TheGanaGallery" };

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Shipping & Delivery</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink/80">
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Processing time</h2>
          {/* TODO: confirm actual handling time for hand-finished items */}
          <p>Each piece is handcrafted and inspected before dispatch. Orders are typically processed within 2–4 business days.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Delivery timelines</h2>
          {/* TODO: confirm actual courier partner and timelines */}
          <p>Once dispatched, orders are delivered within 5–9 business days depending on your location within India. You'll receive a tracking link by email/SMS once your order ships.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Shipping charges</h2>
          {/* TODO: confirm actual shipping fee structure / free shipping threshold */}
          <p>Shipping charges, if any, are calculated at checkout based on your delivery location and order size.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Damaged or lost shipments</h2>
          <p>All orders are packed carefully to survive transit. If your order arrives damaged, please contact us within 48 hours of delivery with photos of the item and packaging, and we'll arrange a replacement or refund.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">International shipping</h2>
          {/* TODO: confirm if international shipping is offered */}
          <p>Currently, we ship only within India. International shipping may be considered on request — contact us to check availability for your location.</p>
        </section>
      </div>
    </div>
  );
}