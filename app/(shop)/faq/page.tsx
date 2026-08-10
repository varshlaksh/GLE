export const metadata = { title: "FAQs | TheGanaGallery" };

const FAQS = [
  {
    q: "What materials are your products made from?",
    a: "Our lighting and decor pieces are handcrafted primarily from solid teak wood, finished by hand. Natural grain variation means no two pieces are exactly alike.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are typically processed within 2–4 business days and delivered within 5–9 business days across India, depending on your location.",
  },
  {
    q: "Can I return or exchange a product?",
    a: "Yes — most items can be returned within 7 days of delivery if unused and in original packaging. See our Returns & Refunds page for full details.",
  },
  {
    q: "Do you offer custom sizing or finishes?",
    a: "Custom requests are considered on a case-by-case basis. Contact us with your requirements and we'll let you know what's possible.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive a tracking link via email or SMS. You can also check order status under 'Order history' in your account.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, credit/debit cards, and net banking, processed securely through Razorpay.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Frequently Asked Questions</h1>
      <div className="mt-8 space-y-4">
        {FAQS.map((item) => (
          <details key={item.q} className="group rounded-xl border border-sand-dark/60 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-ink">
              {item.q}
              <span className="ml-4 text-ink/40 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}