"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Star,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Heart,
  Droplets,
  Sun,
  ShieldCheck,
  Send,
} from "lucide-react";
import { QrCampaignType } from "@/types";

export default function GauchiExperiencePage() {
  const params = useParams();
  const code = params?.code as string;

  const [campaign, setCampaign] = useState<QrCampaignType | null>(null);
  const [loading, setLoading] = useState(true);

  // Feedback form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [preferredFamily, setPreferredFamily] = useState("Oud");
  const [hasMarketingConsent, setHasMarketingConsent] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT || "+919876543210";

  useEffect(() => {
    async function loadCampaign() {
      try {
        const res = await fetch(`/api/qr/${code}`);
        const data = await res.json();
        if (res.ok) {
          setCampaign(data.campaign);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (code) loadCampaign();
  }, [code]);

  const handleTrackClick = async (linkType: "amazon" | "flipkart" | "website") => {
    if (!campaign) return;
    try {
      await fetch("/api/qr/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id, linkType }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !customerName.trim() || !feedback.trim()) return;

    setSubmittingFeedback(true);
    setFeedbackStatus(null);

    try {
      const res = await fetch("/api/qr/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          customerName,
          customerEmail,
          customerPhone,
          rating,
          feedback,
          preferredFamily,
          hasMarketingConsent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackStatus("Thank you! Your feedback has been received with sincere gratitude.");
        setFeedback("");
      } else {
        setFeedbackStatus(data.error || "Submission failed");
      }
    } catch {
      setFeedbackStatus("Network error submitting feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center text-xs">
        Connecting to The Gauchi Experience...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif-luxury text-2xl text-[#0F0F0F]">Destination Not Found</h2>
        <p className="text-xs text-[#7A7A7A]">This flacon QR destination could not be identified.</p>
        <Link href="/" className="inline-block px-6 py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury">
          Return to Gauchi Store
        </Link>
      </div>
    );
  }

  const product = campaign.product;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* 1. Welcome Header */}
      <div className="text-center space-y-3 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm p-8 sm:p-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E0DBD0] rounded-full text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          The Gauchi Experience
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#0F0F0F]">
          Welcome to the World of Gauchi
        </h1>
        <p className="text-sm font-serif-luxury italic text-[#C5A059]">
          "More than a fragrance. A lasting connection."
        </p>
        <p className="text-xs text-[#5A5A5A] max-w-lg mx-auto leading-relaxed pt-2">
          Thank you for unboxing this flacon. You now possess an artisanal creation formulated at 32% pure oil concentration. Explore your notes, proper scent storage rituals, and share your genuine perspective.
        </p>
      </div>

      {/* 2. Unboxed Fragrance Overview */}
      {product && (
        <div className="border border-[#EBE7DF] rounded-sm p-6 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#EBE7DF]">
            {product.images?.[0]?.url && (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-32 h-36 object-cover rounded-sm border border-[#EBE7DF] bg-[#FAF8F5]"
              />
            )}
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
                Your Flacon: {campaign.variantSize || "Signature"}
              </span>
              <h2 className="font-serif-luxury text-2xl text-[#0F0F0F]">{product.name}</h2>
              <p className="text-xs text-[#5A5A5A] italic">{product.subtitle}</p>
              <div className="pt-2">
                <Link
                  href={`/shop/${product.slug}`}
                  className="text-xs text-[#0F0F0F] underline hover:text-[#C5A059] font-medium"
                >
                  View full product specifications & refills →
                </Link>
              </div>
            </div>
          </div>

          {/* Olfactory Notes Breakdown */}
          <div className="space-y-3">
            <h3 className="font-serif-luxury text-base text-[#0F0F0F]">Fragrance Pyramid</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm">
                <span className="font-semibold text-[#0F0F0F] block text-[10px] uppercase tracking-wider text-[#C5A059]">Top Notes</span>
                <p className="text-[#3A3A3A] mt-1">{product.topNotes}</p>
              </div>
              <div className="p-3.5 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm">
                <span className="font-semibold text-[#0F0F0F] block text-[10px] uppercase tracking-wider text-[#C5A059]">Heart Notes</span>
                <p className="text-[#3A3A3A] mt-1">{product.middleNotes}</p>
              </div>
              <div className="p-3.5 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm">
                <span className="font-semibold text-[#0F0F0F] block text-[10px] uppercase tracking-wider text-[#C5A059]">Base Notes</span>
                <p className="text-[#3A3A3A] mt-1">{product.baseNotes}</p>
              </div>
            </div>
          </div>

          {/* How to Store and Apply Guide */}
          <div className="pt-4 border-t border-[#EBE7DF] space-y-3">
            <h3 className="font-serif-luxury text-base text-[#0F0F0F]">How to Preserve & Apply Your Parfum</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5A5A5A]">
              <div className="flex gap-3">
                <Droplets className="w-5 h-5 text-[#C5A059] shrink-0" />
                <div>
                  <span className="font-medium text-[#0F0F0F] block">Pulse Point Application</span>
                  Spray on collarbones, inner wrists, and behind the ears from 15cm. Do not rub wrists together, which crushes delicate top notes.
                </div>
              </div>
              <div className="flex gap-3">
                <Sun className="w-5 h-5 text-[#C5A059] shrink-0" />
                <div>
                  <span className="font-medium text-[#0F0F0F] block">Temperature & Light Storage</span>
                  Keep in a cool, dark place away from direct sunlight and bathroom humidity to preserve natural resin longevity.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Honest Review Marketplace Links (Amazon, Flipkart, Website) */}
      <div className="border border-[#EBE7DF] rounded-sm p-6 sm:p-8 bg-[#FAF8F5] space-y-4 text-center">
        <h3 className="font-serif-luxury text-2xl text-[#0F0F0F]">Share Your Honest Perspective</h3>
        <p className="text-xs text-[#5A5A5A] max-w-md mx-auto">
          We deeply value candid feedback from our collectors. Share your review on your preferred platform:
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {campaign.amazonReviewUrl && (
            <a
              href={campaign.amazonReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackClick("amazon")}
              className="w-full sm:w-auto px-6 py-3 bg-[#FF9900] text-black rounded-sm text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#e68a00] transition-colors shadow-xs"
            >
              <span>Review on Amazon</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {campaign.flipkartReviewUrl && (
            <a
              href={campaign.flipkartReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackClick("flipkart")}
              className="w-full sm:w-auto px-6 py-3 bg-[#2874F0] text-white rounded-sm text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#2060c7] transition-colors shadow-xs"
            >
              <span>Review on Flipkart</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {product && (
            <Link
              href={`/shop/${product.slug}#reviews`}
              onClick={() => handleTrackClick("website")}
              className="w-full sm:w-auto px-6 py-3 bg-[#0F0F0F] text-white rounded-sm text-xs font-medium uppercase tracking-luxury flex items-center justify-center gap-2 hover:bg-[#C5A059] transition-colors"
            >
              <span>Gauchi Store Review</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4. Customer Feedback & Fragrance Preference Survey */}
      <div className="border border-[#EBE7DF] rounded-sm p-6 sm:p-8 bg-white space-y-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Olfactory Survey
          </span>
          <h3 className="font-serif-luxury text-2xl text-[#0F0F0F]">Customer Feedback & Preferences</h3>
          <p className="text-xs text-[#7A7A7A] mt-1">
            Help our perfumers craft upcoming collections to suit your palette.
          </p>
        </div>

        {feedbackStatus && (
          <div className="p-4 bg-[#FAF8F5] border border-[#C5A059] text-xs text-[#0F0F0F] rounded-sm">
            {feedbackStatus}
          </div>
        )}

        <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#0F0F0F] font-medium mb-1">How would you rate this fragrance?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 text-[#C5A059]"
                >
                  <Star className={`w-6 h-6 ${s <= rating ? "fill-[#C5A059]" : "text-[#DDD]"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0F0F0F] font-medium mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Rohan Varma"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#0F0F0F] font-medium mb-1">Preferred Fragrance Family</label>
              <select
                value={preferredFamily}
                onChange={(e) => setPreferredFamily(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
              >
                <option value="Oud">Rich Woody Oud</option>
                <option value="Floral & Fruity">Sensual Floral & Fruity</option>
                <option value="Fresh & Aquatic">Crisp Aquatic & Marine</option>
                <option value="Warm & Woody">Smoky Tobacco & Vanilla</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#0F0F0F] font-medium mb-1">Your Detailed Experience *</label>
            <textarea
              rows={3}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you loved about projection, notes balance, or bottle design..."
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
            />
          </div>

          {/* Optional customer registration */}
          <div className="p-4 bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm space-y-3">
            <span className="font-semibold text-[#0F0F0F] block">
              Optional: Register for Future Private Extrait Releases
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5A5A5A] text-[11px] mb-1">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-white border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#5A5A5A] text-[11px] mb-1">Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-3 py-2 bg-white border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 pt-1 text-[11px] text-[#5A5A5A] cursor-pointer">
              <input
                type="checkbox"
                checked={hasMarketingConsent}
                onChange={(e) => setHasMarketingConsent(e.target.checked)}
                className="mt-0.5 text-[#C5A059] focus:ring-[#C5A059]"
              />
              <span>
                I agree to receive private releases and exclusive privilege offers from Gauchi Luxury Perfumes.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submittingFeedback}
            className="w-full py-3.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submittingFeedback ? "Submitting..." : "Submit Experience Feedback"}</span>
          </button>
        </form>
      </div>

      {/* 5. Direct WhatsApp Concierge Help */}
      <div className="text-center p-6 border border-[#EBE7DF] bg-[#FAF8F5] rounded-sm space-y-3">
        <h4 className="font-serif-luxury text-lg text-[#0F0F0F]">Need Personal Scent Advice?</h4>
        <p className="text-xs text-[#5A5A5A]">Our Master Perfumery Concierge is available 7 days a week on WhatsApp.</p>
        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hello%20Gauchi%20Concierge,%20I%20scanned%20my%20perfume%20box%20and%20would%20like%20to%20speak%20with%20a%20fragrance%20advisor.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#25D366] text-white text-xs font-semibold rounded-sm hover:bg-[#20ba59] transition-colors shadow-xs"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat with Gauchi Concierge</span>
        </a>
      </div>
    </div>
  );
}
