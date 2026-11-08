"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen, wishlist } = useCart();
  const { user, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.logo_url) {
          setLogoUrl(data.settings.logo_url);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Live autocomplete search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.products?.slice(0, 5) || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: "Catalog", href: "/shop" },
    {
      name: "Collections",
      href: "/shop",
      hasDropdown: true,
      items: [
        { name: "Oud Collection", href: "/collections/oud-collection", desc: "Mystical, smokey agarwood resins" },
        { name: "Fresh & Aquatic", href: "/collections/fresh-aquatic", desc: "Oceanic breeze & Italian citrus" },
        { name: "Floral & Fruity", href: "/collections/floral-fruity", desc: "Velvet Grasse rose & wild honey" },
        { name: "Warm & Woody", href: "/collections/warm-woody", desc: "Smoked tobacco, tonka & ambergris" },
        { name: "Discovery Gift Sets", href: "/collections/gift-sets", desc: "Luxury coffret discovery editions" },
      ],
    },
    { name: "The Gauchi Experience", href: "/experience/black-oud-60ml" },
    { name: "Our Story", href: "/story" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#EBE7DF]"
          : "bg-white border-b border-[#F0ECE4]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0F0F0F] hover:text-[#C5A059] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Luxury Brand Logo with Golden Emblem */}
          <div className="flex items-center">
            <Link href="/" className="block">
              <BrandLogo size="md" />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.hasDropdown && setCollectionsOpen(true)}
                onMouseLeave={() => link.hasDropdown && setCollectionsOpen(false)}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 text-xs uppercase tracking-luxury font-medium transition-colors py-2 ${
                    pathname === link.href ? "text-[#C5A059] border-b-2 border-[#C5A059]" : "text-[#1A1A1A] hover:text-[#C5A059]"
                  }`}
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown className="w-3.5 h-3.5 text-[#8C827A]" />}
                </Link>

                {/* Dropdown Menu */}
                {link.hasDropdown && collectionsOpen && (
                  <div className="absolute top-full left-0 w-72 bg-white shadow-xl border border-[#EBE7DF] rounded-sm py-3 px-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {link.items?.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setCollectionsOpen(false)}
                        className="block px-3 py-2.5 rounded-sm hover:bg-[#FAF8F5] transition-colors group"
                      >
                        <div className="text-xs font-semibold text-[#0F0F0F] group-hover:text-[#C5A059]">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[#7A7A7A] mt-0.5">{item.desc}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Trigger */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#1A1A1A] hover:text-[#C5A059] transition-colors"
                aria-label="Search Fragrances"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Modal Dropdown */}
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white shadow-2xl border border-[#EBE7DF] rounded-md p-4 z-50">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      placeholder="Search oud, rose, notes, catalog..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E0DBD0] rounded-sm focus:outline-none focus:border-[#C5A059] text-[#0F0F0F]"
                    />
                    <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
                  </form>

                  {/* Autocomplete Results */}
                  {isSearching && (
                    <div className="py-4 text-center text-xs text-[#8C827A]">Searching fragrances...</div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="mt-3 divide-y divide-[#F0ECE4] max-h-72 overflow-y-auto">
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/shop/${item.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 py-2.5 hover:bg-[#FAF8F5] px-2 rounded-sm transition-colors"
                        >
                          {item.images?.[0]?.url && (
                            <img
                              src={item.images[0].url}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-sm border border-[#EBE7DF]"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-[#0F0F0F] truncate">{item.name}</div>
                            <div className="text-[10px] text-[#C5A059] uppercase tracking-wider">
                              {item.fragranceFamily} • ₹{item.variants?.[0]?.price}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                    <div className="py-3 text-center text-xs text-[#7A7A7A]">
                      No fragrances found for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              href="/account#wishlist"
              className="p-2 text-[#1A1A1A] hover:text-[#C5A059] transition-colors relative hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {mounted && wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C5A059] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Customer Account Link */}
            <div className="relative group">
              <Link
                href={mounted && user ? "/account" : "/login"}
                className="p-2 text-[#1A1A1A] hover:text-[#C5A059] transition-colors flex items-center gap-1.5"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
                {mounted && user && (
                  <span className="text-xs font-medium text-[#1A1A1A] hidden md:inline max-w-[90px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                )}
              </Link>
            </div>

            {/* Shopping Bag Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#0F0F0F] hover:text-[#C5A059] transition-colors relative flex items-center"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0F0F0F] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EBE7DF] bg-white px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <div key={link.name}>
              <Link
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs uppercase tracking-luxury font-medium text-[#0F0F0F]"
              >
                {link.name}
              </Link>
              {link.items && (
                <div className="pl-4 space-y-1.5 border-l border-[#EBE7DF] my-1">
                  {link.items.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs text-[#5A5A5A] hover:text-[#C5A059] py-1"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-4 border-t border-[#F0ECE4] flex justify-between items-center text-xs">
            {mounted && user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-medium text-[#0F0F0F] hover:text-[#C5A059]"
                >
                  My Account ({user.name.split(" ")[0]})
                </Link>
                <button onClick={logout} className="text-[#8C827A] underline hover:text-[#0F0F0F]">
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium text-[#0F0F0F] hover:text-[#C5A059]"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
