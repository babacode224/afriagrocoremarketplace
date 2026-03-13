import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

const ROLES = [
  {
    id: "farmer",
    title: "Farmer",
    description:
      "Access premium seeds, real-time market pricing data, and specialized financial support to maximize your seasonal crop yield and profitability.",
    cta: "Sign Up as Farmer",
    href: "/signup?role=farmer",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M12 2C8 2 4 5 4 9c0 2 1 4 2 5l6 8 6-8c1-1 2-3 2-5 0-4-4-7-8-7zm0 9a2 2 0 110-4 2 2 0 010 4z"/>
      </svg>
    ),
    iconBg: "bg-[#E85D04]",
  },
  {
    id: "logistics",
    title: "Logistics Partner",
    description:
      "Optimize your fleet routes with our dispatch engine and connect directly with farmers needing reliable transport for their harvests.",
    cta: "Register Fleet",
    href: "/signup?role=logistics",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=300&fit=crop",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-1.5 1.5l1.96 2.5H17V9.5h1.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm13 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
      </svg>
    ),
    iconBg: "bg-[#E85D04]",
  },
  {
    id: "storage",
    title: "Storage Facility",
    description:
      "List your warehouse capacity and manage seasonal inventory with our integrated smart-tracking and climate-monitoring system.",
    cta: "List Facility",
    href: "/signup?role=storage",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
    iconBg: "bg-[#E85D04]",
  },
  {
    id: "buyer",
    title: "Buyer",
    description:
      "Source fresh, quality produce directly from verified farmers. Perfect for households, restaurants, and wholesalers looking for fair prices.",
    cta: "Sign Up to Buy",
    href: "/signup?role=buyer",
    image: null,
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 9 18h12v-2H9.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.45 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
      </svg>
    ),
    iconBg: "bg-[#E85D04]",
  },
];

export default function GetStarted() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-['Inter',sans-serif]">
      <PublicNavbar variant="default" />

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-orange-100 text-[#E85D04] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            Empowering African Agriculture
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Join our Growing Network
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            Select your role below to access specialized tools, markets, and quality produce tailored to your agricultural and business needs.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ROLES.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 bg-gray-200">
                {role.image ? (
                  <img
                    src={role.image}
                    alt={role.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                    300×300
                  </div>
                )}
                <div className={`absolute bottom-3 left-3 w-9 h-9 ${role.iconBg} rounded-lg flex items-center justify-center shadow`}>
                  {role.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">
                  {role.description}
                </p>
                <button
                  onClick={() => navigate(role.href)}
                  className="w-full flex items-center justify-center gap-2 bg-[#E85D04] hover:bg-[#d14e00] text-white font-semibold text-sm py-3 px-4 rounded-xl transition-colors"
                >
                  {role.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-gray-600 text-sm max-w-lg mx-auto mb-2">
            Select your role below to access specialized tools, markets, and quality produce tailored to your agricultural and business needs.
          </p>
          <button
            onClick={() => navigate("/support")}
            className="text-[#E85D04] font-semibold text-sm hover:underline"
          >
            Contact our partnership advisors
          </button>
        </div>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
