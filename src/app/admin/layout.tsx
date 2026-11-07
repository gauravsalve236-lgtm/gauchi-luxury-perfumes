"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Star,
  QrCode,
  FileText,
  Settings,
  ExternalLink,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && pathname !== "/admin/login") {
      if (!user || user.role !== "ADMIN") {
        router.push("/admin/login");
      }
    }
  }, [user, isLoading, pathname, router]);

  // Don't render sidebar on admin login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs text-[#7A7A7A]">
        Verifying administrator authorization...
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products & Stock", href: "/admin/products", icon: Package },
    { label: "Orders & Shipping", href: "/admin/orders", icon: ShoppingBag },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Offers & Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Customer Reviews", href: "/admin/reviews", icon: Star },
    { label: "QR Experience", href: "/admin/qr", icon: QrCode },
    { label: "Website Content (CMS)", href: "/admin/content", icon: FileText },
    { label: "Store Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#EBE7DF] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-[#EBE7DF]">
            <Link href="/admin" className="flex flex-col items-center text-center group">
              <img
                src="/images/gauchi-gold-logo.png"
                alt="Gauchi Emblem"
                className="w-8 h-auto object-contain mb-1 transition-transform group-hover:scale-105"
              />
              <span className="font-serif-luxury text-xl tracking-widest-luxury font-medium text-[#0F0F0F] group-hover:text-[#C5A059] transition-colors">
                GAUCHI
              </span>
              <span className="block text-[9px] tracking-widest-luxury text-[#C5A059] uppercase font-semibold mt-0.5">
                Executive Control
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#0F0F0F] text-white"
                      : "text-[#5A5A5A] hover:bg-[#FAF8F5] hover:text-[#0F0F0F]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#EBE7DF] space-y-2 bg-[#FAF8F5]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-[#5A5A5A] hover:text-[#0F0F0F] p-2 rounded-sm hover:bg-white transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-xs text-red-600 hover:text-red-700 p-2 rounded-sm hover:bg-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
