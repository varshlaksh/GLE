import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this app even when another lockfile exists above it.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Allow any HTTPS image source (Cloudinary, Unsplash, brand CDNs, etc.)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "localhost" },
    ],
    // placehold.co returns SVG placeholders — allow them safely
    // (they're simple text-on-color images, no embedded scripts)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
