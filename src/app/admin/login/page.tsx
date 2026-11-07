"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@gauchi.com");
  const [password, setPassword] = useState("GauchiAdmin@2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(email, password);
    if (res.success) {
      if (res.user?.role !== "ADMIN") {
        setError("Access denied: You do not possess administrator credentials.");
        setLoading(false);
        return;
      }
      router.push("/admin");
    } else {
      setError(res.error || "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#EBE7DF] rounded-sm p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/images/gauchi-gold-logo.png"
            alt="Gauchi Emblem"
            className="w-12 h-auto object-contain mx-auto mb-2"
          />
          <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
            Administrative Console
          </span>
          <h1 className="font-serif-luxury text-2xl text-[#0F0F0F]">Gauchi Headquarters</h1>
          <p className="text-xs text-[#7A7A7A]">
            Restricted to authorized brand administrators & management.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#FDECEC] border border-[#A82222]/30 text-[#A82222] text-xs rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#0F0F0F] font-medium mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none text-[#0F0F0F]"
              />
              <Mail className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[#0F0F0F] font-medium mb-1">Master Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none text-[#0F0F0F]"
              />
              <Lock className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Verifying Credentials..." : "Access Admin Portal"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#EBE7DF] text-center text-[11px] text-[#8C827A]">
          Demo Admin Credentials: <br />
          <span className="font-mono text-[#0F0F0F]">admin@gauchi.com</span> / <span className="font-mono text-[#0F0F0F]">GauchiAdmin@2026</span>
        </div>
      </div>
    </div>
  );
}
