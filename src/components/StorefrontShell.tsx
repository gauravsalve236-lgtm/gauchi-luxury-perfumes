"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isExperience = pathname?.startsWith("/experience");

  // Admin portal and QR mobile experience should have full dedicated screens without customer navbar
  if (isAdmin || isExperience) {
    return (
      <main className="flex-1 w-full min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <Suspense fallback={<div className="h-8 bg-[#FAF8F5]" />}>
        <AnnouncementBar />
      </Suspense>
      <Suspense fallback={<div className="h-20 bg-white" />}>
        <Header />
      </Suspense>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
