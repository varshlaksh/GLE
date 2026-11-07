"use client";

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { useUser, signOut } from "@/lib/auth";
import { useCartStore } from "@/lib/cartStore";
import { createClient } from "@/lib/supabase-browser";

const navLinks = [
  { href: "/",        label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about",   label: "About" },
];

const subscribeToHydration = () => () => {};

export default function Navbar() {
  const { user, loading } = useUser();
  const itemCount = useCartStore((s) => s.itemCount());
  const [open,    setOpen]    = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const isAdmin = Boolean(user && adminUserId === user.id);

  // Check admin role
  useEffect(() => {
    if (!user) return;
    let active = true;
    const supabase = createClient();
    supabase.from("profiles").select("role").eq("id", user.id).single()
      .then(({ data }) => {
        if (active) setAdminUserId(data?.role === "admin" ? user.id : null);
      });
    return () => { active = false; };
  }, [user]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-sand-dark/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">

        {/* Parent company + brand lockup */}
        <Link
          href="/"
          aria-label="GANALAXMI ENTERPRISES presents TheGanaGallery"
          className="group shrink-0 leading-none"
        >
          <span className="block text-center font-display text-[10px] font-semibold tracking-[0.09em] text-clay sm:text-xs sm:tracking-[0.12em] lg:text-sm">
            GANALAXMI ENTERPRISES
          </span>
          <span className="mt-1 flex items-center justify-center gap-2 font-display text-[9px] italic tracking-[0.12em] text-ink/60 sm:text-[10px]">
            <span aria-hidden="true" className="h-px w-7 bg-clay/45 sm:w-10" />
            presents
            <span aria-hidden="true" className="h-px w-7 bg-clay/45 sm:w-10" />
          </span>
          <span className="mt-1 block text-center font-display text-xl tracking-tight text-ink transition-colors group-hover:text-ink/80 sm:text-2xl">
            TheGana<span className="text-clay">Gallery</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="text-base font-medium text-ink/70 transition-colors hover:text-clay">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-5 md:flex">
          {!loading && user && isAdmin && (
            <Link href="/admin"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-clay">
              Admin ↗
            </Link>
          )}
          {!loading && (
            user ? (
              <div className="flex items-center gap-4">
                <Link href="/orders"
                  className="text-base font-medium text-ink/70 hover:text-clay">
                  Orders
                </Link>
                <Link href="/profile"
                  className="text-base font-medium text-ink/70 hover:text-clay">
                  Profile
                </Link>
                <button onClick={handleSignOut}
                  className="text-base font-medium text-ink/70 hover:text-clay">
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/login"
                className="text-base font-medium text-ink/70 hover:text-clay">
                Sign in
              </Link>
            )
          )}

          {/* Cart */}
          <Link href="/cart"
            className="relative inline-flex items-center justify-center rounded-full border border-sand-dark p-2.5 text-ink/80 transition-colors hover:border-clay hover:text-clay"
            aria-label="Cart">
            <CartIcon />
            {mounted && itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[11px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/cart"
            className="relative inline-flex items-center justify-center rounded-full border border-sand-dark p-2 text-ink/80">
            <CartIcon />
            {mounted && itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[11px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <button className="p-2 text-ink" onClick={() => setOpen(o => !o)} aria-label="Menu">
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-sand-dark/70 bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink/80 hover:text-clay">
                {link.label}
              </Link>
            ))}
            {!loading && user && (
              <>
                <Link href="/orders" onClick={() => setOpen(false)}
                  className="text-sm font-medium text-ink/80 hover:text-clay">Orders</Link>
                <Link href="/profile" onClick={() => setOpen(false)}
                  className="text-sm font-medium text-ink/80 hover:text-clay">Profile</Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)}
                    className="inline-flex w-fit rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white">
                    Admin ↗
                  </Link>
                )}
                <button onClick={handleSignOut}
                  className="text-left text-sm font-medium text-ink/80 hover:text-clay">
                  Sign out
                </button>
              </>
            )}
            {!loading && !user && (
              <Link href="/login" onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink/80 hover:text-clay">Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
}
function CloseIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
}
function CartIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
}
