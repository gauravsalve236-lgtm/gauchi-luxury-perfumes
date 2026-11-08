"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, X, ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { ProductType } from "@/types";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [selectedFamily, setSelectedFamily] = useState<string>(searchParams.get("fragranceFamily") || "ALL");
  const [selectedGender, setSelectedGender] = useState<string>(searchParams.get("gender") || "ALL");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("ALL");
  const [selectedSort, setSelectedSort] = useState<string>("featured");
  const searchQuery = searchParams.get("search") || "";

  const fragranceFamilies = [
    "ALL",
    "Oud",
    "Floral & Fruity",
    "Fresh & Aquatic",
    "Warm & Woody",
  ];

  const genders = ["ALL", "Unisex", "Men", "Women"];

  const priceRanges = [
    { label: "All Prices", value: "ALL" },
    { label: "Under ₹1,000", value: "0-1000" },
    { label: "₹1,000 – ₹2,000", value: "1000-2000" },
    { label: "Above ₹2,000", value: "2000-99999" },
  ];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedFamily !== "ALL") params.append("fragranceFamily", selectedFamily);
        if (selectedGender !== "ALL") params.append("gender", selectedGender);
        if (searchQuery) params.append("search", searchQuery);
        params.append("sort", selectedSort);

        if (selectedPriceRange !== "ALL") {
          const [min, max] = selectedPriceRange.split("-");
          params.append("minPrice", min);
          params.append("maxPrice", max);
        }

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch shop products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedFamily, selectedGender, selectedPriceRange, selectedSort, searchQuery]);

  const resetFilters = () => {
    setSelectedFamily("ALL");
    setSelectedGender("ALL");
    setSelectedPriceRange("ALL");
    setSelectedSort("featured");
    router.push("/shop");
  };

  const hasActiveFilters =
    selectedFamily !== "ALL" ||
    selectedGender !== "ALL" ||
    selectedPriceRange !== "ALL" ||
    searchQuery !== "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[#EBE7DF] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Gauchi Flacon Portfolio
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#0F0F0F] mt-1">
            {searchQuery ? `Search results for "${searchQuery}"` : "The Fragrance Catalog"}
          </h1>
          <p className="text-xs text-[#7A7A7A] mt-1">
            Displaying {products.length} artisanal extrait creations
          </p>
        </div>

        {/* Sorting Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 border border-[#E0DBD0] text-xs font-medium rounded-sm bg-[#FAF8F5]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8C827A] hidden sm:inline">Sort By:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E0DBD0] rounded-sm px-3 py-2 text-xs text-[#0F0F0F] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="featured">Featured / Curated</option>
              <option value="bestseller">Best Sellers</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block space-y-6 pr-6 border-r border-[#EBE7DF]">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#FAF8F5] border border-[#E0DBD0] text-[11px] font-medium text-[#0F0F0F] hover:bg-[#EBE7DF] transition-colors rounded-sm"
            >
              <RotateCcw className="w-3 h-3 text-[#C5A059]" />
              <span>Reset All Filters</span>
            </button>
          )}

          {/* Fragrance Family Filter */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-luxury text-[#0F0F0F]">
              Fragrance Family
            </h3>
            <div className="space-y-1.5">
              {fragranceFamilies.map((family) => (
                <button
                  key={family}
                  onClick={() => setSelectedFamily(family)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-xs flex items-center justify-between transition-colors ${
                    selectedFamily === family
                      ? "bg-[#0F0F0F] text-white font-medium"
                      : "text-[#5A5A5A] hover:bg-[#FAF8F5] hover:text-[#0F0F0F]"
                  }`}
                >
                  <span>{family === "ALL" ? "All Fragrance Families" : family}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="space-y-3 pt-4 border-t border-[#F0ECE4]">
            <h3 className="text-xs font-semibold uppercase tracking-luxury text-[#0F0F0F]">
              Category / Gender
            </h3>
            <div className="space-y-1.5">
              {genders.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-xs flex items-center justify-between transition-colors ${
                    selectedGender === g
                      ? "bg-[#0F0F0F] text-white font-medium"
                      : "text-[#5A5A5A] hover:bg-[#FAF8F5] hover:text-[#0F0F0F]"
                  }`}
                >
                  <span>{g === "ALL" ? "All Genders" : g}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-[#F0ECE4]">
            <h3 className="text-xs font-semibold uppercase tracking-luxury text-[#0F0F0F]">
              Price (INR)
            </h3>
            <div className="space-y-1.5">
              {priceRanges.map((pr) => (
                <button
                  key={pr.value}
                  onClick={() => setSelectedPriceRange(pr.value)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-xs flex items-center justify-between transition-colors ${
                    selectedPriceRange === pr.value
                      ? "bg-[#0F0F0F] text-white font-medium"
                      : "text-[#5A5A5A] hover:bg-[#FAF8F5] hover:text-[#0F0F0F]"
                  }`}
                >
                  <span>{pr.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-[#FAF8F5] animate-pulse rounded-sm border border-[#EBE7DF]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm p-8 space-y-4">
              <h3 className="font-serif-luxury text-xl text-[#0F0F0F]">No Fragrances Found</h3>
              <p className="text-xs text-[#7A7A7A] max-w-sm mx-auto">
                No perfumes match your current filter combination. Try adjusting or resetting your filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative bg-white w-full max-h-[85vh] overflow-y-auto rounded-t-xl shadow-2xl p-6 space-y-6 z-10 border-t border-[#EBE7DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE7DF]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-serif-luxury text-lg text-[#0F0F0F]">Filter Fragrances</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#5A5A5A]"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fragrance Families */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-luxury text-[#0F0F0F]">
                Fragrance Family
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {fragranceFamilies.map((family) => (
                  <button
                    key={family}
                    type="button"
                    onClick={() => setSelectedFamily(family)}
                    className={`text-xs py-2 px-3 rounded-sm border text-center transition-colors ${
                      selectedFamily === family
                        ? "bg-[#0F0F0F] text-white border-[#0F0F0F] font-medium"
                        : "bg-[#FAF8F5] text-[#5A5A5A] border-[#E0DBD0]"
                    }`}
                  >
                    {family === "ALL" ? "All Families" : family}
                  </button>
                ))}
              </div>
            </div>

            {/* Genders */}
            <div className="space-y-2 pt-3 border-t border-[#F0ECE4]">
              <h4 className="text-xs font-semibold uppercase tracking-luxury text-[#0F0F0F]">
                Category / Gender
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {genders.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`text-xs py-2 px-3 rounded-sm border text-center transition-colors ${
                      selectedGender === g
                        ? "bg-[#0F0F0F] text-white border-[#0F0F0F] font-medium"
                        : "bg-[#FAF8F5] text-[#5A5A5A] border-[#E0DBD0]"
                    }`}
                  >
                    {g === "ALL" ? "All Genders" : g}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Ranges */}
            <div className="space-y-2 pt-3 border-t border-[#F0ECE4]">
              <h4 className="text-xs font-semibold uppercase tracking-luxury text-[#0F0F0F]">
                Price Range
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {priceRanges.map((pr) => (
                  <button
                    key={pr.value}
                    type="button"
                    onClick={() => setSelectedPriceRange(pr.value)}
                    className={`text-xs py-2 px-3 rounded-sm border text-center transition-colors ${
                      selectedPriceRange === pr.value
                        ? "bg-[#0F0F0F] text-white border-[#0F0F0F] font-medium"
                        : "bg-[#FAF8F5] text-[#5A5A5A] border-[#E0DBD0]"
                    }`}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#EBE7DF] flex gap-3">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-3 border border-[#E0DBD0] text-xs font-medium uppercase tracking-luxury text-[#5A5A5A] hover:bg-[#FAF8F5]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#0F0F0F] text-white text-xs font-medium uppercase tracking-luxury hover:bg-[#C5A059]"
              >
                Apply ({products.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading fragrance catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
