"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageCircle, Mail, MapPin, Phone, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT || "+919876543210";

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ success: true, message: data.message });
        setEmail("");
      } else {
        setStatus({ success: false, message: data.error || "Subscription failed" });
      }
    } catch {
      setStatus({ success: false, message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#FAF8F5] border-t border-[#EBE7DF] text-[#1A1A1A] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#E8E2D5]">
          {/* Brand Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <BrandLogo size="md" className="items-start text-left" />
            </Link>
            <p className="text-xs text-[#5A5A5A] leading-relaxed max-w-sm">
              GAUCHI redefines artisanal perfumery: combining rare aged resins, precious Grasse blooms, and French-Middle Eastern olfactory mastery with honest, accessible pricing. Hand-bottled at pure 30%+ extrait strength.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hello%20Gauchi%20Concierge,%20I%20would%20like%20assistance%20with%20a%20fragrance%20recommendation.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#25D366] text-white rounded-sm text-xs font-medium hover:bg-[#20ba59] transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Concierge</span>
              </a>
              <Link
                href="/experience/black-oud-60ml"
                className="text-xs text-[#C5A059] hover:underline font-medium"
              >
                The Gauchi Experience ✦
              </Link>
            </div>
          </div>

          {/* Fragrance Collections */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-luxury font-semibold text-[#0F0F0F]">
              Fragrances
            </h4>
            <ul className="space-y-2 text-xs text-[#5A5A5A]">
              <li>
                <Link href="/collections/oud-collection" className="hover:text-[#C5A059] transition-colors">
                  Oud Collection
                </Link>
              </li>
              <li>
                <Link href="/collections/fresh-aquatic" className="hover:text-[#C5A059] transition-colors">
                  Fresh & Aquatic
                </Link>
              </li>
              <li>
                <Link href="/collections/floral-fruity" className="hover:text-[#C5A059] transition-colors">
                  Floral & Fruity
                </Link>
              </li>
              <li>
                <Link href="/collections/warm-woody" className="hover:text-[#C5A059] transition-colors">
                  Warm & Woody
                </Link>
              </li>
              <li>
                <Link href="/collections/gift-sets" className="hover:text-[#C5A059] transition-colors">
                  Discovery Gift Sets
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#C5A059] transition-colors font-medium">
                  All Perfumes →
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge & Client Services */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-luxury font-semibold text-[#0F0F0F]">
              Client Care
            </h4>
            <ul className="space-y-2 text-xs text-[#5A5A5A]">
              <li>
                <Link href="/account" className="hover:text-[#C5A059] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-[#C5A059] transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-[#C5A059] transition-colors">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link href="/policies/faq" className="hover:text-[#C5A059] transition-colors">
                  Fragrance FAQ & Storage
                </Link>
              </li>
              <li>
                <Link href="/story" className="hover:text-[#C5A059] transition-colors">
                  About Gauchi
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-luxury font-semibold text-[#0F0F0F]">
              The Gauchi Circle
            </h4>
            <p className="text-xs text-[#5A5A5A] leading-relaxed">
              Subscribe to receive private invitations to rare extrait releases and receive 10% off your first purchase.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#DDD7CD] rounded-sm focus:outline-none focus:border-[#C5A059] text-[#0F0F0F]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#0F0F0F] text-white rounded-sm hover:bg-[#C5A059] transition-colors text-xs disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {status && (
                <div
                  className={`text-[11px] p-2 rounded-sm ${
                    status.success
                      ? "bg-[#EAF5EC] text-[#2A6E3B] flex items-center gap-1.5"
                      : "bg-[#FDECEC] text-[#A82222]"
                  }`}
                >
                  {status.success && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  <span>{status.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#7A7A7A] gap-4">
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>© 2026 GAUCHI LUXURY PERFUMES. All rights reserved.</span>
            <Link href="/policies/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/policies/terms" className="hover:underline">
              Terms & Conditions
            </Link>
            <span className="text-[#A39D94]">GST Reg: 27AAACG1234F1Z5</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#5A5A5A]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              Encrypted Razorpay UPI / Card / NetBanking / COD
            </span>
            <span>Currency: INR (₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
