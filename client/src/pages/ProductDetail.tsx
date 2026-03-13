import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Star, MapPin, ShoppingCart, Heart, Share2, Shield,
  Truck, Package, ChevronRight, ChevronLeft, ArrowLeft,
  CheckCircle, User, Beef, Bug, Sprout, AlertCircle,
  Info, Minus, Plus, MessageSquare, Warehouse
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import PublicNavbar from "@/components/PublicNavbar";

// ─── Types ─────────────────────────────────────────────────────────────────────
type ProductType = "produce" | "livestock" | "farm-input";

interface ProductData {
  id: number;
  name: string;
  type: ProductType;
  category: string;
  subCategory: string;
  description: string;
  price: number;
  unit: string;
  minOrder: number;
  stock: number;
  location: string;
  seller: string;
  sellerType: "farmer" | "input-supplier";
  sellerSince: string;
  sellerRating: number;
  sellerReviews: number;
  rating: number;
  reviews: number;
  verified: boolean;
  organic: boolean;
  images: string[];
  // Produce-specific
  harvestDate?: string;
  shelfLife?: string;
  storageMethod?: string;
  certifications?: string[];
  // Livestock-specific
  breed?: string;
  age?: string;
  weight?: string;
  healthStatus?: string;
  vaccinationRecord?: string;
  feedType?: string;
  origin?: string;
  // Farm input-specific
  activeIngredient?: string;
  formulation?: string;
  applicationMethod?: string;
  dosageRate?: string;
  safetyInterval?: string;
  registrationNo?: string;
  targetPests?: string[];
  compatibleCrops?: string[];
  storageConditions?: string;
  expiryDate?: string;
}

// ─── Product Database ──────────────────────────────────────────────────────────
const PRODUCTS: ProductData[] = [
  {
    id: 1, type: "produce", category: "Vegetables", subCategory: "Tomatoes",
    name: "Vine Ripened Tomatoes",
    description: "Premium vine-ripened tomatoes grown using sustainable farming practices. Harvested at peak ripeness for maximum flavour and nutritional value. Ideal for fresh consumption, cooking, and processing.",
    price: 25, unit: "kg", minOrder: 1, stock: 500,
    location: "Nairobi, East Africa", seller: "Kwabena Farms", sellerType: "farmer",
    sellerSince: "2019", sellerRating: 4.8, sellerReviews: 124,
    rating: 4.8, reviews: 124, verified: true, organic: true,
    images: [
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1558818498-28c1e002b655?w=600&h=450&fit=crop",
    ],
    harvestDate: "Within 2 days", shelfLife: "7–10 days",
    storageMethod: "Cool, dry place (10–15°C)",
    certifications: ["Organic Certified", "GAP Certified"],
  },
  {
    id: 10, type: "livestock", category: "Poultry", subCategory: "Broiler Chicken",
    name: "Broiler Chickens (Live)",
    description: "Healthy, farm-raised broiler chickens ready for harvest. Raised in a free-range environment with high-quality feed. All birds are vaccinated against Newcastle Disease and Gumboro. Ideal for commercial buyers, restaurants, and processors.",
    price: 45, unit: "bird", minOrder: 10, stock: 500,
    location: "Nairobi, East Africa", seller: "East Africa Poultry Farm", sellerType: "farmer",
    sellerSince: "2017", sellerRating: 4.7, sellerReviews: 93,
    rating: 4.7, reviews: 93, verified: true, organic: false,
    images: [
      "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&h=450&fit=crop",
    ],
    breed: "Ross 308", age: "6 weeks", weight: "2.5–3 kg per bird",
    healthStatus: "Vaccinated & Certified Healthy",
    vaccinationRecord: "Newcastle Disease (Day 7), Gumboro (Day 14), Marek's (Day 1)",
    feedType: "High-protein commercial broiler feed (no hormones)",
    origin: "East Africa Region, Africa",
  },
  {
    id: 17, type: "farm-input", category: "Fertilizers", subCategory: "Compound Fertilizer",
    name: "NPK 15-15-15 Fertilizer",
    description: "Balanced compound fertilizer providing equal proportions of Nitrogen, Phosphorus, and Potassium. Suitable for a wide range of crops including maize, vegetables, and cash crops. Promotes vigorous growth, strong root development, and high yields.",
    price: 180, unit: "50kg bag", minOrder: 2, stock: 1000,
    location: "Accra, Greater Accra", seller: "AgriInputs GH Ltd", sellerType: "input-supplier",
    sellerSince: "2015", sellerRating: 4.8, sellerReviews: 312,
    rating: 4.8, reviews: 312, verified: true, organic: false,
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=450&fit=crop",
    ],
    activeIngredient: "N 15%, P₂O₅ 15%, K₂O 15%",
    formulation: "Granular", applicationMethod: "Soil broadcast or side-dressing",
    dosageRate: "200–400 kg/ha depending on crop and soil analysis",
    safetyInterval: "Apply at least 2 weeks before harvest",
    registrationNo: "GH-PPRSD-F-0042",
    compatibleCrops: ["Maize", "Rice", "Vegetables", "Cocoa", "Cassava", "Plantain"],
    storageConditions: "Store in cool, dry place. Keep away from moisture and direct sunlight.",
    expiryDate: "December 2026",
  },
];

