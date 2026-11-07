import { getWhatsAppUrl } from "@/lib/business-details";

export type HomepageLink = Readonly<{
  label: string;
  href: string;
}>;

export type HomepageSupportLink = Readonly<{
  title: string;
  label: string;
  href: string;
}>;

export type HeroSlide = Readonly<{
  title: string;
  description: string;
  imagePath: string;
  alt: string;
  cta?: HomepageLink;
}>;

export type HomepageContent = Readonly<{
  heroEyebrow: string;
  heroHeadline: string;
  heroDescription: string;
  primaryCta: HomepageLink;
  secondaryCta: HomepageLink;
  supportCta: HomepageSupportLink;
  carouselAutoplayMs: number;
  slides: readonly HeroSlide[];
}>;

export const homepageContent = {
  // Edit these values to update the main hero copy and buttons.
  heroEyebrow: "Manufactured by Ganalaxmi Enterprises",
  heroHeadline: "3D Infinity Tunnel Tables, Built to Stand Out",
  heroDescription:
    "Statement center tables, wall décor and custom interior solutions for homes, cafés, restaurants and reception spaces.",
  primaryCta: { label: "Explore the Collection", href: "/products" },
  secondaryCta: { label: "Discuss a Custom Project", href: "/contact" },
  supportCta: {
    title: "Have a custom idea?",
    label: "Talk directly with our team on WhatsApp.",
    href: getWhatsAppUrl(
      "Hello, I would like to discuss a custom 3D infinity table, wall décor, or interior project.",
    ),
  },

  // Change this number to update slide timing. 3000 = three seconds.
  carouselAutoplayMs: 3000,

  // Add, remove, reorder, or edit these objects to maintain the carousel.
  // To replace an image, copy it into public/images/homepage and set imagePath
  // to "/images/homepage/your-file-name.jpg". Keep alt text accurate for the new image.
  slides: [
    {
      title: "Statement lighting for modern homes",
      description: "Illuminated furniture designed to transform the mood of a room.",
      imagePath: "/images/homepage/ChatGPT Image Sep 22, 2026, 04_32_41 PM.png",
      alt: "Illuminated infinity mirror coffee table in a furnished living room",
      cta: { label: "Explore the collection", href: "/products" },
    },
    {
      title: "An infinity of depth",
      description: "Mirror, light and detail come together in a distinctive centrepiece.",
      imagePath: "/images/homepage/Infinity Mirror Console Table with Ivy Glow.png",
      alt: "Infinity mirror console table glowing with warm LED light",
      cta: { label: "Shop illuminated furniture", href: "/products" },
    },
    {
      title: "Lighting made for your space",
      description: "Custom LED installations bring immersive colour and depth to interiors.",
      imagePath: "/images/homepage/20260920_091500.jpg.jpeg",
      alt: "Blue LED infinity lighting installed at an interior site",
      cta: { label: "Discuss a custom project", href: "/contact" },
    },
    {
      title: "Colour that changes the atmosphere",
      description: "Bold infinity lighting creates a memorable visual experience.",
      imagePath: "/images/homepage/20260829_174536.jpg",
      alt: "Red circular infinity mirror LED installation",
      cta: { label: "View our story", href: "/about" },
    },
    {
      title: "Designed around the way you live",
      description: "Furniture, lighting and interior solutions tailored for real spaces.",
      imagePath: "/images/homepage/ChatGPT Image Sep 22, 2026, 04_32_41 PM.png",
      alt: "Custom illuminated coffee table styled in a warm living room",
      cta: { label: "Contact our team", href: "/contact" },
    },
  ],
} as const satisfies HomepageContent;
