"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, ShieldCheck, Eye, EyeOff, CreditCard, ExternalLink, Lock } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    free_shipping_threshold: "1499",
    flat_shipping_rate: "99",
    cod_enabled: "true",
    razorpay_enabled: "true",
    razorpay_key_id: "",
    razorpay_key_secret: "",
    brand_tagline: "More than a fragrance. A lasting connection.",
    support_phone: "+91 98765 43210",
    support_email: "concierge@gauchi.com",
    gst_number: "27AAACG1234F1Z5",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
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

        {/* Payment Gateways & Razorpay API */}
        <div className="p-5 bg-white border border-[#EBE7DF] rounded-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C5A059]" />
              <h3 className="font-semibold text-sm text-[#0F0F0F]">
                Payment Methods & Gateway Configuration
              </h3>
            </div>
            <a
              href="https://dashboard.razorpay.com/app/website-app-settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#C5A059] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Razorpay API Keys Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

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
              <span className="font-medium text-[#0F0F0F]">Enable Razorpay Online Checkout (UPI / Cards / NetBanking)</span>
            </label>
          </div>

          {/* Razorpay API Credentials Box */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E0DBD0] rounded-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="text-xs font-semibold uppercase tracking-luxury text-[#0F0F0F]">
                  Razorpay API Credentials
                </span>
              </div>

              {/* Mode Indicator Badge */}
              {settings.razorpay_key_id?.startsWith("rzp_live_") ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF5EC] text-[#2A6E3B] border border-[#BDE3C4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A6E3B] animate-pulse" />
                  LIVE PRODUCTION MODE (Real Payments)
                </span>
              ) : settings.razorpay_key_id?.startsWith("rzp_test_") ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF8E7] text-[#B87A00] border border-[#F2DEAA]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B87A00]" />
                  TEST / SANDBOX MODE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#EBE7DF] text-[#5A5A5A]">
                  SIMULATION MODE (Demo orders active)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  placeholder="rzp_test_... or rzp_live_..."
                  value={settings.razorpay_key_id || ""}
                  onChange={(e) => handleChange("razorpay_key_id", e.target.value.trim())}
                  className="w-full px-3 py-2 bg-white border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none font-mono text-xs"
                />
                <span className="text-[10px] text-[#7A7A7A] mt-1 block">
                  Find this under <em>Razorpay Dashboard ➔ Account & Settings ➔ API Keys</em>.
                </span>
              </div>

              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">
                  Razorpay Key Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder="Enter Key Secret"
                    value={settings.razorpay_key_secret || ""}
                    onChange={(e) => handleChange("razorpay_key_secret", e.target.value.trim())}
                    className="w-full pl-3 pr-10 py-2 bg-white border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A7A7A] hover:text-[#0F0F0F] p-1"
                    aria-label={showSecret ? "Hide secret" : "Show secret"}
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-[#7A7A7A] mt-1 block">
                  Secret used for cryptographic HMAC SHA-256 signature verification.
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#8C827A] pt-1">
              💡 <strong>Instant Activation:</strong> Once entered and saved, customers will immediately be able to pay via Google Pay, PhonePe, UPI apps, Credit Cards, and Net Banking at checkout.
            </p>
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
