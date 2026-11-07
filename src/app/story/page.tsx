"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Award, Shield, Compass, HeartHandshake } from "lucide-react";

export default function StoryPage() {
  return (
    <div className="space-y-16 pb-24">
      {/* Hero Header */}
      <section className="bg-[#FAF8F5] border-b border-[#EBE7DF] py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Artisanal Heritage
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-6xl text-[#0F0F0F]">
            The Gauchi Story
          </h1>
          <p className="font-serif-luxury italic text-[#C5A059] text-base">
            "More than a fragrance. A lasting connection."
          </p>
          <p className="text-xs sm:text-sm text-[#5A5A5A] leading-relaxed pt-2">
            Founded with a singular conviction: fine fragrance connoisseurship shouldn't demand compromise between exceptional ingredients and accessible pricing.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-xs text-[#5A5A5A] leading-relaxed">
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
              Disrupting the Luxury Markup
            </h2>
            <p>
              In traditional Haute Parfumerie, up to 90% of what a customer pays pays for celebrity endorsement contracts, gilded department store shelf fees, and distributor markups. The actual liquid perfume inside often accounts for less than 5% of the price.
            </p>
            <p>
              GAUCHI inverted this equation completely. We cut out all middlemen, retail brokers, and lavish vanity campaigns. Instead, we allocate our entire budget directly into the bottle—sourcing wild aged agarwood, French Damascena rose, and premium natural ambergris.
            </p>
          </div>
          <div className="aspect-[4/3] rounded-sm overflow-hidden border border-[#EBE7DF]">
            <img
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80"
              alt="Artisanal perfume formulation"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 32% Extrait Concentration */}
        <div className="p-8 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <Award className="w-6 h-6 text-[#C5A059] mx-auto" />
            <h3 className="font-serif-luxury text-lg text-[#0F0F0F]">30–32% Pure Extrait</h3>
            <p className="text-xs text-[#5A5A5A]">
              Standard Eau de Toilette contains 8-12% oil; Eau de Parfum holds 15-20%. Every Gauchi creation is bottled at pure extrait strength.
            </p>
          </div>
          <div className="space-y-2">
            <Compass className="w-6 h-6 text-[#C5A059] mx-auto" />
            <h3 className="font-serif-luxury text-lg text-[#0F0F0F]">Ethically Harvested</h3>
            <p className="text-xs text-[#5A5A5A]">
              We work with sustainable plantation harvesters in Assam for agarwood and small multi-generational flower growers in Grasse.
            </p>
          </div>
          <div className="space-y-2">
            <HeartHandshake className="w-6 h-6 text-[#C5A059] mx-auto" />
            <h3 className="font-serif-luxury text-lg text-[#0F0F0F]">Honest Pricing</h3>
            <p className="text-xs text-[#5A5A5A]">
              Handcrafted flacons priced fairly from ₹699 to ₹2,999. Niche luxury within reach of every discerning patron.
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link
            href="/shop"
            className="inline-block px-8 py-3.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#C5A059] transition-colors"
          >
            Explore All Creations
          </Link>
        </div>
      </section>
    </div>
  );
}