const REVIEWS_DATA = [
  { name: "Kwame A.", rating: 5, date: "Feb 12, 2025", comment: "Absolutely fresh! Arrived the next day and the quality was outstanding. Will definitely order again.", avatar: "KA" },
  { name: "Abena M.", rating: 4, date: "Feb 8, 2025",  comment: "Great product, very good quality. Packaging could be a bit better but the produce itself is top quality.", avatar: "AM" },
  { name: "Kofi B.",  rating: 5, date: "Jan 30, 2025", comment: "Best quality I've found on this platform. The seller was also very responsive when I had a question.", avatar: "KB" },
];

const TYPE_BADGE: Record<ProductType, { label: string; className: string; icon: React.ReactNode }> = {
  "produce":    { label: "Farm Produce",  className: "bg-green-100 text-green-700", icon: <Sprout className="w-3 h-3" /> },
  "livestock":  { label: "Livestock",     className: "bg-amber-100 text-amber-700", icon: <Beef className="w-3 h-3" /> },
  "farm-input": { label: "Farm Input",    className: "bg-blue-100 text-blue-700",   icon: <Bug className="w-3 h-3" /> },
};

export default function ProductDetail() {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "seller">("details");
  const [, navigate] = useLocation();
  const { addItem, totalItems } = useCart();

  // Demo: cycle through product types for demonstration
  const [demoIndex, setDemoIndex] = useState(0);
  const product = PRODUCTS[demoIndex];

  const handleAddToCart = () => {
    addItem({
      id: product.id, name: product.name, farmer: product.seller,
      unit: product.unit, pricePerUnit: product.price,
      image: product.images[0], quantity,
    });
    toast.success(`${product.name} added to cart!`, {
      description: `${quantity} ${product.unit} · $${(product.price * quantity).toLocaleString()}`,
      action: { label: "View Cart", onClick: () => navigate("/cart") },
    });
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id, name: product.name, farmer: product.seller,
      unit: product.unit, pricePerUnit: product.price,
      image: product.images[0], quantity,
    });
    navigate("/checkout");
  };

  // ─── Type-specific detail panel ───────────────────────────────────────────
  const renderTypeDetails = () => {
    if (product.type === "livestock") return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Beef className="w-4 h-4" /> Animal Information
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Breed",         value: product.breed },
              { label: "Age",           value: product.age },
              { label: "Weight",        value: product.weight },
              { label: "Origin",        value: product.origin },
              { label: "Feed Type",     value: product.feedType },
              { label: "Health Status", value: product.healthStatus },
            ].filter(r => r.value).map(row => (
              <div key={row.label}>
                <p className="text-xs text-amber-600 font-medium">{row.label}</p>
                <p className="text-sm text-amber-900 font-semibold">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
        {product.vaccinationRecord && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Vaccination Record
            </h4>
            <p className="text-sm text-green-700">{product.vaccinationRecord}</p>
          </div>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Buyer Notes
          </h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Buyer is responsible for arranging transport</li>
            <li>Health certificate provided on purchase</li>
            <li>Minimum order: {product.minOrder} {product.unit}</li>
            <li>Live animals — inspect before purchase where possible</li>
          </ul>
        </div>
      </div>
    );

    if (product.type === "farm-input") return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Bug className="w-4 h-4" /> Product Specifications
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Active Ingredient",    value: product.activeIngredient, full: true },
              { label: "Formulation",          value: product.formulation },
              { label: "Application Method",   value: product.applicationMethod },
              { label: "Dosage Rate",          value: product.dosageRate, full: true },
              { label: "Pre-harvest Interval", value: product.safetyInterval, full: true },
              { label: "Registration No.",     value: product.registrationNo },
              { label: "Expiry Date",          value: product.expiryDate },
              { label: "Storage Conditions",   value: product.storageConditions, full: true },
            ].filter(r => r.value).map(row => (
              <div key={row.label} className={row.full ? "col-span-2" : ""}>
                <p className="text-xs text-blue-600 font-medium">{row.label}</p>
                <p className="text-sm text-blue-900">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
        {product.targetPests && product.targetPests.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-semibold text-red-800 mb-2">Target Pests / Weeds</h4>
            <div className="flex flex-wrap gap-2">
              {product.targetPests.map(p => (
                <span key={p} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{p}</span>
              ))}
            </div>
          </div>
        )}
        {product.compatibleCrops && product.compatibleCrops.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-semibold text-green-800 mb-2">Compatible Crops</h4>
            <div className="flex flex-wrap gap-2">
              {product.compatibleCrops.map(c => (
                <span key={c} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        )}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Safety Warning
          </h4>
          <p className="text-sm text-yellow-700">
            Keep out of reach of children and animals. Wear protective clothing during application.
            Read label carefully before use. Dispose of empty containers responsibly.
          </p>
        </div>
      </div>
    );

    // Produce
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <Sprout className="w-4 h-4" /> Produce Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Harvest Date",   value: product.harvestDate },
              { label: "Shelf Life",     value: product.shelfLife },
              { label: "Storage Method", value: product.storageMethod },
            ].filter(r => r.value).map(row => (
              <div key={row.label}>
                <p className="text-xs text-green-600 font-medium">{row.label}</p>
                <p className="text-sm text-green-900 font-semibold">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
        {product.certifications && product.certifications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Certifications
            </h4>
            <div className="flex flex-wrap gap-2">
              {product.certifications.map(c => (
                <span key={c} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> {c}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white border rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Product Specifications</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Category",   product.category],
              ["Sub-type",   product.subCategory],
              ["Origin",     product.location],
              ["Min. Order", `${product.minOrder} ${product.unit}`],
              ["In Stock",   `${product.stock} ${product.unit}`],
            ].map(([key, val]) => (
              <div key={key} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="w-1.5 h-1.5 bg-[#E85D04] rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{key}</p>
                  <p className="text-sm font-semibold text-gray-800">{val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const badge = TYPE_BADGE[product.type];

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Demo switcher — for prototype demonstration */}
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium">Demo — view product type:</span>
          {PRODUCTS.map((p, i) => (
            <button key={p.id} onClick={() => { setDemoIndex(i); setActiveImage(0); setQuantity(p.minOrder); }}
              className={`px-3 py-1 rounded-full border transition-all ${demoIndex === i ? "bg-[#E85D04] text-white border-[#E85D04]" : "border-gray-300 hover:border-[#E85D04] text-gray-600"}`}>
              {TYPE_BADGE[p.type].label}
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-[#E85D04]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/marketplace" className="hover:text-[#E85D04]">Marketplace</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium truncate">{product.name}</span>
        </nav>

        <button onClick={() => navigate("/marketplace")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.organic  && <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">ORGANIC</span>}
                {product.verified && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />VERIFIED</span>}
              </div>
              <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${badge.className}`}>
                {badge.icon} {badge.label.toUpperCase()}
              </span>
              {product.images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(i => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button onClick={() => setActiveImage(i => (i + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-[#E85D04]" : "border-transparent hover:border-gray-300"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-[#E85D04] uppercase tracking-wide mb-1">{product.category} · {product.subCategory}</p>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}
                </div>
                <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="bg-orange-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-0.5">Price per {product.unit}</p>
              <p className="text-4xl font-black text-[#E85D04]">${product.price.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-[#E85D04]" />{product.location}
            </div>

            {/* Livestock quick stats */}
            {product.type === "livestock" && (
              <div className="grid grid-cols-3 gap-2">
                {[{ l: "Breed", v: product.breed }, { l: "Age", v: product.age }, { l: "Weight", v: product.weight }]
                  .filter(r => r.v).map(r => (
                  <div key={r.l} className="bg-amber-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-amber-500">{r.l}</p>
                    <p className="text-xs font-semibold text-amber-800">{r.v}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Farm input quick stats */}
            {product.type === "farm-input" && (
              <div className="grid grid-cols-2 gap-2">
                {[{ l: "Formulation", v: product.formulation }, { l: "Reg. No.", v: product.registrationNo }]
                  .filter(r => r.v).map(r => (
                  <div key={r.l} className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-blue-500">{r.l}</p>
                    <p className="text-xs font-semibold text-blue-800">{r.v}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {/* Quantity + CTA */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Qty ({product.unit}):</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(product.minOrder, q - 1))}
                    className="px-3 py-2.5 text-gray-600 hover:bg-gray-50 font-bold">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2.5 text-sm font-bold text-gray-900 min-w-[2.5rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2.5 text-gray-600 hover:bg-gray-50 font-bold">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">Min: {product.minOrder}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <Info className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-orange-700 font-medium">
                  Total: ${(product.price * quantity).toLocaleString()} for {quantity} {product.unit}
                </span>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddToCart} className="flex-1 bg-[#E85D04] hover:bg-[#d14e00] text-white py-3.5 rounded-xl font-bold">
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
                <Button onClick={handleBuyNow} variant="outline" className="flex-1 border-2 border-[#E85D04] text-[#E85D04] hover:bg-orange-50 py-3.5 rounded-xl font-bold">
                  Buy Now
                </Button>
                <button onClick={() => setWishlisted(w => !w)}
                  className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-colors ${wishlisted ? "bg-red-50 border-red-300" : "hover:bg-gray-50 border-gray-200"}`}>
                  <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                </button>
                <button className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Service badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
              {[
                { Icon: Truck,     label: "Logistics Available",  sub: "Book a partner" },
                { Icon: Warehouse, label: "Storage Available",    sub: "Book a facility" },
                { Icon: Package,   label: "Secure Packaging",     sub: "Fresh guarantee" },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-xl">
                  <Icon className="w-4 h-4 text-[#E85D04] mb-1" />
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border overflow-hidden mb-10">
          <div className="flex border-b">
            {(["details", "reviews", "seller"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "border-b-2 border-[#E85D04] text-[#E85D04]" : "text-gray-500 hover:text-gray-700"}`}>
                {tab === "details" ? "Product Details" : tab === "reviews" ? `Reviews (${product.reviews})` : "Seller Info"}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "details" && renderTypeDetails()}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-5xl font-black text-gray-900">{product.rating}</p>
                    <div className="flex justify-center gap-0.5 my-1">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}
                    </div>
                    <p className="text-sm text-gray-500">{product.reviews} reviews</p>
                  </div>
                </div>
                {REVIEWS_DATA.map((r, i) => (
                  <div key={i} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#E85D04] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{r.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-gray-800">{r.name}</p>
                          <p className="text-xs text-gray-400">{r.date}</p>
                        </div>
                        <div className="flex gap-0.5 my-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}
                        </div>
                        <p className="text-sm text-gray-600">{r.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "seller" && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#E85D04] text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {product.seller.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{product.seller}</h3>
                    <p className="text-sm text-gray-500">
                      {product.sellerType === "input-supplier" ? "Farm Input Supplier" : "Farmer"} · Member since {product.sellerSince}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.sellerRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />)}
                      </div>
                      <span className="text-sm font-medium">{product.sellerRating}</span>
                      <span className="text-sm text-gray-400">({product.sellerReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />{product.location}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Link href="/messages" className="flex-1">
                    <Button variant="outline" className="w-full border-[#E85D04] text-[#E85D04] hover:bg-orange-50">
                      <MessageSquare className="w-4 h-4 mr-2" /> Message Seller
                    </Button>
                  </Link>
                  <Button variant="outline" className="flex-1" onClick={() => toast.info("Feature coming soon")}>View All Listings</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
