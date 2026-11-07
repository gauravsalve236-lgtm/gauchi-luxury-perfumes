"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
  Truck,
  RotateCcw,
  CheckCircle2,
  Printer,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { OrderType, ProductType } from "@/types";

export default function CustomerAccountPage() {
  const router = useRouter();
  const { user, logout, isLoading, refreshUser } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses" | "profile">("orders");
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<ProductType[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile update form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
    }
  }, [user, isLoading, router]);

  // Load orders
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOrders(false);
      }
    }
    if (user) loadOrders();
  }, [user]);

  // Load wishlist products
  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlist.length === 0) {
        setWishlistProducts([]);
        return;
      }
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok) {
          const matched = (data.products || []).filter((p: ProductType) => wishlist.includes(p.id));
          setWishlistProducts(matched);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadWishlistProducts();
  }, [wishlist]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        setProfileMessage("Profile updated successfully");
        await refreshUser();
      } else {
        setProfileMessage("Update failed");
      }
    } catch {
      setProfileMessage("Network error");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "CANCELLED",
          cancelReason: "Cancelled by customer via account portal",
        }),
      });
      if (res.ok) {
        // Refresh orders
        const refreshed = await fetch("/api/orders").then((r) => r.json());
        setOrders(refreshed.orders || []);
      } else {
        const err = await res.json();
        alert(err.error || "Cannot cancel order");
      }
    } catch {
      alert("Network error cancelling order");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs">
        Loading client profile...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#EBE7DF] gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Private Client Portal
          </span>
          <h1 className="font-serif-luxury text-3xl text-[#0F0F0F]">
            Greetings, {user.name}
          </h1>
          <p className="text-xs text-[#7A7A7A] mt-0.5">{user.email}</p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#FAF8F5] border border-[#E0DBD0] text-xs font-medium text-[#5A5A5A] hover:text-[#0F0F0F] rounded-sm transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          {[
            { id: "orders", label: "My Orders", icon: Package, count: orders.length },
            { id: "wishlist", label: "Wishlist", icon: Heart, count: wishlist.length },
            { id: "profile", label: "Profile Details", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between p-3 text-xs rounded-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#0F0F0F] text-white font-medium"
                    : "text-[#5A5A5A] hover:bg-[#FAF8F5] hover:text-[#0F0F0F]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#FAF8F5] text-[#0F0F0F]"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="font-serif-luxury text-xl text-[#0F0F0F] pb-3 border-b border-[#EBE7DF]">
                Order History & Status
              </h2>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-[#7A7A7A]">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm p-6 space-y-3">
                  <p className="text-xs text-[#7A7A7A]">You have not placed any orders yet.</p>
                  <Link
                    href="/shop"
                    className="inline-block px-6 py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury hover:bg-[#C5A059]"
                  >
                    Discover Perfumes
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="border border-[#EBE7DF] rounded-sm p-5 bg-white space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0ECE4] gap-2 text-xs">
                        <div>
                          <span className="font-semibold text-[#0F0F0F] font-mono">{o.orderNumber}</span>
                          <span className="text-[#8C827A] ml-2">
                            • {new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-[#FAF8F5] border border-[#C5A059]/40 text-[#0F0F0F] text-[10px] uppercase tracking-wider font-semibold">
                            {o.orderStatus}
                          </span>
                          <span className="font-semibold text-[#0F0F0F]">₹{o.total}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-[#F5F2EB] text-xs">
                        {o.items.map((item) => (
                          <div key={item.id} className="py-2 flex justify-between">
                            <div>
                              <span className="font-medium text-[#0F0F0F]">{item.productName}</span>
                              <span className="text-[11px] text-[#7A7A7A] ml-2">({item.variantSize} × {item.quantity})</span>
                            </div>
                            <span className="text-[#5A5A5A]">₹{item.total}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tracking / Courier Info */}
                      {o.trackingNumber && (
                        <div className="p-3 bg-[#FAF8F5] text-xs rounded-sm flex items-center justify-between">
                          <span className="text-[#5A5A5A]">
                            Courier: <span className="font-medium text-[#0F0F0F]">{o.courierName}</span> • AWB: <span className="font-mono text-[#0F0F0F]">{o.trackingNumber}</span>
                          </span>
                          <span className="text-[#2A6E3B] font-semibold text-[10px]">Trackable</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <Link
                          href={`/order-confirmation/${o.orderNumber}`}
                          className="text-[#0F0F0F] underline hover:text-[#C5A059] font-medium"
                        >
                          View Receipt & Invoice Details →
                        </Link>

                        {(o.orderStatus === "PENDING" || o.orderStatus === "CONFIRMED") && (
                          <button
                            onClick={() => handleCancelOrder(o.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <h2 className="font-serif-luxury text-xl text-[#0F0F0F] pb-3 border-b border-[#EBE7DF]">
                Saved Favorites ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="py-16 text-center bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm p-6 space-y-3">
                  <p className="text-xs text-[#7A7A7A]">Your wishlist is currently empty.</p>
                  <Link
                    href="/shop"
                    className="inline-block px-6 py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury hover:bg-[#C5A059]"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => {
                    const defaultV = p.variants[0];
                    return (
                      <div
                        key={p.id}
                        className="p-4 border border-[#EBE7DF] rounded-sm bg-white flex gap-4 text-xs"
                      >
                        <img
                          src={p.images?.[0]?.url || ""}
                          alt={p.name}
                          className="w-20 h-24 object-cover rounded-sm border border-[#EBE7DF]"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <Link href={`/shop/${p.slug}`} className="font-serif-luxury text-sm font-medium text-[#0F0F0F] hover:text-[#C5A059]">
                              {p.name}
                            </Link>
                            <p className="text-[11px] text-[#7A7A7A]">{p.fragranceFamily} • ₹{defaultV?.price}</p>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                if (defaultV) {
                                  addToCart({
                                    productId: p.id,
                                    productName: p.name,
                                    productSlug: p.slug,
                                    productImage: p.images?.[0]?.url || "",
                                    variantId: defaultV.id,
                                    variantSize: defaultV.size,
                                    price: defaultV.price,
                                    mrp: defaultV.mrp,
                                    quantity: 1,
                                    maxStock: defaultV.stock,
                                  });
                                }
                              }}
                              className="px-3 py-1.5 bg-[#0F0F0F] text-white text-[10px] uppercase tracking-wider hover:bg-[#C5A059]"
                            >
                              Add to Bag
                            </button>
                            <button
                              onClick={() => toggleWishlist(p.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="font-serif-luxury text-xl text-[#0F0F0F] pb-3 border-b border-[#EBE7DF]">
                Client Profile Details
              </h2>

              {profileMessage && (
                <div className="p-3 bg-[#FAF8F5] border border-[#C5A059] text-xs text-[#0F0F0F] rounded-sm">
                  {profileMessage}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Email Address (Immutable)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 bg-[#F0ECE4] border border-[#DDD] rounded-sm text-[#7A7A7A]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury hover:bg-[#C5A059] transition-colors"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
