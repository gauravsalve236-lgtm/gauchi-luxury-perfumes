"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AnnouncementBar() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#FAF8F5] border-b border-[#EBE7DF] text-[#1A1A1A] py-2 px-4 text-xs font-medium tracking-wide">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>
            Complimentary 5ml Extrait Flacon with all orders above ₹1,999 • Free Express Delivery
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[#5A5A5A]">
          <span className="flex items-center gap-1">
            Privilege Offer Ends:{" "}
            <span className="font-mono font-semibold text-[#0F0F0F]">
              {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </span>
          <Link href="/shop" className="underline hover:text-[#C5A059] transition-colors font-medium">
            Shop Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
