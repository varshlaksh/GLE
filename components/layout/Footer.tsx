import Link from "next/link";
import Image from "next/image";
import { MessageCircle, CreditCard, Smartphone, Landmark, Truck, ShieldCheck } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const QUICK_LINKS = [
  { href: "/about",    label: "About Us" },
  { href: "/contact",  label: "Contact" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/privacy",  label: "Privacy & Terms" },
  { href: "/faq",      label: "FAQs" },
];

// TODO: replace these with your real details
const WHATSAPP_NUMBER = "919528783702";              // e.g. "919876543210", no + or spaces
const INSTAGRAM_URL   = "https://instagram.com/theganagallery";
const FACEBOOK_URL    = "https://facebook.com/theganagallery";
const SUPPORT_PHONE   = "+91 6399937135";
const SUPPORT_EMAIL   = "theganagallery@gmail.com";
const ADDRESS         = "Meerut, Uttar Pradesh, India";
const GSTIN           = "09BMZPK6472L1ZX";           // your actual GSTIN, or remove this line until registered

// Only shows categories that actually have at least one active product,
// so footer links never lead to an empty "No products found" page.
async function getTopCategories() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("name, slug, products!inner(id)")
    .eq("is_active", true)
    .eq("products.is_active", true)
    .order("display_order")
    .limit(4);
  return data ?? [];
}

export default async function Footer() {
  const categories = await getTopCategories();

  return (
    <footer className="border-t border-sand-dark/70 bg-sand-dark/40">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">

          {/* Brand — logo sized and vertically centered against the wordmark */}
<div className="md:col-span-1">
  <div className="flex flex-col items-center text-center">
    {/* Logo */}
    <Link href="/" aria-label="TheGanaGallery Home">
      <Image
        src="/images/logo.png"
        alt="TheGanaGallery logo"
        width={72}
        height={72}
        className="h-[72px] w-[72px] rounded-lg object-contain"
      />
    </Link>

    {/* Brand Name */}
    <Link
      href="/"
      className="mt-3 font-display text-2xl leading-tight text-ink"
    >
      TheGana<span className="text-clay">Gallery</span>
    </Link>

    {/* Company */}
    <Link
      href="/about"
      className="mt-2 text-xs text-ink/50 underline decoration-ink/20 underline-offset-2 transition-colors hover:text-clay hover:decoration-clay"
    >
      c/o Ganalaxmi Enterprises
    </Link>

    {/* Social Icons */}
    <div className="mt-5 flex justify-center gap-3">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-clay hover:text-clay"
      >
        <InstagramIcon />
      </a>

      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-clay hover:text-clay"
      >
        <FacebookIcon />
      </a>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-clay hover:text-clay"
      >
        <MessageCircle size={17} />
      </a>
    </div>
  </div>
</div>

          {/* Shop — top categories that actually have products, dynamic from DB */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-clay">Shop</h3>
            <ul className="mt-4 space-y-2.5">
              {categories.map(c => (
                <li key={c.slug}>
                  <Link href={`/products?category=${encodeURIComponent(c.name)}`}
                    className="text-sm text-ink/70 transition-colors hover:text-clay">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="text-sm font-medium text-clay transition-colors hover:text-clay-dark">
                  View all →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-clay">Contact Us</h3>
            <div className="mt-4 space-y-2.5 text-sm text-ink/70">
              <p>{SUPPORT_PHONE}</p>
              <p>{SUPPORT_EMAIL}</p>
              <p className="max-w-[190px]">{ADDRESS}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-clay">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink/70 transition-colors hover:text-clay">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-sand-dark/70 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink/50">
              © {new Date().getFullYear()} Ganalaxmi Enterprises. All rights reserved.
            </p>
            <p className="text-xs text-ink/50">GSTIN: {GSTIN}</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-ink/50">
            <span className="flex items-center gap-1.5 text-xs"><CreditCard size={14} /> Cards</span>
            <span className="flex items-center gap-1.5 text-xs"><Smartphone size={14} /> UPI</span>
            <span className="flex items-center gap-1.5 text-xs"><Landmark size={14} /> Net Banking</span>
            <span className="flex items-center gap-1.5 text-xs"><ShieldCheck size={14} /> Secure checkout via Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}