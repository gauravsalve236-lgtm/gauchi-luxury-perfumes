"use client";

import React from "react";
import Link from "next/link";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { ProductType } from "@/types";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: ProductType }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary) || primaryImage;

  const discountPercent =
    defaultVariant && defaultVariant.mrp > defaultVariant.price
      ? Math.round(((defaultVariant.mrp - defaultVariant.price) / defaultVariant.mrp) * 100)
      : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!defaultVariant) return;

    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: primaryImage?.url || "",
      variantId: defaultVariant.id,
      variantSize: defaultVariant.size,
      price: defaultVariant.price,
      mrp: defaultVariant.mrp,
      quantity: 1,
      maxStock: defaultVariant.stock,
    });
  };

  return (
    <div className="group relative bg-white border border-[#EBE7DF] rounded-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300">
      {/* Badges & Wishlist Button */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF8F5]">
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
          {product.isBestSeller && (
            <span className="bg-[#0F0F0F] text-white text-[9px] uppercase tracking-luxury px-2 py-0.5 font-medium">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#C5A059] text-white text-[9px] uppercase tracking-luxury px-2 py-0.5 font-medium">
              New Arrival
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#FAF8F5] text-[#0F0F0F] border border-[#C5A059] text-[9px] px-1.5 py-0.5 font-semibold">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 text-[#0F0F0F] hover:text-[#C5A059] transition-colors shadow-xs"
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isInWishlist(product.id) ? "fill-[#C5A059] text-[#C5A059]" : ""
            }`}
          />
        </button>

        {/* Product Image with smooth transition - absolute inset-0 to prevent mobile aspect ratio collapse */}
        <Link
          href={`/shop/${product.slug}`}
          className="absolute inset-0 flex items-center justify-center p-3 z-0"
        >
          <img
            src={primaryImage?.url || "/uploads/main_1794031426600.jpg"}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 select-none"
          />
        </Link>

        {/* Quick Add To Bag overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 bg-white/95 backdrop-blur-xs text-[#0F0F0F] border border-[#0F0F0F] hover:bg-[#0F0F0F] hover:text-white text-xs uppercase tracking-luxury font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag ({defaultVariant?.size})</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#8C827A] uppercase tracking-wider mb-1">
            <span>{product.fragranceFamily}</span>
            <span>{product.gender}</span>
          </div>

          <Link href={`/shop/${product.slug}`} className="block group-hover:text-[#C5A059] transition-colors">
            <h3 className="font-serif-luxury text-base font-medium text-[#0F0F0F] line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.subtitle && (
            <p className="text-[11px] text-[#7A7A7A] mt-0.5 line-clamp-1 font-light italic">
              {product.subtitle}
            </p>
          )}

          {/* Key Fragrance Notes Teaser */}
          <p className="text-[11px] text-[#5A5A5A] mt-2 line-clamp-1">
            <span className="font-medium text-[#0F0F0F]">Notes:</span> {product.topNotes.split(",")[0]}, {product.middleNotes.split(",")[0]}, {product.baseNotes.split(",")[0]}
          </p>
        </div>

        {/* Rating & Price */}
        <div className="mt-4 pt-3 border-t border-[#F0ECE4] flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
            <span className="font-semibold text-[#0F0F0F]">{product.averageRating || 5.0}</span>
            <span className="text-[10px] text-[#8C827A]">({product.totalReviews || 12})</span>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold text-[#0F0F0F]">
              ₹{defaultVariant?.price}
            </div>
            {defaultVariant && defaultVariant.mrp > defaultVariant.price && (
              <div className="text-[11px] text-[#8C827A] line-through">
                ₹{defaultVariant.mrp}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
