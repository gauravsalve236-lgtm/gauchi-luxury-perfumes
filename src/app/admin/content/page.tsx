"use client";

import React, { useState, useEffect } from "react";
import { FileText, Save, CheckCircle2, Award, Compass, Droplets, Shield, Sparkles } from "lucide-react";

export default function AdminContentPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState("hero_pillars");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaBadge, setMetaBadge] = useState("");
  
  // 4 Pillars state
  const [metaPillar1, setMetaPillar1] = useState("32% Extrait");
  const [metaPillar1Desc, setMetaPillar1Desc] = useState("Double the oil concentration of standard designer EDPs");
  const [metaPillar2, setMetaPillar2] = useState("Grasse & Assam Sourced");
  const [metaPillar2Desc, setMetaPillar2Desc] = useState("Aged botanicals sourced directly from origin harvests");
  const [metaPillar3, setMetaPillar3] = useState("14+ Hour Projection");
  const [metaPillar3Desc, setMetaPillar3Desc] = useState("Uncompromising longevity engineered for tropical heat");
  const [metaPillar4, setMetaPillar4] = useState("100% Authentic");
  const [metaPillar4Desc, setMetaPillar4Desc] = useState("Direct from our laboratory with zero intermediary markups");

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const parseMeta = (metaStr: string | null) => {
    if (!metaStr) return {};
    try {
      return typeof metaStr === "string" ? JSON.parse(metaStr) : metaStr;
    } catch {
      return {};
    }
  };

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      setBlocks(data.blocks || []);
      const current = (data.blocks || []).find((b: any) => b.key === selectedKey);
      if (current) {
        setTitle(current.title || "");
        setContent(current.content || "");
        const meta = parseMeta(current.metadataJson);
        setMetaBadge(meta.badge || "");
        if (meta.pillar1Title) setMetaPillar1(meta.pillar1Title);
        if (meta.pillar1Desc) setMetaPillar1Desc(meta.pillar1Desc);
        if (meta.pillar2Title) setMetaPillar2(meta.pillar2Title);
        if (meta.pillar2Desc) setMetaPillar2Desc(meta.pillar2Desc);
        if (meta.pillar3Title) setMetaPillar3(meta.pillar3Title);
        if (meta.pillar3Desc) setMetaPillar3Desc(meta.pillar3Desc);
        if (meta.pillar4Title) setMetaPillar4(meta.pillar4Title);
        if (meta.pillar4Desc) setMetaPillar4Desc(meta.pillar4Desc);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSelectKey = (key: string) => {
    setSelectedKey(key);
    setStatus("");
    const b = blocks.find((item) => item.key === key);
    if (b) {
      setTitle(b.title || "");
      setContent(b.content || "");
      const meta = parseMeta(b.metadataJson);
      setMetaBadge(meta.badge || "");
      if (meta.pillar1Title) setMetaPillar1(meta.pillar1Title);
      if (meta.pillar1Desc) setMetaPillar1Desc(meta.pillar1Desc);
      if (meta.pillar2Title) setMetaPillar2(meta.pillar2Title);
      if (meta.pillar2Desc) setMetaPillar2Desc(meta.pillar2Desc);
      if (meta.pillar3Title) setMetaPillar3(meta.pillar3Title);
      if (meta.pillar3Desc) setMetaPillar3Desc(meta.pillar3Desc);
      if (meta.pillar4Title) setMetaPillar4(meta.pillar4Title);
      if (meta.pillar4Desc) setMetaPillar4Desc(meta.pillar4Desc);
    } else {
      setTitle("");
      setContent("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const current = blocks.find((b) => b.key === selectedKey);
      const existingMeta = parseMeta(current?.metadataJson);
      const updatedMeta = {
        ...existingMeta,
        ...(selectedKey === "hero_pillars" || selectedKey === "hero_banner"
          ? {
              badge: metaBadge,
              pillar1Title: metaPillar1,
              pillar1Desc: metaPillar1Desc,
              pillar2Title: metaPillar2,
              pillar2Desc: metaPillar2Desc,
              pillar3Title: metaPillar3,
              pillar3Desc: metaPillar3Desc,
              pillar4Title: metaPillar4,
              pillar4Desc: metaPillar4Desc,
            }
          : {}),
      };

      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: selectedKey,
          title: title || (selectedKey === "hero_pillars" ? "4 Luxury Brand Trust Pillars" : undefined),
          content: content || "",
          metadataJson: JSON.stringify(updatedMeta),
        }),
      });

      if (res.ok) {
        setStatus("Changes saved and updated across live storefront immediately!");
        loadContent();
      } else {
        setStatus("Failed to update content.");
      }
    } catch {
      setStatus("Network error saving content.");
    } finally {
      setSaving(false);
    }
  };

  const contentItems = [
    { key: "hero_pillars", label: "4 Luxury Brand Pillars (32% Extrait, Sourcing...)" },
    { key: "hero_banner", label: "Homepage Hero Banner & Top Badges" },
    { key: "announcement_bar", label: "Top Announcement Bar & Offer" },
    { key: "brand_story", label: "Brand Philosophy & Story" },
    { key: "shipping_policy", label: "Shipping & Delivery Policy" },
    { key: "return_policy", label: "Returns & Exchanges Policy" },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#EBE7DF]">
        <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
          CMS Control
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
          Website Content Management
        </h1>
        <p className="text-xs text-[#7A7A7A] mt-0.5">
          Edit headlines, banners, announcements, policies, and brand narratives without developer intervention.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left selector */}
        <div className="space-y-1">
          {contentItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleSelectKey(item.key)}
              className={`w-full text-left p-3 text-xs rounded-sm transition-colors ${
                selectedKey === item.key
                  ? "bg-[#0F0F0F] text-white font-medium shadow-xs"
                  : "bg-white text-[#5A5A5A] border border-[#EBE7DF] hover:bg-[#FAF8F5]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Editor */}
        <div className="md:col-span-3 bg-white border border-[#EBE7DF] rounded-sm p-6 space-y-4">
          {status && (
            <div className="p-3 bg-[#FAF8F5] border border-[#C5A059] text-xs text-[#0F0F0F] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
              <span>{status}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* SPECIAL EDITOR FOR THE 4 BRAND TRUST PILLARS */}
            {selectedKey === "hero_pillars" && (
              <div className="space-y-4">
                <div className="p-3 bg-[#FAF8F5] border-l-2 border-[#C5A059] text-xs text-[#5A5A5A]">
                  These are the 4 luxury trust pillars shown directly below the main hero buttons on your homepage. Edit the text and oil concentration below to update them in real time.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pillar 1 */}
                  <div className="p-4 bg-white border border-[#DDD] rounded-sm space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F0F0F]">
                      <Award className="w-4 h-4 text-[#C5A059]" />
                      <span>Pillar 1: Oil Concentration</span>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#7A7A7A] mb-1">Title</label>
                      <input
                        type="text"
                        value={metaPillar1}
                        onChange={(e) => setMetaPillar1(e.target.value)}
                        placeholder="e.g. 32% Extrait"
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#CCC] rounded-sm text-xs font-medium text-[#0F0F0F] focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#7A7A7A] mb-1">Subtitle / Description</label>
                      <input
                        type="text"
                        value={metaPillar1Desc}
                        onChange={(e) => setMetaPillar1Desc(e.target.value)}
                        placeholder="e.g. Double the oil concentration of standard designer EDPs"
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#CCC] rounded-sm text-xs text-[#0F0F0F] focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pillar 2 */}
                  <div className="p-4 bg-white border border-[#DDD] rounded-sm space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F0F0F]">
                      <Compass className="w-4 h-4 text-[#C5A059]" />
                      <span>Pillar 2: Ingredient Sourcing</span>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#7A7A7A] mb-1">Title</label>
                      <input
                        type="text"
                        value={metaPillar2}
                        onChange={(e) => setMetaPillar2(e.target.value)}
                        placeholder="e.g. Grasse & Assam Sourced"
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#CCC] rounded-sm text-xs font-medium text-[#0F0F0F] focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#7A7A7A] mb-1">Subtitle / Description</label>
                      <input
                        type="text"
                        value={metaPillar2Desc}
                        onChange={(e) => setMetaPillar2Desc(e.target.value)}
                        placeholder="e.g. Aged botanicals sourced directly from origin harvests"
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#CCC] rounded-sm text-xs text-[#0F0F0F] focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div className="p-4 bg-white border border-[#DDD] rounded-sm space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F0F0F]">
                      <Droplets className="w-4 h-4 text-[#C5A059]" />
                      <span>Pillar 3: Longevity & Sillage</span>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#7A7A7A] mb-1">Title</label>
                      <input
                        type="text"
                        value={metaPillar3}
                        onChange={(e) => setMetaPillar3(e.target.value)}
                        placeholder="e.g. 14+ Hour Projection"
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#CCC] rounded-sm text-xs font-medium text-[#0F0F0F] focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#7A7A7A] mb-1">Subtitle / Description</label>
                      <input
                        type="text"
                        value={metaPillar3Desc}
                        onChange={(e) => setMetaPillar3Desc(e.target.value)}
                        placeholder="e.g. Uncompromising longevity engineered for tropical heat"
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#CCC] rounded-sm text-xs text-[#0F0F0F] focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pillar 4 */}
                  <div className="p-4 bg-white border border-[#DDD] rounded-sm space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F0F0F]">
                      <Shield className="w-4 h-4 text-[#C5A059]" />
                      <span>Pillar 4: Authenticity & Direct Luxury</span>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#7A7A7A] mb-1">Title</label>
                      <input
                        type="text"
                        value={metaPillar4}
                        onChange={(e) => setMetaPillar4(e.target.value)}
                        placeholder="e.g. 100% Authentic"
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#CCC] rounded-sm text-xs font-medium text-[#0F0F0F] focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#7A7A7A] mb-1">Subtitle / Description</label>
                      <input
                        type="text"
                        value={metaPillar4Desc}
                        onChange={(e) => setMetaPillar4Desc(e.target.value)}
                        placeholder="e.g. Direct from our laboratory with zero intermediary markups"
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#CCC] rounded-sm text-xs text-[#0F0F0F] focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HERO BANNER TAB */}
            {selectedKey === "hero_banner" && (
              <div className="space-y-4">
                <div className="p-4 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold block">
                    Hero Top Pill Badge
                  </span>
                  <div>
                    <label className="block text-[#0F0F0F] font-medium mb-1">
                      Floating Pill Tagline / Oil Concentration Badge
                    </label>
                    <input
                      type="text"
                      value={metaBadge}
                      onChange={(e) => setMetaBadge(e.target.value)}
                      placeholder="e.g. Pure 32% Oil Extrait Concentration"
                      className="w-full px-3.5 py-2 bg-white border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none text-[#0F0F0F] text-xs"
                    />
                    <p className="text-[10px] text-[#8C827A] mt-1">
                      Appears in the floating pill above the main headline on the homepage.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Section Title / Headline</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none text-[#0F0F0F] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Section Body / Content</label>
                  <textarea
                    rows={6}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none text-[#0F0F0F] leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* GENERIC CMS SECTIONS (Story, Policies, Announcement) */}
            {selectedKey !== "hero_pillars" && selectedKey !== "hero_banner" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Section Title / Headline</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none text-[#0F0F0F] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[#0F0F0F] font-medium mb-1">Section Body / Content</label>
                  <textarea
                    rows={8}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none text-[#0F0F0F] leading-relaxed"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0F0F0F] text-white uppercase tracking-luxury text-xs font-medium hover:bg-[#C5A059] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Publishing Changes..." : "Publish to Live Site"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

