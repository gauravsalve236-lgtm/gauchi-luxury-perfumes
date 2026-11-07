"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { ProductType } from "@/types";

export default function CollectionPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const collectionMeta: Record<string, { title: string; subtitle: string; desc: string }> = {
    "oud-collection": {
      title: "The Royal Oud Collection",
      subtitle: "Aged Cambodian Agarwood & Smokey Resins",
      desc: "Distilled from precious sustainably harvested agarwood trees. Dark, intoxicating, regally projecting, and formulated at 32% pure oil concentration.",
    },
    "fresh-aquatic": {
      title: "Fresh & Aquatic Collection",
      subtitle: "Mediterranean Sea Salt & Crisp Citrus",
      desc: "Invigorating coastal breezes colliding with sparkling Italian bergamot, crisp green apple, and French lavender.",
    },
    "floral-fruity": {
      title: "Floral & Fruity Collection",
      subtitle: "Grasse Rose & Golden Wild Nectar",
      desc: "Sun-drenched Mediterranean orchards, velvet damask rose petals, and hypnotic nectarous honeys balanced with sensual cashmere musks.",
    },
    "warm-woody": {
      title: "Warm & Woody Collection",
      subtitle: "Smoked Tobacco, Bourbon Vanilla & Ambergris",
      desc: "Nocturnal allure crafted with dark Cuban rum, roasted tonka bean, and warm cedarwood.",
    },
    "gift-sets": {
      title: "Luxury Discovery Coffrets",
      subtitle: "Curated Quintet & Duo Masterpiece Sets",
      desc: "Presented in gold-embossed ivory velvet coffrets. The quintessential gift for fine fragrance connoisseurs.",
    },
  };

  const meta = collectionMeta[slug] || {
    title: "Curated Fragrance Collection",
    subtitle: "Artisanal Perfumes by Gauchi",
    desc: "Discover pure extraits formulated with Grasse and Assam essences.",
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?category=${slug}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  return (
    <div className="space-y-12 pb-20">
      {/* Collection Header Banner */}
      <section className="bg-[#FAF8F5] border-b border-[#EBE7DF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-[#5A5A5A] hover:text-[#C5A059] mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Fragrances</span>
          </Link>

          <div className="max-w-2xl space-y-3">
            <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
              {meta.subtitle}
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#0F0F0F]">
              {meta.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A5A5A] leading-relaxed">
              {meta.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[3/4] bg-[#FAF8F5] animate-pulse rounded-sm border border-[#EBE7DF]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm p-8">
            <h3 className="font-serif-luxury text-xl text-[#0F0F0F] mb-2">No Fragrances Currently in this Collection</h3>
            <p className="text-xs text-[#7A7A7A] mb-6">Explore our full catalog to discover all artisanal perfumes.</p>
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors"
            >
              Browse Full Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
