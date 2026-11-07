"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    free_shipping_threshold: "1499",
    flat_shipping_rate: "99",
    cod_enabled: "true",
    razorpay_enabled: "true",
    brand_tagline: "More than a fragrance. A lasting connection.",
    support_phone: "+91 98765 43210",
    support_email: "concierge@gauchi.com",
    gst_number: "27AAACG1234F1Z5",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [status, setStatus] = useState("");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        handleChange("logo_url", data.url);
        setStatus("Logo uploaded! Remember to click 'Save Store Configuration' below.");
      } else {
        setStatus("Failed to upload logo.");
      }
    } catch {
      setStatus("Error uploading logo file.");
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setStatus("Store settings updated successfully.");
      } else {
        setStatus("Failed to update settings.");
      }
    } catch {
      setStatus("Network error updating settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs">Loading store configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-[#EBE7DF]">
        <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
          Commercial Configuration
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
          Store & Business Settings
        </h1>
        <p className="text-xs text-[#7A7A7A] mt-0.5">
          Configure delivery thresholds, payment options, tax registrations, and concierge contacts.
        </p>
      </div>

      {status && (
        <div className="p-3 bg-[#FAF8F5] border border-[#C5A059] text-xs text-[#0F0F0F] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
          <span>{status}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Shipping Settings */}
        <div className="p-5 bg-white border border-[#EBE7DF] rounded-sm space-y-4">
          <h3 className="font-semibold text-sm text-[#0F0F0F] border-b border-[#F0ECE4] pb-2">
            Shipping & Logistics Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0F0F0F] font-medium mb-1">
                Complimentary Free Shipping Cart Threshold (INR)
              </label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => handleChange("free_shipping_threshold", e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
              />
              <span className="text-[11px] text-[#7A7A7A] mt-1 block">
                Orders with subtotal at or above this amount receive free delivery.
              </span>
            </div>

            <div>
              <label className="block text-[#0F0F0F] font-medium mb-1">
                Standard Insured Flat Delivery Fee (INR)
              </label>
              <input
                type="number"
                value={settings.flat_shipping_rate}
                onChange={(e) => handleChange("flat_shipping_rate", e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
              />
              <span className="text-[11px] text-[#7A7A7A] mt-1 block">
                Applied to orders below the free shipping threshold.
              </span>
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="p-5 bg-white border border-[#EBE7DF] rounded-sm space-y-4">
          <h3 className="font-semibold text-sm text-[#0F0F0F] border-b border-[#F0ECE4] pb-2">
            Payment Methods
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.cod_enabled === "true"}
                onChange={(e) => handleChange("cod_enabled", e.target.checked ? "true" : "false")}
                className="text-[#C5A059]"
              />
              <span className="font-medium text-[#0F0F0F]">Enable Cash on Delivery (COD)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.razorpay_enabled === "true"}
                onChange={(e) => handleChange("razorpay_enabled", e.target.checked ? "true" : "false")}
                className="text-[#C5A059]"
              />
              <span className="font-medium text-[#0F0F0F]">Enable Razorpay UPI / Cards / NetBanking</span>
            </label>
          </div>
        </div>

        {/* Brand & Tax Identity */}
        <div className="p-5 bg-white border border-[#EBE7DF] rounded-sm space-y-4">
          <h3 className="font-semibold text-sm text-[#0F0F0F] border-b border-[#F0ECE4] pb-2">
            Brand Identity & Legal Registrations
          </h3>

          {/* Official Logo Upload */}
          <div className="p-4 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm space-y-3">
            <span className="font-semibold text-[#0F0F0F] block">Official Brand Logo</span>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-16 w-40 bg-white border border-[#DDD] rounded-sm flex items-center justify-center p-2 overflow-hidden">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Gauchi Logo Preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[11px] text-[#8C827A] italic">No logo uploaded (Default text active)</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="inline-block px-4 py-2 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium rounded-sm cursor-pointer hover:bg-[#C5A059] transition-colors">
                  <span>{uploadingLogo ? "Uploading Logo..." : "Choose Logo Image File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-[#7A7A7A]">
                  Upload PNG, SVG, or JPG (Recommended: transparent background, height ~100px).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0F0F0F] font-medium mb-1">Official Brand Slogan</label>
              <input
                type="text"
                value={settings.brand_tagline}
                onChange={(e) => handleChange("brand_tagline", e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#0F0F0F] font-medium mb-1">Goods & Services Tax (GST) Number</label>
              <input
                type="text"
                value={settings.gst_number}
                onChange={(e) => handleChange("gst_number", e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[#0F0F0F] font-medium mb-1">Concierge Email</label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => handleChange("support_email", e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#0F0F0F] font-medium mb-1">WhatsApp & Phone Hotline</label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) => handleChange("support_phone", e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Store Configuration"}</span>
        </button>
      </form>
    </div>
  );
}
