"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PolicyPage() {
  const params = useParams();
  const policy = params?.policy as string;

  const content: Record<string, { title: string; subtitle: string; body: React.ReactNode }> = {
    shipping: {
      title: "Shipping & Delivery Policy",
      subtitle: "Insured Express Courier Across India",
      body: (
        <div className="space-y-4 text-xs text-[#5A5A5A] leading-relaxed">
          <p>
            At GAUCHI, we handle every flacon with meticulous precision. All orders are packed in impact-resistant gold-embossed protective packaging to ensure your perfume arrives in museum condition.
          </p>
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Processing & Dispatch Time</h3>
          <p>
            Orders received before 2:00 PM IST on business days are dispatched within 24 hours from our Mumbai laboratory. Orders placed over weekends or national holidays are dispatched on the next business day.
          </p>
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Delivery Timelines</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Tier 1 Metro Cities:</strong> 2 to 3 business days via BlueDart / Delhivery Express.</li>
            <li><strong>Rest of India:</strong> 3 to 5 business days.</li>
            <li><strong>Remote Areas:</strong> 5 to 7 business days via India Post SpeedPost.</li>
          </ul>
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Shipping Rates</h3>
          <p>
            We offer <strong>Complimentary Express Delivery</strong> on all orders above ₹1,499. For orders below ₹1,499, a flat insured courier fee of ₹99 is applied.
          </p>
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Real-time Tracking</h3>
          <p>
            Once dispatched, a tracking Air Waybill (AWB) number and direct link will be transmitted to your email and mobile phone number via SMS/WhatsApp.
          </p>
        </div>
      ),
    },
    returns: {
      title: "Returns & Replacement Policy",
      subtitle: "Our 7-Day Authenticity & Delighted Guarantee",
      body: (
        <div className="space-y-4 text-xs text-[#5A5A5A] leading-relaxed">
          <p>
            We take immense pride in our 32% pure extrait formulations. If your product arrives damaged in transit, with a defective atomizer, or if you received an incorrect flacon, we will replace it immediately with zero hassle.
          </p>
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Eligibility for Returns & Replacements</h3>
          <p>
            Contact our Concierge within 7 days of delivery at <span className="font-medium text-[#0F0F0F]">concierge@gauchi.com</span> or via WhatsApp at +91 98765 43210 with a photo or video of the parcel condition.
          </p>
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Refund Process</h3>
          <p>
            Approved refunds are credited to the original payment source (UPI/Credit Card) within 4–5 business days. For COD orders, refund is issued directly via bank transfer or UPI transfer upon receipt of details.
          </p>
        </div>
      ),
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Guidance on Formulations, Sillage & Longevity",
      body: (
        <div className="space-y-4 text-xs text-[#5A5A5A] leading-relaxed">
          <h3 className="font-semibold text-sm text-[#0F0F0F]">What does 32% Extrait de Parfum concentration mean?</h3>
          <p>
            Extrait de Parfum (pure perfume) represents the highest tier of fragrance concentration in existence. Where typical designer eau de toilettes hold only 8–12% fragrance oil, Gauchi extraits contain 30–32% pure natural essence, ensuring rich multifaceted projection and 14–16+ hours of skin longevity.
          </p>
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Where are your perfume ingredients sourced?</h3>
          <p>
            Our aged agarwood (Oud) is sustainably cultivated in Assam, India. Our Damascena and Centifolia roses are sourced from Grasse, France. Bourbon vanilla originates from Madagascar, and our bergamot is harvested in Calabria, Italy.
          </p>
          <h3 className="font-semibold text-sm text-[#0F0F0F]">How should I store my Gauchi flacon?</h3>
          <p>
            Because we use rich natural essences, store your flacon in a dry, cool cabinet away from direct ultraviolet sunlight and heat.
          </p>
          <h3 className="font-semibold text-sm text-[#0F0F0F]">Can I try samples before purchasing full 60ml bottles?</h3>
          <p>
            Yes! We offer 20ml travel flacons for every fragrance as well as the Gauchi Masterpiece Discovery Quintet Set containing 5 x 20ml extraits.
          </p>
        </div>
      ),
    },
    privacy: {
      title: "Privacy Policy",
      subtitle: "Commitment to Client Data Confidentiality",
      body: (
        <div className="space-y-4 text-xs text-[#5A5A5A] leading-relaxed">
          <p>
            GAUCHI is dedicated to preserving your absolute privacy. We never sell, rent, or trade your personal information, address, phone number, or transaction history with any third-party marketing companies.
          </p>
          <p>
            Customer payment details are processed directly through 256-bit SSL encrypted PCI-DSS compliant gateways (Razorpay). No credit card numbers or banking secrets are ever stored on our servers.
          </p>
        </div>
      ),
    },
    terms: {
      title: "Terms & Conditions",
      subtitle: "Official Commercial Governance",
      body: (
        <div className="space-y-4 text-xs text-[#5A5A5A] leading-relaxed">
          <p>
            By browsing or purchasing from Gauchi Luxury Perfumes (gauchi.com), you acknowledge and agree to abide by our terms of service, payment guidelines, and intellectual property rights.
          </p>
          <p>
            All fragrance formulas, trademarks, logo signatures, bottle artwork, and photographic assets are the exclusive property of GAUCHI.
          </p>
        </div>
      ),
    },
  };

  const item = content[policy] || content.shipping;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-[#5A5A5A] hover:text-[#C5A059] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Store</span>
      </Link>

      <div className="border-b border-[#EBE7DF] pb-4">
        <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
          {item.subtitle}
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#0F0F0F] mt-1">
          {item.title}
        </h1>
      </div>

      <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm p-8 sm:p-10">
        {item.body}
      </div>
    </div>
  );
}
