"use client";

import React, { useState, useEffect } from "react";
import { Search, Truck, Download, Edit3, CheckCircle2, XCircle, Printer } from "lucide-react";
import { OrderType } from "@/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Status edit modal
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const statuses = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (search) params.append("search", search);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, search]);

  const openStatusModal = (order: OrderType) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setCourierName(order.courierName || "BlueDart Express");
    setTrackingNumber(order.trackingNumber || "");
    setInternalNotes(order.internalNotes || "");
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: newStatus,
          courierName,
          trackingNumber,
          internalNotes,
        }),
      });

      if (res.ok) {
        setSelectedOrder(null);
        loadOrders();
      } else {
        alert("Failed to update order");
      }
    } catch {
      alert("Network error updating order");
    } finally {
      setUpdating(false);
    }
  };

  const exportCSV = () => {
    const headers = ["OrderNumber,Date,Customer,Email,Phone,Items,Total,PaymentMethod,PaymentStatus,OrderStatus,Tracking"];
    const rows = orders.map((o) => {
      const itemsStr = o.items.map((i) => `${i.productName} (${i.variantSize} x ${i.quantity})`).join("; ");
      return `"${o.orderNumber}","${new Date(o.createdAt).toISOString()}","${o.guestName}","${o.guestEmail}","${o.guestPhone}","${itemsStr}",${o.total},"${o.paymentMethod}","${o.paymentStatus}","${o.orderStatus}","${o.trackingNumber || ""}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gauchi_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE7DF]">
        <div>
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Order Fulfillment Pipeline
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
            Order Management ({orders.length})
          </h1>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-[#E0DBD0] bg-white text-xs font-medium text-[#0F0F0F] hover:bg-[#FAF8F5] transition-colors rounded-sm"
        >
          <Download className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Export Orders CSV</span>
        </button>
      </div>

      {/* Controls: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by order #, client name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-2.5" />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-1 text-xs">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-sm uppercase tracking-wider text-[10px] font-medium transition-colors ${
                selectedStatus === st
                  ? "bg-[#0F0F0F] text-white"
                  : "bg-white text-[#5A5A5A] border border-[#DDD] hover:bg-[#FAF8F5]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#EBE7DF] rounded-sm overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#EBE7DF] text-[#8C827A] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Order Number</th>
              <th className="p-3">Client</th>
              <th className="p-3">Date</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Courier AWB</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0ECE4]">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                <td className="p-3 font-mono font-semibold text-[#0F0F0F]">
                  {o.orderNumber}
                </td>
                <td className="p-3">
                  <span className="font-medium text-[#0F0F0F] block">{o.guestName}</span>
                  <span className="text-[11px] text-[#7A7A7A]">{o.guestPhone}</span>
                </td>
                <td className="p-3 text-[#5A5A5A]">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="p-3">
                  <span className="text-[#5A5A5A] line-clamp-1">
                    {o.items.map((i) => `${i.productName} (${i.variantSize} × ${i.quantity})`).join(", ")}
                  </span>
                </td>
                <td className="p-3 font-semibold text-[#0F0F0F]">
                  ₹{o.total}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    o.paymentStatus === "PAID"
                      ? "bg-[#EAF5EC] text-[#2A6E3B]"
                      : "bg-[#FAF8F5] text-[#8C827A] border border-[#DDD]"
                  }`}>
                    {o.paymentMethod} • {o.paymentStatus}
                  </span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#C5A059]/40 text-[#0F0F0F] text-[10px] uppercase font-semibold">
                    {o.orderStatus}
                  </span>
                </td>
                <td className="p-3 text-[#5A5A5A] text-[11px]">
                  {o.trackingNumber ? (
                    <span>{o.courierName} • {o.trackingNumber}</span>
                  ) : (
                    <span className="text-[#A39D94] italic">Not Dispatched</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openStatusModal(o)}
                      className="px-2.5 py-1 bg-[#0F0F0F] text-white text-[11px] uppercase tracking-wider rounded-sm hover:bg-[#C5A059] transition-colors"
                    >
                      Update
                    </button>
                    <a
                      href={`/order-confirmation/${o.orderNumber}`}
                      target="_blank"
                      className="p-1 text-[#8C827A] hover:text-[#0F0F0F]"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status & Courier Edit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-sm shadow-2xl p-6 space-y-4 border border-[#EBE7DF]">
            <div className="flex justify-between items-center border-b border-[#EBE7DF] pb-3">
              <div>
                <h3 className="font-serif-luxury text-lg text-[#0F0F0F]">
                  Update Order {selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-[#7A7A7A]">{selectedOrder.guestName} • ₹{selectedOrder.total}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#8C827A] hover:text-[#0F0F0F]">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Order Pipeline Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED (Restores Stock)</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Courier Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. BlueDart Express / Delhivery"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Air Waybill (AWB) Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. BD82736154IN"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#0F0F0F] font-medium mb-1">Internal Note (Private)</label>
                <textarea
                  rows={2}
                  placeholder="Notes visible only to admins..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-[#DDD] text-[#5A5A5A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-[#0F0F0F] text-white uppercase tracking-luxury hover:bg-[#C5A059] disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
