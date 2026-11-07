"use client";

import React, { useState, useEffect } from "react";
import { Star, Check, X, Trash2, MessageSquare, ShieldCheck } from "lucide-react";
import { ReviewType } from "@/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      if (res.ok) loadReviews();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveReply = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminResponse: replyText }),
      });
      if (res.ok) {
        setReplyingId(null);
        setReplyText("");
        loadReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) loadReviews();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#EBE7DF]">
        <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
          Customer Sentiment Moderation
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
          Product Reviews & Testimonials ({reviews.length})
        </h1>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="p-5 bg-white border border-[#EBE7DF] rounded-sm space-y-3 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0ECE4]">
              <div>
                <span className="font-semibold text-[#0F0F0F] text-sm">{r.product?.name}</span>
                <span className="text-[#8C827A] ml-2">by {r.customerName}</span>
                {r.isVerifiedPurchase && (
                  <span className="ml-2 text-[10px] bg-[#EAF5EC] text-[#2A6E3B] px-2 py-0.5 rounded-xs font-medium inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Purchase
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex text-[#C5A059]">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                  ))}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  r.isApproved ? "bg-[#EAF5EC] text-[#2A6E3B]" : "bg-[#FAF8F5] text-[#8C827A] border border-[#DDD]"
                }`}>
                  {r.isApproved ? "Live on Store" : "Pending Approval"}
                </span>
              </div>
            </div>

            {r.title && <h4 className="font-semibold text-[#0F0F0F]">{r.title}</h4>}
            <p className="text-[#4A4A4A] leading-relaxed italic font-light">"{r.comment}"</p>

            {r.adminResponse && (
              <div className="p-3 bg-[#FAF8F5] border-l-2 border-[#C5A059] space-y-1">
                <span className="font-semibold text-[#0F0F0F]">Official Brand Concierge Response:</span>
                <p className="text-[#5A5A5A]">{r.adminResponse}</p>
              </div>
            )}

            {/* Reply Input Form */}
            {replyingId === r.id && (
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Type official response from Gauchi Concierge..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-[#C5A059] rounded-sm focus:outline-none"
                />
                <button
                  onClick={() => handleSaveReply(r.id)}
                  className="px-4 py-1.5 bg-[#0F0F0F] text-white uppercase text-[10px] tracking-wider rounded-sm hover:bg-[#C5A059]"
                >
                  Save Response
                </button>
                <button
                  onClick={() => setReplyingId(null)}
                  className="px-3 py-1.5 border border-[#DDD] text-[#5A5A5A]"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Moderation Controls */}
            <div className="pt-2 flex items-center justify-between text-[11px] border-t border-[#F0ECE4]">
              <div className="flex gap-4">
                <button
                  onClick={() => handleToggleApprove(r.id, r.isApproved)}
                  className={`font-medium ${r.isApproved ? "text-amber-700 hover:underline" : "text-green-700 hover:underline"}`}
                >
                  {r.isApproved ? "Hide / Unapprove" : "Approve & Publish"}
                </button>
                <button
                  onClick={() => {
                    setReplyingId(r.id);
                    setReplyText(r.adminResponse || "");
                  }}
                  className="text-[#0F0F0F] hover:underline"
                >
                  {r.adminResponse ? "Edit Concierge Reply" : "Reply to Customer"}
                </button>
              </div>

              <button
                onClick={() => handleDelete(r.id)}
                className="text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
