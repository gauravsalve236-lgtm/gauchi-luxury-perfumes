"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItemType } from "@/types";

interface CartContextType {
  cart: CartItemType[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: CartItemType) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  appliedCoupon: {
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("gauchi_cart");
      if (storedCart) setCart(JSON.parse(storedCart));

      const storedWishlist = localStorage.getItem("gauchi_wishlist");
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

      const storedCoupon = localStorage.getItem("gauchi_coupon");
      if (storedCoupon) setAppliedCoupon(JSON.parse(storedCoupon));
    } catch (e) {
      console.error("Failed to load local storage cart", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("gauchi_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("gauchi_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem("gauchi_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("gauchi_coupon");
      }
    } catch (e) {
      console.error(e);
    }
  }, [appliedCoupon, isInitialized]);

  const addToCart = (newItem: CartItemType) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.variantId === newItem.variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === newItem.variantId
            ? {
                ...item,
                quantity: Math.min(item.quantity + newItem.quantity, item.maxStock),
              }
            : item
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: Math.min(quantity, item.maxStock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Invalid coupon" };
      }
      setAppliedCoupon({
        code: data.coupon.code,
        discountType: data.coupon.discountType,
        discountValue: data.coupon.discountValue,
        discountAmount: data.discountAmount,
      });
      return { success: true, message: `Coupon ${data.coupon.code} applied successfully!` };
    } catch {
      return { success: false, message: "Network error validating coupon" };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
