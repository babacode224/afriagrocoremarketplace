import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface PublicNavbarProps {
  variant?: "default" | "marketplace";
}

export default function PublicNavbar({ variant = "default" }: PublicNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();
  const { totalItems } = useCart();

  if (variant === "marketplace") {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#E85D04] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M12 2C8 2 4 5 4 9c0 2 1 4 2 5l6 8 6-8c1-1 2-3 2-5 0-4-4-7-8-7zm0 9a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">AfriAgroCore</span>
          </Link>

          {/* Category Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/marketplace/vegetables" className="text-sm font-medium text-gray-700 hover:text-[#E85D04] transition-colors">Vegetables</Link>
            <Link href="/marketplace/fruits" className="text-sm font-medium text-gray-700 hover:text-[#E85D04] transition-colors">Fruits</Link>
            <Link href="/marketplace/grains" className="text-sm font-medium text-gray-700 hover:text-[#E85D04] transition-colors">Grains</Link>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input
                type="text"
                placeholder="Search fresh produce..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="ml-auto flex items-center gap-3">
            <button
              className="relative p-2 text-gray-600 hover:text-[#E85D04] transition-colors"
              onClick={() => navigate("/cart")}
              aria-label={`Cart (${totalItems} items)`}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E85D04] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/signin")}
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <Button
              onClick={() => navigate("/signup")}
              className="bg-[#E85D04] hover:bg-[#d14e00] text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Sign Up
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  // Default variant — used on the main landing page
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-[#E85D04] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">AfriAgroCore</span>
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-8 mx-auto">
          <Link href="/marketplace" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Marketplace</Link>
          <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">About Us</Link>
          <Link href="/support" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Support</Link>
        </div>

        {/* Right Actions — Sign In + Sign Up prominently displayed */}
        <div className="ml-auto flex items-center gap-2">
          {/* Cart icon */}
          <button
            className="relative p-2 text-gray-600 hover:text-[#E85D04] transition-colors mr-1"
            onClick={() => navigate("/cart")}
            aria-label={`Cart (${totalItems} items)`}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E85D04] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          {/* Sign In button */}
          <button
            onClick={() => navigate("/signin")}
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-[#E85D04] border border-gray-200 hover:border-[#E85D04] px-4 py-2 rounded-lg transition-all"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>

          {/* Sign Up button — primary CTA */}
          <Button
            onClick={() => navigate("/signup")}
            className="bg-[#E85D04] hover:bg-[#d14e00] text-white rounded-lg px-5 py-2 text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </Button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 ml-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/marketplace" className="block text-sm font-medium text-gray-700 py-2">Marketplace</Link>
          <Link href="/about" className="block text-sm font-medium text-gray-700 py-2">About Us</Link>
          <Link href="/support" className="block text-sm font-medium text-gray-700 py-2">Support</Link>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { navigate("/signin"); setMobileOpen(false); }}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <Button
              onClick={() => { navigate("/signup"); setMobileOpen(false); }}
              className="flex-1 bg-[#E85D04] hover:bg-[#d14e00] text-white flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Sign Up
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
