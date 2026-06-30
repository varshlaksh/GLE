import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-sand">
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 block text-center font-display text-2xl tracking-tight text-ink"
          >
            TheGana<span className="text-clay">Gallery</span>
          </Link>
          <div className="rounded-2xl border border-sand-dark/60 bg-white p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
