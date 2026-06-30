import Link from "next/link";

const shopLinks = [
  { href: "/products",            label: "All products" },
  { href: "/products?category=Baskets",   label: "Baskets" },
  { href: "/products?category=Pottery",   label: "Pottery" },
  { href: "/products?category=Textiles",  label: "Textiles" },
  { href: "/about",               label: "About us" },
];

const accountLinks = [
  { href: "/login",    label: "Sign in" },
  { href: "/signup",   label: "Create account" },
  { href: "/profile",  label: "My profile" },
  { href: "/orders",   label: "Order history" },
  { href: "/cart",     label: "Cart" },
];

export default function Footer() {
  return (
    <footer className="border-t border-sand-dark/70 bg-sand">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl text-ink">
              TheGana<span className="text-clay">Gallery</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/70">
              A small gallery of handwoven baskets, hand-thrown pottery, and
              hand-loomed textiles — made by independent makers across India.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-wide text-ink/60">Shop</h3>
            <ul className="mt-4 space-y-2">
              {shopLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-ink/70 transition-colors hover:text-clay">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-wide text-ink/60">Account</h3>
            <ul className="mt-4 space-y-2">
              {accountLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-ink/70 transition-colors hover:text-clay">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-sand-dark/70 pt-6 text-xs text-ink/50">
          © {new Date().getFullYear()} TheGanaGallery. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
