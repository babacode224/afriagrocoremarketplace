import { Link } from "wouter";
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";

interface FooterProps {
  variant?: "default" | "minimal";
}

export default function Footer({ variant = "default" }: FooterProps) {
  if (variant === "minimal") {
    return (
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2024 AfriAgroCore. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</Link>
            <Link href="/cookies" className="text-sm text-gray-500 hover:text-gray-700">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E85D04] rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <span className="font-bold text-gray-900 text-lg">AfriAgroCore</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              The leading digital marketplace for African agriculture, empowering farmers and providing consumers with the freshest produce.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#E85D04] hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#E85D04] hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#E85D04] hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Marketplace</h4>
            <ul className="space-y-2">
              <li><Link href="/marketplace" className="text-sm text-gray-500 hover:text-[#E85D04] transition-colors">All Products</Link></li>
              <li><Link href="/marketplace/vegetables" className="text-sm text-gray-500 hover:text-[#E85D04] transition-colors">Vegetables</Link></li>
              <li><Link href="/marketplace/fruits" className="text-sm text-gray-500 hover:text-[#E85D04] transition-colors">Fruits &amp; Berries</Link></li>
              <li><Link href="/marketplace/grains" className="text-sm text-gray-500 hover:text-[#E85D04] transition-colors">Grains &amp; Legumes</Link></li>
              <li><Link href="/marketplace/organic" className="text-sm text-gray-500 hover:text-[#E85D04] transition-colors">Organic Certified</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-[#E85D04] transition-colors">About Us</Link></li>
              <li><Link href="/how-it-works" className="text-sm text-gray-500 hover:text-[#E85D04] transition-colors">How It Works</Link></li>
              <li><Link href="/for-farmers" className="text-sm text-gray-500 hover:text-[#E85D04] transition-colors">For Farmers</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-[#E85D04] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-[#E85D04] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E85D04] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-500">123 Harvest Ave, Tech City, Africa</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E85D04] shrink-0" />
                <span className="text-sm text-gray-500">+233 (0) 50 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E85D04] shrink-0" />
                <span className="text-sm text-gray-500">support@afriagrocore.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2024 AfriAgroCore Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center text-gray-500">VISA</div>
            <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center text-gray-500">MC</div>
            <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center text-gray-500">MTN</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
