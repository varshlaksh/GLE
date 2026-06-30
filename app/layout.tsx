import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://theganagallery.com";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces  = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#b3553c",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TheGanaGallery — Handcrafted Indian Decor & Art",
    template: "%s | TheGanaGallery",
  },
  description:
    "Discover handcrafted Indian home decor — Wall Decor, Cherial Art, Metal Ware, Carved Wooden Decor, Clock Art Paintings and more. Each piece made by skilled artisans across India.",
  keywords: [
    "handcrafted decor",
    "Indian art",
    "Wall Decor",
    "Cherial Art",
    "Metal Ware",
    "Wooden Decor",
    "Clock Art",
    "home decor India",
    "artisan products",
    "TheGanaGallery",
  ],
  authors: [{ name: "TheGanaGallery", url: SITE_URL }],
  creator: "TheGanaGallery",
  publisher: "TheGanaGallery",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "TheGanaGallery",
    title: "TheGanaGallery — Handcrafted Indian Decor & Art",
    description:
      "Discover handcrafted Indian home decor — Wall Decor, Cherial Art, Metal Ware, Carved Wooden Decor, and more.",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "TheGanaGallery — Handcrafted Indian Decor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheGanaGallery — Handcrafted Indian Decor & Art",
    description:
      "Discover handcrafted Indian home decor — Wall Decor, Cherial Art, Metal Ware, Carved Wooden Decor, and more.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Add your Google Search Console verification token here
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
