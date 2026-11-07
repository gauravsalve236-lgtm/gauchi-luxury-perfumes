"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  X,
  Plus,
  Minus,
  CheckCircle,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import { ProductType, ProductVariantType } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart, toggleWishlist, isInWishlist, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantType | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState(user?.name || "");
  const [reviewEmail, setReviewEmail] = useState(user?.email || "");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, product]);

  // Scroll listener for sticky mobile action bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          router.push("/shop");
          return;
        }
        const data = await res.json();
        setProduct(data.product);

        const defaultV =
          data.product.variants.find((v: ProductVariantType) => v.isDefault) ||
          data.product.variants[0];
        setSelectedVariant(defaultV);

        // Fetch related products in the same fragrance family
        const relRes = await fetch(
          `/api/products?fragranceFamily=${encodeURIComponent(data.product.fragranceFamily)}`
        );
        const relData = await relRes.json();
        setRelatedProducts(
          (relData.products || [])
            .filter((p: ProductType) => p.id !== data.product.id)
            .slice(0, 3)
        );
      } catch (e) {
        console.error("Error loading product detail:", e);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadProduct();
  }, [slug, router]);

  if (loading || !product || !selectedVariant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-luxury text-[#8C827A]">Unveiling flacon essence...</p>
      </div>
    );
  }

  const primaryImage = product.images[activeImageIndex] || product.images[0];
  const discountPercent =
    selectedVariant.mrp > selectedVariant.price
      ? Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100)
      : 0;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: primaryImage?.url || "",
      variantId: selectedVariant.id,
      variantSize: selectedVariant.size,
      price: selectedVariant.price,
      mrp: selectedVariant.mrp,
      quantity,
      maxStock: selectedVariant.stock,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsCartOpen(false);
    router.push("/checkout");
  };

  const handlePrevImage = () => {
    if (!product || product.images.length === 0) return;
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
  };

  const handleNextImage = () => {
    if (!product || product.images.length === 0) return;
    setActiveImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewName,
          customerEmail: reviewEmail,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewMessage(data.message);
        setTimeout(() => {
          setReviewModalOpen(false);
          setReviewMessage("");
          setReviewComment("");
          setReviewTitle("");
        }, 2000);
      } else {
        setReviewMessage(data.error || "Failed to submit review");
      }
    } catch {
      setReviewMessage("Network error submitting review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-xs text-[#8C827A]">
          <Link href="/" className="hover:text-[#0F0F0F] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-[#0F0F0F] transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/collections/${product.category?.slug || "oud-collection"}`} className="hover:text-[#0F0F0F] transition-colors">
            {product.fragranceFamily}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0F0F0F] font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Product Main Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start">
            {/* Thumbnail list */}
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:w-20 lg:w-24 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-square w-16 sm:w-20 md:w-full rounded-sm overflow-hidden border p-1 bg-white flex items-center justify-center transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#0F0F0F] ring-1 ring-[#0F0F0F] shadow-sm"
                        : "border-[#EBE7DF] opacity-70 hover:opacity-100 hover:border-[#C5A059]"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || product.name}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image - Ultra Clean Luxury Showcase */}
            <div className="flex-1 w-full aspect-square bg-white rounded-sm border border-[#EBE7DF] overflow-hidden relative group flex items-center justify-center shadow-xs">
              <img
                src={primaryImage?.url || ""}
                alt={product.name}
                onClick={() => setLightboxOpen(true)}
                className="w-full h-full object-contain cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.03] select-none"
              />

              {/* Prev / Next Arrows (on hover or touch) */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-white/95 hover:bg-white text-[#0F0F0F] hover:text-[#C5A059] shadow-md border border-[#EBE7DF] opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-white/95 hover:bg-white text-[#0F0F0F] hover:text-[#C5A059] shadow-md border border-[#EBE7DF] opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Top Right: Wishlist Toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/95 text-[#0F0F0F] hover:text-[#C5A059] border border-[#EBE7DF] shadow-xs transition-colors z-10 cursor-pointer"
                aria-label="Wishlist toggle"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isInWishlist(product.id) ? "fill-[#C5A059] text-[#C5A059]" : ""
                  }`}
                />
              </button>

              {/* Bottom Right: Click to Zoom Fullscreen */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 p-2 rounded-sm bg-white/90 hover:bg-white text-[#5A5A5A] hover:text-[#0F0F0F] border border-[#EBE7DF] shadow-xs flex items-center gap-1.5 text-[10px] uppercase tracking-luxury font-medium transition-colors z-10 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="hidden sm:inline">Zoom</span>
              </button>

              {/* Bottom Left: Counter badge */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-white/90 border border-[#EBE7DF] rounded-full text-[10px] font-mono text-[#5A5A5A] shadow-xs">
                  {activeImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Purchasing Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-[#8C827A] uppercase tracking-luxury font-medium mb-1">
                <span>{product.fragranceFamily} • {product.gender}</span>
                <span>{product.subtitle?.includes("Extrait") ? "Pure Extrait de Parfum" : "Haute Parfumerie"}</span>
              </div>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#0F0F0F] font-normal">
                {product.name}
              </h1>
              {product.subtitle && (
                <p className="text-xs text-[#5A5A5A] mt-1 italic font-light">
                  {product.subtitle}
                </p>
              )}

              {/* Rating & Reviews Jump */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <div className="flex text-[#C5A059]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
                  ))}
                </div>
                <span className="font-semibold text-[#0F0F0F]">{product.averageRating || 5.0}</span>
                <a href="#reviews" className="text-[#8C827A] underline hover:text-[#0F0F0F]">
                  ({product.totalReviews || 12} Verified Reviews)
                </a>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-semibold text-[#0F0F0F]">
                  ₹{selectedVariant.price}
                </span>
                {selectedVariant.mrp > selectedVariant.price && (
                  <>
                    <span className="text-sm text-[#8C827A] line-through">
                      MRP ₹{selectedVariant.mrp}
                    </span>
                    <span className="text-xs text-[#2A6E3B] font-semibold bg-[#EAF5EC] px-2 py-0.5 rounded-xs">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#7A7A7A]">Inclusive of all applicable taxes • Free Express Shipping on orders over ₹1,499</p>
            </div>

            {/* Size Variants Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold uppercase tracking-luxury text-[#0F0F0F]">
                  Select Flacon Size
                </span>
                <span className="text-[#8C827A]">SKU: {selectedVariant.sku}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={`p-3 text-left border rounded-sm transition-all ${
                      selectedVariant.id === v.id
                        ? "border-[#0F0F0F] bg-white ring-1 ring-[#0F0F0F]"
                        : "border-[#E0DBD0] bg-[#FAF8F5] hover:bg-white text-[#5A5A5A]"
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#0F0F0F]">{v.size}</div>
                    <div className="text-[11px] text-[#7A7A7A] mt-0.5">₹{v.price}</div>
                    <div className="text-[10px] text-[#2A6E3B] mt-1">
                      {v.stock > 0 ? (v.stock < 10 ? `Only ${v.stock} left in stock` : "In Stock") : "Out of Stock"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#E0DBD0] rounded-sm bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-[#FAF8F5] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 text-[#5A5A5A]" />
                  </button>
                  <span className="w-12 text-center text-xs font-semibold text-[#0F0F0F]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                    disabled={quantity >= selectedVariant.stock}
                    className="p-2 hover:bg-[#FAF8F5] transition-colors disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#5A5A5A]" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={selectedVariant.stock <= 0}
                  className="flex-1 py-3.5 bg-white border border-[#0F0F0F] text-[#0F0F0F] text-xs uppercase tracking-luxury font-medium hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={selectedVariant.stock <= 0}
                className="w-full py-3.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-widest-luxury font-medium hover:bg-[#C5A059] transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <span>Buy Now with 1-Click</span>
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#EBE7DF] text-center text-[11px] text-[#5A5A5A]">
              <div className="space-y-1">
                <Truck className="w-4 h-4 text-[#C5A059] mx-auto" />
                <span>Express Courier</span>
              </div>
              <div className="space-y-1">
                <ShieldCheck className="w-4 h-4 text-[#C5A059] mx-auto" />
                <span>Pure Extrait</span>
              </div>
              <div className="space-y-1">
                <RotateCcw className="w-4 h-4 text-[#C5A059] mx-auto" />
                <span>7-Day Replacement</span>
              </div>
            </div>

            {/* Olfactory Notes Pyramid & Luxury Accord Breakdown */}
            <div className="pt-6 border-t border-[#EBE7DF] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-luxury text-lg text-[#0F0F0F]">
                  Olfactory Pyramid
                </h3>
                <span className="text-[10px] tracking-widest-luxury uppercase text-[#C5A059] font-medium">
                  3-Stage Progression
                </span>
              </div>

              <div className="space-y-4 bg-[#FAF8F5] p-5 border border-[#EBE7DF] rounded-sm text-xs">
                {/* Top Notes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#0F0F0F] text-[11px] uppercase tracking-wider text-[#C5A059]">
                      Opening Notes
                    </span>
                    <span className="text-[10px] text-[#8C827A] font-mono">0 – 30 mins</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.topNotes.split(",").map((note, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white border border-[#DDD7CD] rounded-xs text-[11px] text-[#0F0F0F] font-medium shadow-2xs"
                      >
                        {note.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Heart Notes */}
                <div className="pt-3 border-t border-[#E8E2D5]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#0F0F0F] text-[11px] uppercase tracking-wider text-[#C5A059]">
                      Heart / Sillage Core
                    </span>
                    <span className="text-[10px] text-[#8C827A] font-mono">30 mins – 4 hrs</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.middleNotes.split(",").map((note, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white border border-[#DDD7CD] rounded-xs text-[11px] text-[#0F0F0F] font-medium shadow-2xs"
                      >
                        {note.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Base Notes */}
                <div className="pt-3 border-t border-[#E8E2D5]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#0F0F0F] text-[11px] uppercase tracking-wider text-[#C5A059]">
                      Base / Skin Trail
                    </span>
                    <span className="text-[10px] text-[#8C827A] font-mono">4 – 16+ hrs</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.baseNotes.split(",").map((note, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[#0F0F0F] text-white border border-[#0F0F0F] rounded-xs text-[11px] font-medium shadow-2xs"
                      >
                        {note.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Accords Intensity Meter */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] uppercase tracking-luxury text-[#0F0F0F] font-semibold block">
                Main Accords Profile
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-[#5A5A5A] mb-1">
                    <span>Aged Cambodian Agarwood (Oud)</span>
                    <span className="font-mono text-[#0F0F0F]">95%</span>
                  </div>
                  <div className="w-full bg-[#EBE7DF] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0F0F0F] h-full" style={{ width: "95%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[#5A5A5A] mb-1">
                    <span>Warm Amber & Madagascar Vanilla</span>
                    <span className="font-mono text-[#0F0F0F]">88%</span>
                  </div>
                  <div className="w-full bg-[#EBE7DF] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#C5A059] h-full" style={{ width: "88%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[#5A5A5A] mb-1">
                    <span>Velvety Damascena Rose</span>
                    <span className="font-mono text-[#0F0F0F]">76%</span>
                  </div>
                  <div className="w-full bg-[#EBE7DF] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#A38241] h-full" style={{ width: "76%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Narrative Description */}
            <div className="space-y-2 pt-4">
              <h3 className="font-serif-luxury text-base text-[#0F0F0F]">The Scent Story</h3>
              <p className="text-xs text-[#5A5A5A] leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* How to use */}
            {product.howToUse && (
              <div className="space-y-1 text-xs text-[#5A5A5A]">
                <span className="font-semibold text-[#0F0F0F]">Application Ritual:</span>
                <p className="font-light">{product.howToUse}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-[#EBE7DF]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#EBE7DF] gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
              Client Authenticity
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
              Customer Reviews ({product.reviews?.length || 0})
            </h2>
          </div>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-6 py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="pt-8 space-y-6">
          {!product.reviews || product.reviews.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#7A7A7A]">
              Be the first to share your thoughts on {product.name}.
            </div>
          ) : (
            product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F0F0F]">{rev.customerName}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="text-[10px] bg-[#EAF5EC] text-[#2A6E3B] px-2 py-0.5 rounded-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex text-[#C5A059] gap-0.5 mt-1">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#8C827A]">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {rev.title && (
                  <h4 className="text-xs font-semibold text-[#0F0F0F]">{rev.title}</h4>
                )}
                <p className="text-xs text-[#4A4A4A] leading-relaxed font-light">{rev.comment}</p>

                {rev.adminResponse && (
                  <div className="mt-3 p-3 bg-white border-l-2 border-[#C5A059] text-xs space-y-1">
                    <span className="font-semibold text-[#0F0F0F]">Gauchi Concierge Response:</span>
                    <p className="text-[#5A5A5A] italic">{rev.adminResponse}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-sm shadow-2xl p-6 space-y-4 border border-[#EBE7DF]">
            <div className="flex justify-between items-center border-b border-[#EBE7DF] pb-3">
              <h3 className="font-serif-luxury text-lg text-[#0F0F0F]">Write a Review</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-[#8C827A] hover:text-[#0F0F0F]">
                ✕
              </button>
            </div>

            {reviewMessage && (
              <div className="p-3 bg-[#FAF8F5] border border-[#C5A059] text-xs text-[#0F0F0F]">
                {reviewMessage}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#0F0F0F] mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-[#C5A059]"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-[#C5A059]" : "text-[#DDD]"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#0F0F0F] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0F0F0F] mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0F0F0F] mb-1">Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Masterpiece projection and packaging"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0F0F0F] mb-1">Your Honest Experience</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details regarding projection, longevity, and your favorite notes..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD] text-[#5A5A5A] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-6 py-2 bg-[#0F0F0F] text-white uppercase tracking-luxury hover:bg-[#C5A059] transition-colors disabled:opacity-50"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High-Resolution Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-50 cursor-pointer"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={primaryImage?.url || ""}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl select-none"
            />

            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full text-xs text-white/90 font-mono">
              {activeImageIndex + 1} of {product.images.length}
            </div>
          </div>
        </div>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-[#EBE7DF]">
          <div className="text-center space-y-1 mb-8">
            <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
              Harmonious Compositions
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
              You May Also Admire
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Add To Bag Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EBE7DF] p-3 sm:hidden shadow-lg animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={primaryImage?.url || ""}
                alt={product.name}
                className="w-10 h-10 object-contain rounded-xs border border-[#EBE7DF] bg-white shrink-0"
              />
              <div className="min-w-0">
                <div className="font-serif-luxury text-xs text-[#0F0F0F] truncate font-medium">
                  {product.name}
                </div>
                <div className="text-[11px] font-semibold text-[#0F0F0F]">
                  ₹{selectedVariant.price}{" "}
                  <span className="text-[10px] text-[#8C827A] font-normal">({selectedVariant.size})</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="px-5 py-2.5 bg-[#0F0F0F] text-white text-[11px] uppercase tracking-widest-luxury font-medium hover:bg-[#C5A059] transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
