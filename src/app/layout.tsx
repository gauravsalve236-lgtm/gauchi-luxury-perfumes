import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import StorefrontShell from "@/components/StorefrontShell";

export const metadata: Metadata = {
  title: "GAUCHI — Luxury Perfumes & Haute Parfumerie",
  description: "Exquisite artisanal extraits de parfum crafted with aged agarwood, French rose, and ambergris at accessible luxury.",
  keywords: ["perfume", "luxury fragrance", "oud", "eau de parfum", "Gauchi", "perfumes India", "extrait de parfum"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GAUCHI",
  },
  icons: {
    icon: [
      { url: "/images/gauchi-gold-logo.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/images/gauchi-gold-logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/images/gauchi-gold-logo.png",
  },
  openGraph: {
    title: "GAUCHI — Luxury Perfumes",
    description: "Haute Parfumerie at Accessible Luxury",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased light">
      <body className="min-h-full flex flex-col bg-white text-[#0F0F0F]">
        <AuthProvider>
          <CartProvider>
            <StorefrontShell>
              {children}
            </StorefrontShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
