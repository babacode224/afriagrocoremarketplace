import { Link, useLocation } from "wouter";
import { ShoppingCart, Heart, Star, Search, ChevronRight, Truck, ShoppingBag, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const CATEGORIES = [
  { name: "Organic", icon: "🌿" },
  { name: "Vegetables", icon: "🥬" },
  { name: "Fruits", icon: "🍊" },
  { name: "Grains", icon: "🌾" },
  { name: "Tubers", icon: "🥔" },
  { name: "Spices", icon: "🌶️" },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Fresh Vine Tomatoes",
    price: "$50",
    unit: "kg",
    seller: "Farmer Kofi",
    rating: 4.8,
    reviews: 129,
    badge: "IN STOCK",
    image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Organic Yellow Maize",
    price: "$35",
    unit: "kg",
    seller: "Mama Akua",
    rating: 4.5,
    reviews: 85,
    badge: "IN STOCK",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Premium Puna Yams",
    price: "$85",
    unit: "net",
    seller: "Uncle Yao",
    rating: 4.9,
    reviews: 210,
    badge: "IN STOCK",
    image: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Sweet MD2 Pineapples",
    price: "$15",
    unit: "pc",
    seller: "Sister Ama",
    rating: 4.7,
    reviews: 56,
    badge: "IN STOCK",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=300&fit=crop",
  },
];

const HOW_IT_WORKS = [
  {
    icon: <Search className="w-6 h-6 text-white" />,
    step: "1. Browse Products",
    desc: "Explore thousands of fresh products directly from local farms.",
  },
  {
    icon: <ShoppingBag className="w-6 h-6 text-white" />,
    step: "2. Add to Cart",
    desc: "Choose your items and specify quantities needed for your home or business.",
  },
  {
    icon: <CreditCard className="w-6 h-6 text-white" />,
    step: "3. Secure Payment",
    desc: "Pay securely via Mobile Money, Card or Bank Transfer on our platform.",
  },
  {
    icon: <Truck className="w-6 h-6 text-white" />,
    step: "4. Direct Delivery",
    desc: "Receive your fresh produce directly from the farm to your specified location.",
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const { addItem } = useCart();

  const handleAddToCart = (product: typeof PRODUCTS[0]) => {
    const priceNum = parseFloat(product.price.replace("$", "").replace(" USD", ""));
    addItem({ id: product.id, name: product.name, farmer: product.seller, unit: product.unit, pricePerUnit: priceNum, image: product.image });
    toast.success(`${product.name} added to cart!`, {
      action: { label: "View Cart", onClick: () => navigate("/cart") },
    });
  };

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      <PublicNavbar variant="marketplace" />

      {/* Hero Section */}
      <section className="relative min-h-[480px] flex items-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031913152/RIDVlHEJVKRsvttE.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <p className="text-[#E85D04] text-xs font-bold tracking-widest uppercase mb-3">Direct From Source</p>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Fresh From <span className="text-[#E85D04]">Farm</span>
            <br />To Your Table
          </h1>
          <p className="text-gray-200 text-sm md:text-base max-w-sm mb-8 leading-relaxed">
            Connecting you directly with local farmers across the continent. Get the freshest harvest at fair prices today.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={() => navigate("/marketplace")}
              className="bg-[#E85D04] hover:bg-[#d14e00] text-white px-6 py-3 rounded-lg font-semibold"
            >
              Shop Now
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/how-it-works")}
              className="border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3 rounded-lg font-semibold bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Featured Categories</h2>
          <Link href="/marketplace" className="text-sm text-[#E85D04] font-medium flex items-center gap-1 hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/marketplace/${cat.name.toLowerCase()}`}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-2xl group-hover:bg-orange-100 transition-colors border border-orange-100">
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-[#E85D04] transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Fresh Harvest */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Fresh Harvest</h2>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </button>
            <span className="text-sm text-gray-500">Latest Harvest</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {product.badge}
                </span>
                <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors">
                  <Heart className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{product.name}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-600">{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center text-[8px]">👨‍🌾</div>
                  <span className="text-xs text-gray-500">Sold by {product.seller}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#E85D04] font-bold text-sm">
                    {product.price}<span className="text-xs font-normal text-gray-400">/{product.unit}</span>
                  </span>
                  <button
                    className="w-7 h-7 bg-[#E85D04] rounded-full flex items-center justify-center hover:bg-[#d14e00] transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/marketplace")}
            className="border-[#E85D04] text-[#E85D04] hover:bg-orange-50 px-8 py-2 rounded-lg font-medium"
          >
            Load More Products
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How It Works for Buyers</h2>
            <p className="text-gray-500 text-sm">Get farm-fresh produce delivered to your doorstep in 4 simple steps.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-[#E85D04] rounded-xl flex items-center justify-center shadow-md">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{item.step}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download CTA */}
      <section className="bg-[#E85D04] py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white space-y-4 max-w-md">
            <h2 className="text-2xl font-bold">Shop on the Go!</h2>
            <p className="text-orange-100 text-sm leading-relaxed">
              Download the AfriAgroCore mobile app for a faster shopping experience and exclusive farm-direct deals.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                App Store
              </button>
              <button className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76c.3.17.67.19 1.01.04L14.76 12 3.18.2C2.84.05 2.47.07 2.17.24 1.57.58 1.2 1.23 1.2 2v20c0 .77.37 1.42.98 1.76zM16.44 13.68L5.96 23.16l9.12-5.28 1.36-4.2zm.36-3.36L5.96.84l9.12 5.28 1.72-5.28 1.36 4.2-1.36 5.28zM21.6 10.56c-.36-.2-.8-.2-1.16 0l-2.84 1.64L16.44 12l1.16.8 2.84 1.64c.36.2.8.2 1.16 0 .36-.2.6-.56.6-.96v-2.96c0-.4-.24-.76-.6-.96z"/>
                </svg>
                Play Store
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-48 h-80 bg-orange-400 rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="w-40 h-72 bg-white rounded-2xl flex items-center justify-center text-gray-400 text-xs text-center p-4">
                <span>AfriAgroCore<br/>Mobile App<br/>Preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
