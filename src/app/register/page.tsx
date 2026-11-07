"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await register(name, email, password, phone);
    if (res.success) {
      router.push("/account");
    } else {
      setError(res.error || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-widest-luxury text-[#C5A059] font-semibold">
          Create Account
        </span>
        <h1 className="font-serif-luxury text-3xl text-[#0F0F0F]">Register With Gauchi</h1>
        <p className="text-xs text-[#7A7A7A]">
          Join the Gauchi circle to save your orders and receive luxury member privileges.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-[#FDECEC] border border-[#A82222]/30 text-[#A82222] text-xs rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-[#0F0F0F] font-medium mb-1">Full Name *</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rohan Varma"
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
            />
            <User className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-[#0F0F0F] font-medium mb-1">Email Address *</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rohan@example.com"
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
            />
            <Mail className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-[#0F0F0F] font-medium mb-1">Phone Number (Optional)</label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98112 23344"
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
            />
            <Phone className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-[#0F0F0F] font-medium mb-1">Password *</label>
          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD] rounded-sm focus:border-[#C5A059] focus:outline-none"
            />
            <Lock className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#0F0F0F] text-white text-xs uppercase tracking-luxury font-medium hover:bg-[#C5A059] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{loading ? "Creating Account..." : "Create Account"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="pt-4 border-t border-[#EBE7DF] text-center text-xs text-[#5A5A5A]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#0F0F0F] font-medium underline hover:text-[#C5A059]">
          Sign in here
        </Link>
      </div>
    </div>
  );
}
