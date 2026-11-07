"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, CheckCircle2, XCircle } from "lucide-react";
import { CouponType } from "@/types";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED" | "FREE_SHIPPING">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("10");
  const [minPurchase, setMinPurchase] = useState("999");
  const [maxDiscount, setMaxDiscount] = useState("500");
  const [usageLimit, setUsageLimit] = useState("500");
  const [expiryDate, setExpiryDate] = useState("2026-12-31");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          description,
          discountType,
          discountValue: parseFloat(discountValue),
          minPurchase: parseFloat(minPurchase) || 0,
          maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
          usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
          isActive,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setCode("");
        loadCoupons();
      } else {
        setError(data.error || "Failed to create coupon");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE7DF]">
        <div>
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Promotions & Campaigns
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
            Privilege Coupons ({coupons.length})
          </h1>
        </div>

        <button
          onClick={() => {
            setError("");
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors rounded-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="bg-white border border-[#EBE7DF] rounded-sm overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#EBE7DF] text-[#8C827A] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Coupon Code</th>
              <th className="p-3">Type & Value</th>
              <th className="p-3">Min Purchase</th>
              <th className="p-3">Max Cap</th>
              <th className="p-3">Redeemed</th>
              <th className="p-3">Expiry</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0ECE4]">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                <td className="p-3">
                  <span className="font-mono font-bold text-[#0F0F0F] bg-[#FAF8F5] px-2 py-1 border border-[#E0DBD0] rounded-xs">
                    {c.code}
                  </span>
                  {c.description && (
                    <span className="block text-[11px] text-[#7A7A7A] mt-1">{c.description}</span>
                  )}
                </td>
                <td className="p-3 font-semibold text-[#0F0F0F]">
                  {c.discountType === "PERCENTAGE"
                    ? `${c.discountValue}% OFF`
                    : c.discountType === "FIXED"
                    ? `Flat ₹${c.discountValue} OFF`
                    : "Free Shipping"}
                </td>
                <td className="p-3 text-[#5A5A5A]">₹{c.minPurchase}</td>
                <td className="p-3 text-[#5A5A5A]">{c.maxDiscount ? `₹${c.maxDiscount}` : "No Limit"}</td>
                <td className="p-3">
                  <span className="font-semibold text-[#0F0F0F]">{c.usageCount}</span>
                  {c.usageLimit && <span className="text-[#8C827A]"> / {c.usageLimit}</span>}
                </td>
                <td className="p-3 text-[#5A5A5A]">
                  {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-IN") : "Indefinite"}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    c.isActive ? "bg-[#EAF5EC] text-[#2A6E3B]" : "bg-[#FDECEC] text-[#A82222]"
                  }`}>
                    {c.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-sm shadow-2xl p-6 space-y-4 border border-[#EBE7DF]">
            <div className="flex justify-between items-center border-b border-[#EBE7DF] pb-3">
              <h3 className="font-serif-luxury text-lg text-[#0F0F0F]">Create Promotional Code</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#8C827A] hover:text-[#0F0F0F]">✕</button>
            </div>

            {error && (
              <div className="p-3 bg-[#FDECEC] border border-[#A82222]/30 text-[#A82222] text-xs rounded-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 20% off for festive celebration"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Min Order (INR)</label>
                  <input
                    type="number"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Max Cap (INR, optional)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD] text-[#5A5A5A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#0F0F0F] text-white uppercase tracking-luxury hover:bg-[#C5A059] disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
