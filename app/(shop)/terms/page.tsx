export const metadata = { title: "Terms of Service | TheGanaGallery" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Terms of Service</h1>
      {/* TODO: confirm last-updated date whenever this page is next edited */}
      <p className="mt-2 text-xs text-ink/50">Last updated: [date]</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink/80">
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Overview</h2>
          <p>These terms govern your use of TheGanaGallery website and your purchase of products from us. By placing an order, you agree to these terms.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Products</h2>
          <p>Our products are handcrafted from natural materials like teak wood. Minor variations in grain, color, and finish between the product photo and the item you receive are natural and not considered defects.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Pricing & payment</h2>
          <p>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Payments are processed securely through Razorpay.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Order acceptance</h2>
          <p>We reserve the right to cancel any order due to stock unavailability, pricing errors, or suspected fraudulent activity. In such cases, a full refund will be issued.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Intellectual property</h2>
          <p>All content on this site, including product photography and text, is the property of TheGanaGallery and may not be reproduced without permission.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Governing law</h2>
          {/* TODO: confirm jurisdiction, likely your registered business state */}
          <p>These terms are governed by the laws of India, with disputes subject to the jurisdiction of courts in Meerut, Uttar Pradesh.</p>
        </section>
      </div>
    </div>
  );
}