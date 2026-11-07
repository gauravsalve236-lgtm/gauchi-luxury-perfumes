"use client";

import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
}

export default function BrandLogo({
  size = "md",
  showSubtitle = true,
  className = "",
}: BrandLogoProps) {
  const iconDimensions = {
    sm: "w-6 h-auto",
    md: "w-8 h-auto",
    lg: "w-12 h-auto",
  };

  const textStyles = {
    sm: "text-lg tracking-widest-luxury",
    md: "text-2xl sm:text-3xl tracking-widest-luxury",
    lg: "text-3xl sm:text-4xl tracking-widest-luxury",
  };

  const subtitleStyles = {
    sm: "text-[7px] tracking-[0.3em]",
    md: "text-[9px] tracking-[0.35em]",
    lg: "text-[10px] tracking-[0.4em]",
  };

  return (
    <div className={`flex flex-col items-center text-center group ${className}`}>
      {/* Golden Dove Emblem Above Brand Name */}
      <img
        src="/images/gauchi-gold-logo.png"
        alt="Gauchi Emblem"
        className={`${iconDimensions[size]} object-contain mb-1 transition-transform duration-300 group-hover:scale-110 drop-shadow-xs`}
      />

      {/* Brand Typography */}
      <span className={`font-serif-luxury font-medium text-[#0F0F0F] group-hover:text-[#C5A059] transition-colors leading-none ${textStyles[size]}`}>
        GAUCHI
      </span>

      {showSubtitle && (
        <span className={`text-[#8C827A] uppercase font-light mt-0.5 ${subtitleStyles[size]}`}>
          Haute Parfumerie
        </span>
      )}
    </div>
  );
}
