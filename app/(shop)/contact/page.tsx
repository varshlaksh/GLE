import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = { title: "Contact Us | TheGanaGallery" };

// TODO: replace with your real details
const SUPPORT_EMAIL = "theganagallery@gmail.com";
const SUPPORT_PHONE = "+91 9897965454";
const ADDRESS = "Meerut, Uttar Pradesh, India";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <span className="text-sm font-medium uppercase tracking-widest text-clay">Get in touch</span>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Contact us</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
        Questions about an order, a product, or a custom request? We usually reply within a day.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 text-clay" size={18} />
            <div>
              <p className="text-sm font-medium text-ink">Email</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-ink/70 hover:text-clay">{SUPPORT_EMAIL}</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 text-clay" size={18} />
            <div>
              <p className="text-sm font-medium text-ink">Phone</p>
              <p className="text-sm text-ink/70">{SUPPORT_PHONE}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 text-clay" size={18} />
            <div>
              <p className="text-sm font-medium text-ink">Address</p>
              <p className="text-sm text-ink/70">{ADDRESS}</p>
            </div>
          </div>
        </div>

        {/* NOTE: this form currently just opens the user's mail client.
            To actually receive submissions in-app, wire this to a new
            /api/contact route that emails you (e.g. via Resend/SendGrid) —
            ask me for that build once you're ready. */}
        <form
          action={`mailto:${SUPPORT_EMAIL}`}
          method="post"
          encType="text/plain"
          className="space-y-4 rounded-2xl border border-sand-dark/60 bg-white p-6"
        >
          <div>
            <label className="block text-sm font-medium text-ink">Name</label>
            <input required name="name" type="text"
              className="mt-1.5 w-full rounded-lg border border-sand-dark px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Email</label>
            <input required name="email" type="email"
              className="mt-1.5 w-full rounded-lg border border-sand-dark px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Message</label>
            <textarea required name="message" rows={4}
              className="mt-1.5 w-full rounded-lg border border-sand-dark px-3.5 py-2.5 text-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20" />
          </div>
          <button type="submit"
            className="w-full rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark">
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}