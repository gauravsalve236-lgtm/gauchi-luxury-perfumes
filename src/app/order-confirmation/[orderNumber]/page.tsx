"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, Printer, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { OrderType } from "@/types";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        const data = await res.json();
        if (res.ok) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (orderNumber) fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-xs">
        Loading acquisition confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif-luxury text-2xl text-[#0F0F0F]">Order Not Located</h2>
        <p className="text-xs text-[#7A7A7A]">Could not find details for order reference {orderNumber}.</p>
        <Link href="/shop" className="inline-block px-6 py-2.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const shippingAddr = JSON.parse(order.shippingAddressJson || "{}");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Success Badge & Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-[#EAF5EC] text-[#2A6E3B] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
          Acquisition Confirmed
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#0F0F0F]">
          Thank You For Choosing Gauchi
        </h1>
        <p className="text-xs sm:text-sm text-[#5A5A5A] max-w-lg mx-auto leading-relaxed">
          Your order has been recorded in our laboratory. We are preparing your artisanal flacon for hand-packaged express dispatch.
        </p>
      </div>

      {/* Order Meta Bar */}
      <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-sm p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[#8C827A] block text-[11px]">Order Reference</span>
          <span className="font-semibold text-[#0F0F0F] font-mono">{order.orderNumber}</span>
        </div>
        <div>
          <span className="text-[#8C827A] block text-[11px]">Date</span>
          <span className="font-medium text-[#0F0F0F]">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div>
          <span className="text-[#8C827A] block text-[11px]">Total Paid</span>
          <span className="font-semibold text-[#0F0F0F]">₹{order.total}</span>
        </div>
        <div>
          <span className="text-[#8C827A] block text-[11px]">Payment Method</span>
          <span className="font-medium text-[#0F0F0F]">
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay Online (Paid)"}
          </span>
        </div>
      </div>

      {/* Shipment Tracker Card */}
      <div className="border border-[#EBE7DF] rounded-sm p-6 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE7DF]">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-serif-luxury text-base text-[#0F0F0F]">Shipment Status</h3>
          </div>
          <span className="text-xs uppercase tracking-luxury font-semibold bg-[#FAF8F5] px-3 py-1 border border-[#C5A059]/40 text-[#0F0F0F]">
            {order.orderStatus}
          </span>
        </div>

        {order.trackingNumber ? (
          <div className="p-4 bg-[#FAF8F5] rounded-sm text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[#8C827A] block text-[11px]">Courier Partner & Air Waybill (AWB):</span>
              <span className="font-semibold text-[#0F0F0F]">
                {order.courierName || "Express Courier"} — {order.trackingNumber}
              </span>
            </div>
            <span className="text-[#2A6E3B] text-[11px] font-medium">In Transit</span>
          </div>
        ) : (
          <p className="text-xs text-[#7A7A7A]">
            Your flacon is being packed with protective foam and gold seal ribbons. A tracking AWB will be updated here shortly.
          </p>
        )}
      </div>

      {/* Itemized Order Breakdown */}
      <div className="border border-[#EBE7DF] rounded-sm p-6 bg-white space-y-4">
        <h3 className="font-serif-luxury text-base text-[#0F0F0F] pb-3 border-b border-[#EBE7DF]">
          Flacon Items
        </h3>
        <div className="divide-y divide-[#F0ECE4]">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-medium text-[#0F0F0F] block">{item.productName}</span>
                <span className="text-[#7A7A7A] text-[11px]">Size: {item.variantSize} × {item.quantity}</span>
              </div>
              <span className="font-semibold text-[#0F0F0F]">₹{item.total}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#EBE7DF] space-y-1.5 text-xs text-[#5A5A5A]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[#2A6E3B]">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Express Shipping</span>
            <span>{order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee}`}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-[#0F0F0F] pt-2 border-t border-[#EBE7DF]">
            <span>Total Payable</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-[#EBE7DF] rounded-sm p-6 bg-[#FAF8F5] text-xs space-y-2">
          <h4 className="font-semibold text-[#0F0F0F] uppercase tracking-luxury text-[11px]">
            Delivery Destination
          </h4>
          <p className="font-medium text-[#0F0F0F]">{shippingAddr.fullName}</p>
          <p className="text-[#5A5A5A]">{shippingAddr.street} {shippingAddr.apartment ? `, ${shippingAddr.apartment}` : ""}</p>
          <p className="text-[#5A5A5A]">{shippingAddr.city}, {shippingAddr.state} — {shippingAddr.postalCode}</p>
          <p className="text-[#5A5A5A]">Phone: {shippingAddr.phone}</p>
        </div>

        <div className="flex flex-col justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="w-full py-3 bg-white border border-[#0F0F0F] text-[#0F0F0F] text-xs uppercase tracking-luxury font-medium hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Tax Invoice</span>
          </button>
          <Link
            href="/shop"
            className="w-full py-3 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors flex items-center justify-center gap-2 text-center"
          >
            <span>Continue Browsing</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
