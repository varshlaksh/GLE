import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ganagallery.shop";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces  = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Ganalaxmi Enterprises",
      legalName: "GANALAXMI ENTERPRISES",
      alternateName: ["The Gana Gallery", "TheGanaGallery"],
      url: SITE_URL,
      brand: {
        "@type": "Brand",
        name: "The Gana Gallery",
        alternateName: "TheGanaGallery",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "The Gana Gallery",
      alternateName: ["TheGanaGallery", "Ganalaxmi Enterprises"],
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#6b4423",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Gana Gallery by Ganalaxmi Enterprises | Indian Home Decor",
    template: "%s | The Gana Gallery",
  },
  description:
    "Ganalaxmi Enterprises presents The Gana Gallery — handcrafted Indian home decor, teak wood lamps, wall decor, carved wooden art and artisan pieces.",
  keywords: [
    "teak wood lamps",
    "handcrafted home decor",
    "Indian home decor",
    "wooden decor",
    "artisan decor",
    "handcrafted Indian decor",
    "The Gana Gallery",
    "TheGanaGallery",
    "Ganalaxmi Enterprises",
    "GANALAXMI ENTERPRISES",
  ],
  authors: [{ name: "Ganalaxmi Enterprises", url: SITE_URL }],
  creator: "The Gana Gallery",
  publisher: "Ganalaxmi Enterprises",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "The Gana Gallery by Ganalaxmi Enterprises",
    title: "Ganalaxmi Enterprises presents The Gana Gallery",
    description:
      "Discover handcrafted Indian home decor, teak wood lamps, wall decor and artisan pieces from The Gana Gallery by Ganalaxmi Enterprises.",
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
    title: "Ganalaxmi Enterprises presents The Gana Gallery",
    description:
      "Discover handcrafted Indian decor from The Gana Gallery by Ganalaxmi Enterprises.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
