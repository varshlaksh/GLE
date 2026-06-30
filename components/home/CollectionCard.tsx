"use client";

import Link from "next/link";
import Image from "next/image";

export interface CollectionItem {
  name: string;
  image: string;
  href: string;
}

export default function CollectionCard({ collection }: { collection: CollectionItem }) {
  return (
    <Link
      href={collection.href}
      className="group relative flex aspect-[3/4] overflow-hidden rounded-2xl bg-sand shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-clay/15 hover:-translate-y-1"
    >
      {/* Background image */}
      <Image
        src={collection.image}
        alt={collection.name}
        fill
        sizes="(min-width: 1024px) 12.5vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

      {/* Shimmer line on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Title */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-base leading-tight text-white drop-shadow-sm transition-transform duration-300 group-hover:-translate-y-1 sm:text-lg">
          {collection.name}
        </h3>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-white/70 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
          Shop now
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
