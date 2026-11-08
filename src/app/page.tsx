"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Droplets, Award, Compass, Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { ProductType } from "@/types";

export default function HomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [contentBlocks, setContentBlocks] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"featured" | "bestseller" | "new">("bestseller");

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, contentRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/content").catch(() => null),
        ]);
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);

        if (contentRes && contentRes.ok) {
          const cData = await contentRes.json();
          const map: Record<string, any> = {};
          (cData.blocks || []).forEach((b: any) => {
            let meta = {};
            try {
              meta = typeof b.metadataJson === "string" ? JSON.parse(b.metadataJson) : (b.metadataJson || {});
            } catch {}
            map[b.key] = { ...b, meta };
          });
          setContentBlocks(map);
        }
      } catch (err) {
        console.error("Failed to load storefront data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const displayedProducts = products.filter((p) => {
    if (activeTab === "bestseller") return p.isBestSeller;
    if (activeTab === "featured") return p.isFeatured;
    if (activeTab === "new") return p.isNewArrival;
    return true;
  });

  const heroBlock = contentBlocks["hero_banner"];
  const pillarsBlock = contentBlocks["hero_pillars"] || contentBlocks["hero_banner"];
  const heroBadge = heroBlock?.meta?.badge || "Pure 32% Oil Extrait Concentration";
  const heroTitle = heroBlock?.title || "Haute Parfumerie at Accessible Luxury";
  const heroDesc = heroBlock?.content || "Crafted with rare Cambodian agarwood, Grasse damascena rose, and aged ambergris. Experience niche artisanal fragrances formulated for 14+ hour lingering projection.";
  
  const pillar1Title = pillarsBlock?.meta?.pillar1Title || "32% Extrait";
  const pillar1Desc = pillarsBlock?.meta?.pillar1Desc || "Double the oil concentration of standard designer EDPs";
  const pillar2Title = pillarsBlock?.meta?.pillar2Title || "Grasse & Assam Sourced";
  const pillar2Desc = pillarsBlock?.meta?.pillar2Desc || "Aged botanicals sourced directly from origin harvests";
  const pillar3Title = pillarsBlock?.meta?.pillar3Title || "14+ Hour Projection";
  const pillar3Desc = pillarsBlock?.meta?.pillar3Desc || "Uncompromising longevity engineered for tropical heat";
  const pillar4Title = pillarsBlock?.meta?.pillar4Title || "100% Authentic";
  const pillar4Desc = pillarsBlock?.meta?.pillar4Desc || "Direct from our laboratory with zero intermediary markups";

  const storyBlock = contentBlocks["brand_story"];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#FAF8F5] overflow-hidden border-b border-[#EBE7DF]">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FAF8F5] via-[#F5F2EB] to-[#EFECE4] opacity-80" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E0DBD0] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-[11px] uppercase tracking-luxury text-[#0F0F0F] font-medium">
              {heroBadge}
            </span>
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl tracking-wide text-[#0F0F0F] leading-tight font-normal">
            {heroTitle.includes("at") ? (
              <>
                {heroTitle.split("at")[0]} at <br />
                <span className="italic font-light text-[#C5A059]">{heroTitle.split("at")[1]}</span>
              </>
            ) : (
              heroTitle
            )}
          </h1>

          <p className="text-sm sm:text-base text-[#5A5A5A] max-w-2xl mx-auto font-light leading-relaxed">
            {heroDesc}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#C5A059] transition-colors shadow-sm"
            >
              Explore Collection
            </Link>
            <Link
              href="/collections/gift-sets"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#0F0F0F] border border-[#0F0F0F] text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#FAF8F5] transition-colors"
            >
              Discovery Coffret Set
            </Link>
          </div>

          {/* Luxury Brand Pillars */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#E8E2D5] text-left">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#0F0F0F] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#C5A059]" /> {pillar1Title}
              </div>
              <p className="text-[11px] text-[#7A7A7A]">{pillar1Desc}</p>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#0F0F0F] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#C5A059]" /> {pillar2Title}
              </div>
              <p className="text-[11px] text-[#7A7A7A]">{pillar2Desc}</p>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#0F0F0F] flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#C5A059]" /> {pillar3Title}
              </div>
              <p className="text-[11px] text-[#7A7A7A]">{pillar3Desc}</p>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#0F0F0F] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#C5A059]" /> {pillar4Title}
              </div>
              <p className="text-[11px] text-[#7A7A7A]">{pillar4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Fragrance Collections Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Olfactory Families
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#0F0F0F] font-normal">
            The Gauchi Collections
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7A7A] max-w-lg mx-auto">
            Each creation is an olfactory poem harmonizing contrasting moods and rare botanical accords.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Oud Collection",
              desc: "Mystical, hypnotic woody resins & smoky amber",
              img: "/images/products/black-oud-1.jpg",
              href: "/collections/oud-collection",
            },
            {
              title: "Floral & Fruity",
              desc: "Velvet Grasse rose petals & wild golden honey",
              img: "/images/products/wild-nectar.jpg",
              href: "/collections/floral-fruity",
            },
            {
              title: "Fresh & Aquatic",
              desc: "Marine sea salt, crisp apple & Haitian vetiver",
              img: "/images/products/titan-blue.jpg",
              href: "/collections/fresh-aquatic",
            },
            {
              title: "Warm & Woody",
              desc: "Cuban dark rum, tonka bean & blonde tobacco",
              img: "/images/products/lamour-nuit.jpg",
              href: "/collections/warm-woody",
            },
          ].map((col) => (
            <Link
              key={col.title}
              href={col.href}
              className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-[#FAF8F5] border border-[#EBE7DF] flex flex-col justify-end p-6 hover:shadow-xl transition-all duration-300"
            >
              <img
                src={col.img}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative text-white space-y-1">
                <h3 className="font-serif-luxury text-xl font-medium tracking-wide">
                  {col.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2">{col.desc}</p>
                <div className="text-[11px] uppercase tracking-luxury text-[#E5C378] pt-2 flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform">
                  Explore Family <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Catalog Showcase & Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#EBE7DF] mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
              Masterpiece Flacons
            </span>
            <h2 className="font-serif-luxury text-3xl text-[#0F0F0F]">Signature Parfums</h2>
          </div>

          {/* Filtering Tabs */}
          <div className="flex items-center gap-2 p-1 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm text-xs">
            <button
              onClick={() => setActiveTab("bestseller")}
              className={`px-4 py-2 rounded-xs uppercase tracking-luxury font-medium transition-colors ${
                activeTab === "bestseller" ? "bg-[#0F0F0F] text-white" : "text-[#5A5A5A] hover:text-[#0F0F0F]"
              }`}
            >
              Best Sellers
            </button>
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-4 py-2 rounded-xs uppercase tracking-luxury font-medium transition-colors ${
                activeTab === "featured" ? "bg-[#0F0F0F] text-white" : "text-[#5A5A5A] hover:text-[#0F0F0F]"
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 rounded-xs uppercase tracking-luxury font-medium transition-colors ${
                activeTab === "new" ? "bg-[#0F0F0F] text-white" : "text-[#5A5A5A] hover:text-[#0F0F0F]"
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[3/4] bg-[#FAF8F5] animate-pulse rounded-sm border border-[#EBE7DF]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-[#0F0F0F] text-[#0F0F0F] text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#0F0F0F] hover:text-white transition-colors"
          >
            <span>View All Fragrances</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. Brand Story Section ("The Gauchi Philosophy") */}
      <section className="bg-[#FAF8F5] border-y border-[#EBE7DF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
                Our Artisanal Philosophy
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#0F0F0F] leading-tight font-normal">
                {storyBlock?.title || "Born from an obsessive pursuit of olfactory perfection."}
              </h2>
              <p className="text-sm text-[#5A5A5A] leading-relaxed font-light whitespace-pre-line">
                {storyBlock?.content || "For decades, the luxury perfume market has been held hostage by exorbitant marketing budgets and 1,000% markups. Gauchi was founded to overturn this dynamic.\n\nWe work directly with artisanal distillers in Grasse, France and Assam, India, procuring pure botanical essences, aged agarwood resins, and sustainably sourced ambergris. We bottle our creations at an opulent extrait concentration—giving you unmatched complexity, sillage, and all-day longevity."}
              </p>
              <div className="pt-4 flex items-center gap-8 text-xs">
                <div>
                  <div className="font-serif-luxury text-2xl font-medium text-[#0F0F0F]">{pillar1Title.replace(" Extrait", "")}</div>
                  <div className="text-[#8C827A] uppercase tracking-wider text-[10px]">Pure Extrait</div>
                </div>
                <div>
                  <div className="font-serif-luxury text-2xl font-medium text-[#0F0F0F]">16 hrs</div>
                  <div className="text-[#8C827A] uppercase tracking-wider text-[10px]">Skin Sillage</div>
                </div>
                <div>
                  <div className="font-serif-luxury text-2xl font-medium text-[#0F0F0F]">100%</div>
                  <div className="text-[#8C827A] uppercase tracking-wider text-[10px]">Cruelty Free</div>
                </div>
              </div>
            </div>

            <div className="relative aspect-square sm:aspect-[4/3] rounded-sm overflow-hidden border border-[#E0DBD0] shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1000&q=85"
                alt="Gauchi luxury fragrance packaging"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Verified Customer Acclaim
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#0F0F0F]">
            The Scent of Distinction
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "Black Oud Royale is extraordinary. The projection easily lasts 14+ hours with an exquisite dry-down of aged wood and subtle Turkish rose. Easily rivals niche bottles costing ₹25,000.",
              author: "Vikramaditya S.",
              verified: "Verified Buyer (Black Oud 60ml)",
              rating: 5,
            },
            {
              quote: "Wild Nectar is now my signature scent for brunches and formal dinners. I get stopped by strangers asking what fragrance I am wearing. The honey and peach blossom blend is intoxicating.",
              author: "Priyanka Nair",
              verified: "Verified Buyer (Wild Nectar 60ml)",
              rating: 5,
            },
            {
              quote: "Bought the Masterpiece Discovery Set to test all five perfumes. Packaging arrived in pristine gold-embossed coffret. Titan Blue and L'Amour Nuit are absolute masterpieces.",
              author: "Sameer K.",
              verified: "Verified Buyer (Discovery Quintet Set)",
              rating: 5,
            },
          ].map((t) => (
            <div
              key={t.author}
              className="p-6 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex gap-1 text-[#C5A059]">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
                  ))}
                </div>
                <p className="text-xs text-[#2D2D2D] leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>
              <div className="pt-4 border-t border-[#EBE7DF]">
                <div className="text-xs font-semibold text-[#0F0F0F]">{t.author}</div>
                <div className="text-[10px] text-[#2A6E3B] font-medium flex items-center gap-1 mt-0.5">
                  ✦ {t.verified}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Promotional Privilege Banner (Admin / CMS Managed) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F5] border border-[#C5A059]/40 p-8 sm:p-12 text-center rounded-sm space-y-4 relative overflow-hidden">
          <div className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Limited Celebration Offer
          </div>
          <h3 className="font-serif-luxury text-2xl sm:text-4xl text-[#0F0F0F]">
            Enjoy 10% Privilege Off Your First Order
          </h3>
          <p className="text-xs sm:text-sm text-[#5A5A5A] max-w-xl mx-auto">
            Use exclusive promotional code <span className="font-mono font-bold text-[#0F0F0F] bg-white px-2 py-0.5 border border-[#EBE7DF]">GAUCHI10</span> at checkout for all orders above ₹999. Complimentary express delivery included.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors"
            >
              Apply Privilege Offer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
