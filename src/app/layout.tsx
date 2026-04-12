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
    "Shop professional lashes, adhesives, aftercare, and beauty tools from Lashmealex. Curated by a Fresno lash artist.",
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
      "Shop professional lashes, adhesives, aftercare, and beauty tools. Curated by a Fresno lash artist.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lashmealex Shop",
    description:
      "Professional lashes, adhesives, aftercare, and beauty essentials from Lashmealex.",
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
