export const metadata = { title: "Privacy Policy | TheGanaGallery" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Privacy Policy</h1>
      {/* TODO: confirm last-updated date whenever this page is next edited */}
      <p className="mt-2 text-xs text-ink/50">Last updated: [date]</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink/80">
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Information we collect</h2>
          <p>When you create an account, place an order, or contact us, we collect information such as your name, email address, phone number, shipping address, and payment details. Payment details are processed securely by our payment partner, Razorpay, and are not stored on our servers.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">How we use your information</h2>
          <p>We use your information to process orders, communicate order updates, respond to support queries, and improve our products and services. We do not sell your personal information to third parties.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Data sharing</h2>
          <p>We share order information only with the service providers necessary to fulfill your order — such as our courier partner (for delivery) and payment processor (for transactions).</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Cookies</h2>
          <p>We use cookies to keep you signed in and to remember items in your cart. You can disable cookies in your browser, though some site features may not work correctly as a result.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Your rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg text-ink">Contact</h2>
          {/* TODO: confirm final support email */}
          <p>For any privacy-related questions, contact us at hello@theganagallery.com.</p>
        </section>
      </div>
    </div>
  );
}