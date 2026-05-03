import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css"; // I'll need to create this or import existing css
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/lib/i18n";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fustan | فستان - Premium Bridal Store",
    template: "%s | Fustan"
  },
  description: "فستان - الوجهة الأمثل لأفخم فساتين العرائس والمناسبات. اكتشفي تصاميم فريدة من أفضل المصممين والبائعين.",
  keywords: ["فساتين عرائس", "فساتين مناسبات", "فستان", "زفاف", "bridal dresses", "wedding gowns"],
  authors: [{ name: "Fustan Team" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://fustan.cloud",
  },
  openGraph: {
    type: "website",
    url: "https://fustan.cloud",
    title: "Fustan | فستان - Premium Bridal Store",
    description: "فستان - الوجهة الأمثل لأفخم فساتين العرائس والمناسبات.",
    images: ["/logo-social.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fustan | فستان - Premium Bridal Store",
    description: "فستان - الوجهة الأمثل لأفخم فساتين العرائس والمناسبات.",
    images: ["/logo-social.png"],
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${inter.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
