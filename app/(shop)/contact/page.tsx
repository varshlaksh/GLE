import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { BUSINESS_DETAILS, getWhatsAppUrl } from "@/lib/business-details";

export const metadata = { title: "Contact Us | TheGanaGallery" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <span className="text-sm font-medium uppercase tracking-widest text-clay">Get in touch</span>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Contact us</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
        Questions about an order, a product, or a custom request? We usually reply within a day.
      </p>

      <div className="mt-8 rounded-2xl border border-sand-dark/60 bg-white p-6">
        <h2 className="font-display text-xl text-ink">Personal assistance on WhatsApp</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
          Connect directly with our owner and support team for product help, custom pieces,
          home interior solutions, or offline purchase options.
        </p>
        <a
          href={getWhatsAppUrl("Hello, I would like help with customization, home interior solutions, or an offline purchase.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <MessageCircle size={17} aria-hidden="true" />
          Chat with our team
        </a>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 text-clay" size={18} />
            <div>
              <p className="text-sm font-medium text-ink">Email</p>
              <a href={`mailto:${BUSINESS_DETAILS.supportEmail}`} className="text-sm text-ink/70 hover:text-clay">
                {BUSINESS_DETAILS.supportEmail}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 text-clay" size={18} />
            <div>
              <p className="text-sm font-medium text-ink">Phone</p>
              <div className="flex flex-col">
                {BUSINESS_DETAILS.supportPhones.map((phone) => (
                  <a key={phone.href} href={phone.href} className="text-sm text-ink/70 hover:text-clay">
                    {phone.display}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 text-clay" size={18} />
            <div>
              <p className="text-sm font-medium text-ink">Address</p>
              <p className="text-sm text-ink/70">{BUSINESS_DETAILS.address}</p>
            </div>
          </div>
        </div>

        {/* NOTE: this form currently just opens the user's mail client.
            To actually receive submissions in-app, wire this to a new
            /api/contact route that emails you (e.g. via Resend/SendGrid) —
            ask me for that build once you're ready. */}
        <form
          action={`mailto:${BUSINESS_DETAILS.supportEmail}`}
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
