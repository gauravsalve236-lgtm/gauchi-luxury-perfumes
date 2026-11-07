"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartCount,
    subtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 1499;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || appliedCoupon?.discountType === "FREE_SHIPPING";
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = isFreeShipping ? 0 : 99;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError("");
    setCouponSuccess("");

    const result = await applyCoupon(couponInput.trim());
    if (result.success) {
      setCouponSuccess(result.message);
      setCouponInput("");
    } else {
      setCouponError(result.message);
    }
    setIsApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#EBE7DF] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury text-lg tracking-luxury text-[#0F0F0F]">
                Shopping Bag
              </span>
              <span className="text-xs bg-[#EBE7DF] text-[#0F0F0F] px-2 py-0.5 rounded-full font-medium">
                {cartCount}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#5A5A5A] hover:text-[#0F0F0F] transition-colors"
              aria-label="Close Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-[#F5F2EB] px-5 py-3 border-b border-[#EBE7DF]">
            {isFreeShipping ? (
              <div className="text-xs text-[#2A6E3B] font-medium text-center flex items-center justify-center gap-1.5">
                <span>✦</span> You have unlocked Complimentary Express Delivery!
              </div>
            ) : (
              <div>
                <div className="text-xs text-[#0F0F0F] text-center mb-1.5">
                  Add <span className="font-semibold text-[#C5A059]">₹{amountToFreeShipping}</span> more to unlock <span className="font-semibold">Free Express Shipping</span>
                </div>
                <div className="w-full bg-[#E5DFD4] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C5A059] h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#F0ECE4]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#C5A059] mb-4">
                  ✦
                </div>
                <h3 className="font-serif-luxury text-lg text-[#0F0F0F] mb-1">Your bag is empty</h3>
                <p className="text-xs text-[#7A7A7A] max-w-xs mb-6">
                  Experience the pinnacle of luxury perfumery. Discover our signature extraits.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors"
                >
                  Explore Fragrances
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.variantId} className="py-4 flex gap-4">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-20 h-24 object-contain p-1 rounded-sm border border-[#EBE7DF] bg-[#FAF8F5]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/shop/${item.productSlug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-serif-luxury text-sm font-medium text-[#0F0F0F] hover:text-[#C5A059] transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-[#8C827A] hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-[#7A7A7A] mt-0.5">Size: {item.variantSize}</div>
                      <div className="text-xs font-semibold text-[#0F0F0F] mt-1">
                        ₹{item.price}
                        {item.mrp > item.price && (
                          <span className="text-[10px] text-[#8C827A] line-through ml-2 font-normal">
                            ₹{item.mrp}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-[#E0DBD0] rounded-sm bg-white">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-[#FAF8F5] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 text-[#5A5A5A]" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-[#0F0F0F]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 hover:bg-[#FAF8F5] transition-colors disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 text-[#5A5A5A]" />
                        </button>
                      </div>
                      <span className="text-xs text-[#5A5A5A]">
                        Subtotal: <span className="font-medium text-[#0F0F0F]">₹{item.price * item.quantity}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#EBE7DF] bg-[#FAF8F5] space-y-4">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-sm border border-[#C5A059]/40 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span className="font-semibold text-[#0F0F0F]">{appliedCoupon.code}</span>
                      <span className="text-[#2A6E3B] font-medium">(-₹{discountAmount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. GAUCHI10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-[#E0DBD0] rounded-sm focus:outline-none focus:border-[#C5A059] uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !couponInput.trim()}
                      className="px-4 py-2 bg-[#0F0F0F] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#C5A059] transition-colors disabled:opacity-40"
                    >
                      {isApplying ? "..." : "Apply"}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-500 mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-[#2A6E3B] mt-1">{couponSuccess}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#5A5A5A] pt-2 border-t border-[#EBE7DF]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#0F0F0F]">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#2A6E3B]">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span>{isFreeShipping ? <span className="text-[#2A6E3B]">FREE</span> : "₹99"}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#0F0F0F] pt-2 border-t border-[#EBE7DF]">
                  <span>Total Payable</span>
                  <span className="text-base text-[#0F0F0F]">₹{total}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-widest-luxury font-medium flex items-center justify-center gap-2 hover:bg-[#C5A059] transition-colors shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A7A7A]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>100% Authentic • Secure Encrypted Checkout • COD Available</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
