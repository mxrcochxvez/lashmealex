import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Lashmealex Shop",
    template: "%s | Lashmealex Shop",
  },
  description:
    "A branded storefront for Lashmealex beauty products with local pickup and a booking handoff to the salon's GlossGenius site.",
  keywords: [
    "lashmealex",
    "lashes",
    "beauty products",
    "Fresno",
    "pickup",
    "eyelash salon",
  ],
  openGraph: {
    title: "Lashmealex Shop",
    description:
      "Shop Lashmealex beauty products, pickup locally in Fresno, and book salon services through GlossGenius.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lashmealex Shop",
    description:
      "Shop beauty products and follow the booking handoff to the existing Lashmealex salon site.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakartaSans.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
