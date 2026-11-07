"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, User, Edit3, Check, X } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const url = search ? `/api/customers?search=${encodeURIComponent(search)}` : "/api/customers";
      const res = await fetch(url);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleSaveNote = async (id: string) => {
    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: id, notes: noteText }),
      });
      if (res.ok) {
        setEditingNoteId(null);
        loadCustomers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    const headers = ["Name,Email,Phone,TotalOrders,TotalSpent,JoinedDate,Notes"];
    const rows = customers.map((c) =>
      `"${c.name}","${c.email}","${c.phone || ""}","${c.totalOrders}",${c.totalSpent},"${new Date(c.createdAt).toISOString()}","${c.notes || ""}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encoded;
    link.download = `gauchi_customers_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE7DF]">
        <div>
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Client Relations
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#0F0F0F]">
            Customer Directory ({customers.length})
          </h1>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-[#E0DBD0] bg-white text-xs font-medium text-[#0F0F0F] hover:bg-[#FAF8F5] transition-colors rounded-sm"
        >
          <Download className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Export Client List</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
        />
        <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-2.5" />
      </div>

      <div className="bg-white border border-[#EBE7DF] rounded-sm overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#EBE7DF] text-[#8C827A] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Lifetime Spend</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Internal VIP / Concierge Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0ECE4]">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                <td className="p-3 font-medium text-[#0F0F0F]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#EBE7DF] flex items-center justify-center text-[#C5A059] font-bold text-[11px]">
                      {c.name.charAt(0)}
                    </div>
                    <span>{c.name}</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-[#0F0F0F] block">{c.email}</span>
                  <span className="text-[#7A7A7A] text-[11px]">{c.phone || "No phone"}</span>
                </td>
                <td className="p-3 font-semibold text-[#0F0F0F]">{c.totalOrders}</td>
                <td className="p-3 font-semibold text-[#2A6E3B]">₹{c.totalSpent.toLocaleString("en-IN")}</td>
                <td className="p-3 text-[#5A5A5A]">
                  {new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="p-3">
                  {editingNoteId === c.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="e.g. VIP oud enthusiast"
                        className="px-2 py-1 text-xs border border-[#C5A059] rounded-sm focus:outline-none"
                      />
                      <button onClick={() => handleSaveNote(c.id)} className="text-green-600">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingNoteId(null)} className="text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <span className="text-[#5A5A5A] italic text-[11px]">
                        {c.notes || "Add VIP note..."}
                      </span>
                      <button
                        onClick={() => {
                          setEditingNoteId(c.id);
                          setNoteText(c.notes || "");
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#8C827A] hover:text-[#0F0F0F]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
