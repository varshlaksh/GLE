import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ganagallery.shop";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces  = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#6b4423",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Gana Gallery | Teak Wood Lamps & Indian Home Decor",
    template: "%s | The Gana Gallery",
  },
  description:
    "Shop handcrafted Indian home decor, teak wood lamps, wall decor, carved wooden art and artisan pieces made by skilled craftspeople across India.",
  keywords: [
    "teak wood lamps",
    "handcrafted home decor",
    "Indian home decor",
    "wooden decor",
    "artisan decor",
    "handcrafted Indian decor",
    "The Gana Gallery",
  ],
  authors: [{ name: "The Gana Gallery", url: SITE_URL }],
  creator: "The Gana Gallery",
  publisher: "The Gana Gallery",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "The Gana Gallery",
    title: "The Gana Gallery | Teak Wood Lamps & Indian Home Decor",
    description:
      "Shop handcrafted Indian home decor, teak wood lamps, wall decor and artisan pieces made across India.",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "The Gana Gallery — Handcrafted Indian Home Decor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Gana Gallery | Teak Wood Lamps & Indian Home Decor",
    description:
      "Shop handcrafted Indian home decor, teak wood lamps, wall decor and artisan pieces made across India.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Add your Google Search Console verification token here once you have it
    // google: "your-verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-ink">
        {children}
      </body>
    </html>
  );
}