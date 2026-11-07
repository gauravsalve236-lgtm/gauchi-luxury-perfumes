"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, Plus, ExternalLink, Eye, MousePointerClick, MessageSquare } from "lucide-react";
import { QrCampaignType } from "@/types";

export default function AdminQrPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [variantSize, setVariantSize] = useState("60ml");
  const [marketplaceSource, setMarketplaceSource] = useState("GAUCHI_BOX");
  const [amazonReviewUrl, setAmazonReviewUrl] = useState("");
  const [flipkartReviewUrl, setFlipkartReviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/qr");
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          title,
          variantSize,
          marketplaceSource,
          amazonReviewUrl,
          flipkartReviewUrl,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setCode("");
        setTitle("");
        loadCampaigns();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE7DF]">
        <div>
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Box Packaging Integration
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
            The Gauchi QR Experience ({campaigns.length})
          </h1>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            Unique QR destinations placed inside perfume boxes to connect customers to notes, rituals & reviews.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors rounded-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New QR Destination</span>
        </button>
      </div>

      <div className="bg-white border border-[#EBE7DF] rounded-sm overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#EBE7DF] text-[#8C827A] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Flacon QR Destination</th>
              <th className="p-3">Box Target</th>
              <th className="p-3">Packaging Source</th>
              <th className="p-3">Box Scans</th>
              <th className="p-3">Review Link Clicks</th>
              <th className="p-3">Feedback Form Submissions</th>
              <th className="p-3 text-right">Experience Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0ECE4]">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                <td className="p-3">
                  <span className="font-semibold text-[#0F0F0F] block">{c.title}</span>
                  <span className="text-[11px] text-[#8C827A] font-mono">/experience/{c.code}</span>
                </td>
                <td className="p-3 text-[#5A5A5A] font-medium">{c.variantSize || "Standard"}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FAF8F5] border border-[#DDD] text-[#0F0F0F] font-semibold">
                    {c.marketplaceSource}
                  </span>
                </td>
                <td className="p-3 font-semibold text-[#0F0F0F]">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{c.scanCount}</span>
                  </div>
                </td>
                <td className="p-3 font-semibold text-[#0F0F0F]">
                  <div className="flex items-center gap-1.5">
                    <MousePointerClick className="w-3.5 h-3.5 text-[#2A6E3B]" />
                    <span>{c.reviewClickCount}</span>
                  </div>
                </td>
                <td className="p-3 font-semibold text-[#0F0F0F]">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>{c.feedbackCount}</span>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/experience/${c.code}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-[#0F0F0F] hover:text-[#C5A059] underline font-medium"
                  >
                    <span>View QR Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
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
              <h3 className="font-serif-luxury text-lg text-[#0F0F0F]">Create Box QR Campaign</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#8C827A] hover:text-[#0F0F0F]">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Code URL Segment *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. black-oud-60ml"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toLowerCase())}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Destination Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Black Oud Royale 60ml Box QR"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Flacon Size</label>
                  <input
                    type="text"
                    value={variantSize}
                    onChange={(e) => setVariantSize(e.target.value)}
                    placeholder="60ml"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Packaging Channel</label>
                  <select
                    value={marketplaceSource}
                    onChange={(e) => setMarketplaceSource(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059]"
                  >
                    <option value="GAUCHI_BOX">Gauchi Official Box</option>
                    <option value="AMAZON">Amazon FBA Box</option>
                    <option value="FLIPKART">Flipkart Assured Box</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Amazon Review Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://amazon.in/dp/..."
                  value={amazonReviewUrl}
                  onChange={(e) => setAmazonReviewUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Flipkart Review Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://flipkart.com/..."
                  value={flipkartReviewUrl}
                  onChange={(e) => setFlipkartReviewUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059]"
                />
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
                  {saving ? "Saving..." : "Create Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
