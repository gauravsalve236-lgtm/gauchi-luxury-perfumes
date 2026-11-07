"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#7A7A7A]">
        Aggregating business analytics...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const lowStock = data?.lowStockVariants || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
          Executive Snapshot
        </span>
        <h1 className="font-serif-luxury text-3xl text-[#0F0F0F] mt-0.5">
          Business Overview
        </h1>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#EBE7DF] rounded-sm space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-xs font-medium">
            <span>Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-semibold text-[#0F0F0F]">
            ₹{Math.round(metrics.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[#2A6E3B]">
            Average Order: ₹{Math.round(metrics.averageOrderValue || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-5 bg-white border border-[#EBE7DF] rounded-sm space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-xs font-medium">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-semibold text-[#0F0F0F]">
            {metrics.totalOrders || 0}
          </div>
          <p className="text-[11px] text-[#5A5A5A]">
            {metrics.pendingOrdersCount || 0} Pending • {metrics.deliveredOrdersCount || 0} Delivered
          </p>
        </div>

        <div className="p-5 bg-white border border-[#EBE7DF] rounded-sm space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-xs font-medium">
            <span>Registered Clients</span>
            <Users className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-semibold text-[#0F0F0F]">
            {metrics.totalCustomers || 0}
          </div>
          <p className="text-[11px] text-[#5A5A5A]">Private clientele</p>
        </div>

        <div className="p-5 bg-white border border-[#EBE7DF] rounded-sm space-y-2">
          <div className="flex items-center justify-between text-[#8C827A] text-xs font-medium">
            <span>Active Flacons</span>
            <Package className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-semibold text-[#0F0F0F]">
            {metrics.totalProducts || 0}
          </div>
          <p className="text-[11px] text-[#5A5A5A]">Catalog extraits</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="p-5 bg-[#FAF8F5] border border-[#C5A059]/40 rounded-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F0F0F]">
            <AlertTriangle className="w-4 h-4 text-[#C5A059]" />
            <span>Low Stock Inventory Alerts ({lowStock.length} Variants)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {lowStock.map((v: any) => (
              <div key={v.id} className="p-3 bg-white border border-[#EBE7DF] rounded-sm flex justify-between items-center">
                <div>
                  <span className="font-medium text-[#0F0F0F]">{v.product?.name}</span>
                  <span className="text-[#8C827A] block text-[11px]">Size: {v.size}</span>
                </div>
                <span className="px-2 py-0.5 bg-[#FDECEC] text-[#A82222] font-bold text-xs rounded-xs">
                  {v.stock} units
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Portals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/products"
          className="p-5 bg-white border border-[#EBE7DF] hover:border-[#C5A059] rounded-sm transition-colors group space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-xs uppercase tracking-luxury text-[#0F0F0F]">
              Product Management
            </span>
            <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-[#7A7A7A]">
            Add perfumes, adjust prices, edit fragrance pyramid notes, and manage stock variants.
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="p-5 bg-white border border-[#EBE7DF] hover:border-[#C5A059] rounded-sm transition-colors group space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-xs uppercase tracking-luxury text-[#0F0F0F]">
              Fulfillment & Orders
            </span>
            <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-[#7A7A7A]">
            Update order statuses, assign BlueDart / Delhivery tracking AWBs, and print invoices.
          </p>
        </Link>

        <Link
          href="/admin/qr"
          className="p-5 bg-white border border-[#EBE7DF] hover:border-[#C5A059] rounded-sm transition-colors group space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-xs uppercase tracking-luxury text-[#0F0F0F]">
              The Gauchi Experience
            </span>
            <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-[#7A7A7A]">
            Manage box QR code destinations, Amazon/Flipkart review links, and scan analytics.
          </p>
        </Link>
      </div>
    </div>
  );
}
