"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth";

const links = [
  { href: "/admin",          label: "Overview",  icon: "📊" },
  { href: "/admin/products", label: "Products",  icon: "🧺" },
  { href: "/admin/orders",   label: "Orders",    icon: "📦" },
  { href: "/admin/users",    label: "Users",     icon: "👥" },
  { href: "/admin/reviews",  label: "Reviews",   icon: "⭐" },
  { href: "/admin/settings", label: "Settings",  icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-sand-dark/60 bg-white md:w-60 md:border-b-0 md:border-r">
      <div className="px-6 py-5">
        <Link href="/" className="font-display text-xl text-ink">
          TheGana<span className="text-clay">Gallery</span>
        </Link>
        <span className="mt-0.5 block text-xs font-medium uppercase tracking-widest text-ink/40">
          Admin Panel
        </span>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-clay text-white" : "text-ink/70 hover:bg-sand"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-sand-dark/60 px-6 py-4 md:block">
        <Link href="/" className="mb-3 block text-sm font-medium text-ink/60 hover:text-clay">
          ← Back to shop
        </Link>
        <button onClick={() => signOut()}
          className="text-sm font-medium text-ink/60 hover:text-clay">
          Sign out
        </button>
      </div>
    </aside>
  );
}
