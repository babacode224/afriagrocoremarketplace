import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import {
  Search, ShoppingCart, Star, MapPin, ChevronDown,
  ChevronLeft, ChevronRight, SlidersHorizontal, X, Filter,
  Shield, Leaf, Heart, Grid3X3, List, Beef, Bug, Tractor, Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import PublicNavbar from "@/components/PublicNavbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProductType = "produce" | "livestock" | "farm-input";

interface Product {
  id: number;
  name: string;
  type: ProductType;
  category: string;
  subCategory: string;
  price: number;
  unit: string;
  minOrder: number;
  location: string;
  region: string;
  seller: string;
  sellerType: "farmer" | "input-supplier";
  rating: number;
  reviews: number;
  verified: boolean;
  organic: boolean;
  image: string;
  stock: number;
  // Livestock-specific
  breed?: string;
  age?: string;
  weight?: string;
  healthStatus?: string;
  // Farm input-specific
  activeIngredient?: string;
  formulation?: string;
  applicationMethod?: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const ALL_PRODUCTS: Product[] = [
  // PRODUCE
  { id: 1,  name: "Vine Ripened Tomatoes",    type: "produce",    category: "Vegetables",      subCategory: "Tomatoes",           price: 25,   unit: "kg",       minOrder: 5,  location: "Nairobi, East Africa",         region: "East Africa",      seller: "Kwabena Farms",         sellerType: "farmer",         rating: 4.8, reviews: 124, verified: true,  organic: true,  image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop",   stock: 500  },
  { id: 2,  name: "Organic Baby Carrots",     type: "produce",    category: "Vegetables",      subCategory: "Root Vegetables",    price: 12,   unit: "bunch",    minOrder: 3,  location: "Accra, Greater Accra",    region: "Greater Accra",seller: "Green Valley Farm",     sellerType: "farmer",         rating: 4.9, reviews: 201, verified: true,  organic: true,  image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop",   stock: 150  },
  { id: 3,  name: "Fresh Bell Peppers",       type: "produce",    category: "Vegetables",      subCategory: "Peppers",            price: 18,   unit: "box",      minOrder: 2,  location: "Tamale, Northern",        region: "Northern",     seller: "Northern Farms",        sellerType: "farmer",         rating: 4.6, reviews: 85,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop",   stock: 200  },
  { id: 4,  name: "Fresh Plantain (Unripe)",  type: "produce",    category: "Fruits",          subCategory: "Plantain",           price: 8,    unit: "bunch",    minOrder: 5,  location: "Cape Coast, Central",     region: "Central",      seller: "Coastal Farms Ltd",     sellerType: "farmer",         rating: 4.5, reviews: 67,  verified: false, organic: false, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop",   stock: 300  },
  { id: 5,  name: "Sweet Mangoes",            type: "produce",    category: "Fruits",          subCategory: "Mangoes",            price: 30,   unit: "crate",    minOrder: 1,  location: "Accra, Greater Accra",    region: "Greater Accra",seller: "Tropical Fruits GH",    sellerType: "farmer",         rating: 4.9, reviews: 120, verified: true,  organic: false, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop",   stock: 400  },
  { id: 6,  name: "Cocoa Beans (Grade A)",    type: "produce",    category: "Cash Crops",      subCategory: "Cocoa",              price: 85,   unit: "kg",       minOrder: 50, location: "Sunyani, Bono",           region: "Bono",         seller: "Bono Cocoa Cooperative",sellerType: "farmer",         rating: 4.7, reviews: 45,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=300&fit=crop",   stock: 2000 },
  { id: 7,  name: "Maize (Dried)",            type: "produce",    category: "Grains & Cereals",subCategory: "Maize",              price: 5,    unit: "kg",       minOrder: 100,location: "Wa, Upper West",          region: "Upper West",   seller: "Northern Grains Co.",   sellerType: "farmer",         rating: 4.4, reviews: 112, verified: true,  organic: false, image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop",   stock: 10000},
  { id: 8,  name: "Fresh Cassava",            type: "produce",    category: "Tubers",          subCategory: "Cassava",            price: 4,    unit: "kg",       minOrder: 20, location: "Ho, Volta",               region: "Volta",        seller: "Volta Roots Farm",      sellerType: "farmer",         rating: 4.6, reviews: 77,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=400&h=300&fit=crop",   stock: 5000 },
  { id: 9,  name: "Fresh Okra",               type: "produce",    category: "Vegetables",      subCategory: "Okra",               price: 10,   unit: "kg",       minOrder: 2,  location: "Accra, Greater Accra",    region: "Greater Accra",seller: "Urban Agro GH",         sellerType: "farmer",         rating: 4.3, reviews: 38,  verified: false, organic: true,  image: "https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400&h=300&fit=crop",   stock: 80   },
  // LIVESTOCK
  { id: 10, name: "Broiler Chickens (Live)",  type: "livestock",  category: "Poultry",         subCategory: "Broiler",            price: 45,   unit: "bird",     minOrder: 10, location: "Nairobi, East Africa",         region: "East Africa",      seller: "East Africa Poultry Farm",  sellerType: "farmer",         rating: 4.7, reviews: 93,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop",   stock: 500,  breed: "Ross 308",         age: "6 weeks",   weight: "2.5–3 kg",    healthStatus: "Vaccinated"     },
  { id: 11, name: "Friesian Dairy Cow",       type: "livestock",  category: "Cattle",          subCategory: "Dairy Cattle",       price: 3500, unit: "head",     minOrder: 1,  location: "Tamale, Northern",        region: "Northern",     seller: "Northern Livestock Ltd",sellerType: "farmer",         rating: 4.5, reviews: 22,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop",   stock: 12,   breed: "Friesian",         age: "3 years",   weight: "450–500 kg",  healthStatus: "Certified Healthy"},
  { id: 12, name: "Tilapia Fish (Live)",      type: "livestock",  category: "Aquaculture",     subCategory: "Tilapia",            price: 18,   unit: "kg",       minOrder: 10, location: "Volta Lake, Volta",       region: "Volta",        seller: "Volta Aqua Farms",      sellerType: "farmer",         rating: 4.8, reviews: 156, verified: true,  organic: false, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",   stock: 2000, breed: "Nile Tilapia",     age: "5 months",  weight: "300–500 g",   healthStatus: "Disease-Free"   },
  { id: 13, name: "WAD Goats",                type: "livestock",  category: "Small Ruminants", subCategory: "Goats",              price: 450,  unit: "head",     minOrder: 2,  location: "Bolgatanga, Upper East",  region: "Upper East",   seller: "Savanna Livestock Co.", sellerType: "farmer",         rating: 4.4, reviews: 31,  verified: false, organic: false, image: "https://images.unsplash.com/photo-1533318087102-b3ad366ed041?w=400&h=300&fit=crop",   stock: 35,   breed: "WAD",              age: "8 months",  weight: "15–20 kg",    healthStatus: "Vaccinated"     },
  { id: 14, name: "Rabbits (Meat Breed)",     type: "livestock",  category: "Small Animals",   subCategory: "Rabbits",            price: 80,   unit: "pair",     minOrder: 2,  location: "Accra, Greater Accra",    region: "Greater Accra",seller: "Urban Rabbit Farm",     sellerType: "farmer",         rating: 4.6, reviews: 48,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop",   stock: 60,   breed: "New Zealand White",age: "3 months",  weight: "2–2.5 kg",    healthStatus: "Healthy"        },
  { id: 15, name: "Large White Pigs",         type: "livestock",  category: "Swine",           subCategory: "Pigs",               price: 1200, unit: "head",     minOrder: 1,  location: "Sunyani, Bono",           region: "Bono",         seller: "Bono Pig Farm",         sellerType: "farmer",         rating: 4.3, reviews: 17,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=300&fit=crop",   stock: 20,   breed: "Large White",      age: "6 months",  weight: "80–100 kg",   healthStatus: "Vaccinated"     },
  { id: 16, name: "Catfish (Clarias)",        type: "livestock",  category: "Aquaculture",     subCategory: "Catfish",            price: 22,   unit: "kg",       minOrder: 5,  location: "Nairobi, East Africa",         region: "East Africa",      seller: "East Africa Fish Farm",     sellerType: "farmer",         rating: 4.7, reviews: 84,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",   stock: 800,  breed: "African Catfish",  age: "4 months",  weight: "500–800 g",   healthStatus: "Disease-Free"   },
  // FARM INPUTS
  { id: 17, name: "NPK 15-15-15 Fertilizer", type: "farm-input", category: "Fertilizers",     subCategory: "Compound Fertilizer",price: 180,  unit: "50kg bag", minOrder: 2,  location: "Accra, Greater Accra",    region: "Greater Accra",seller: "AgriInputs GH Ltd",     sellerType: "input-supplier", rating: 4.8, reviews: 312, verified: true,  organic: false, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",   stock: 1000, activeIngredient: "N15% P15% K15%",      formulation: "Granular",              applicationMethod: "Soil broadcast"       },
  { id: 18, name: "Urea Fertilizer (46% N)", type: "farm-input", category: "Fertilizers",     subCategory: "Nitrogen Fertilizer", price: 165,  unit: "50kg bag", minOrder: 2,  location: "Nairobi, East Africa",         region: "East Africa",      seller: "FarmChem Supplies",     sellerType: "input-supplier", rating: 4.6, reviews: 189, verified: true,  organic: false, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",   stock: 2000, activeIngredient: "Urea 46% N",          formulation: "Granular",              applicationMethod: "Top dressing"         },
  { id: 19, name: "Glyphosate Herbicide",    type: "farm-input", category: "Herbicides",      subCategory: "Non-selective",       price: 45,   unit: "litre",    minOrder: 5,  location: "Tamale, Northern",        region: "Northern",     seller: "Northern AgriChem",     sellerType: "input-supplier", rating: 4.5, reviews: 97,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",   stock: 500,  activeIngredient: "Glyphosate 480 g/L",  formulation: "Soluble Liquid (SL)",   applicationMethod: "Foliar spray"         },
  { id: 20, name: "Cypermethrin Insecticide",type: "farm-input", category: "Pesticides",      subCategory: "Insecticide",         price: 38,   unit: "litre",    minOrder: 3,  location: "Accra, Greater Accra",    region: "Greater Accra",seller: "AgriInputs GH Ltd",     sellerType: "input-supplier", rating: 4.4, reviews: 73,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",   stock: 300,  activeIngredient: "Cypermethrin 100 g/L",formulation: "Emulsifiable Conc. (EC)",applicationMethod: "Foliar spray"         },
  { id: 21, name: "Mancozeb Fungicide 80 WP",type: "farm-input", category: "Fungicides",      subCategory: "Broad-spectrum",      price: 55,   unit: "kg",       minOrder: 2,  location: "Cape Coast, Central",     region: "Central",      seller: "Central Farm Supplies", sellerType: "input-supplier", rating: 4.7, reviews: 61,  verified: true,  organic: false, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",   stock: 400,  activeIngredient: "Mancozeb 80%",        formulation: "Wettable Powder (WP)",  applicationMethod: "Foliar spray"         },
  { id: 22, name: "Organic Compost (Cert.)", type: "farm-input", category: "Organic Inputs",  subCategory: "Compost",             price: 25,   unit: "25kg bag", minOrder: 10, location: "Nairobi, East Africa",         region: "East Africa",      seller: "GreenGrow Organics",    sellerType: "input-supplier", rating: 4.9, reviews: 145, verified: true,  organic: true,  image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",   stock: 5000, activeIngredient: "Decomposed organic matter", formulation: "Granular",           applicationMethod: "Soil incorporation"   },
  { id: 23, name: "Poultry Manure (Pellets)",type: "farm-input", category: "Organic Inputs",  subCategory: "Manure",              price: 15,   unit: "25kg bag", minOrder: 20, location: "Accra, Greater Accra",    region: "Greater Accra",seller: "EcoFarm Inputs",        sellerType: "input-supplier", rating: 4.5, reviews: 88,  verified: false, organic: true,  image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",   stock: 8000, activeIngredient: "Organic N, P, K",     formulation: "Pellets",               applicationMethod: "Soil broadcast"       },
];

// ─── Category Config ───────────────────────────────────────────────────────────
const TOP_TABS = [
  { key: "all",        label: "All Products",  icon: Grid3X3, color: "text-orange-600" },
  { key: "produce",    label: "Farm Produce",  icon: Sprout,  color: "text-green-600"  },
  { key: "livestock",  label: "Livestock",     icon: Beef,    color: "text-amber-600"  },
  { key: "farm-input", label: "Farm Inputs",   icon: Bug,     color: "text-blue-600"   },
];

const SUBCATEGORIES: Record<string, string[]> = {
  produce:    ["All", "Vegetables", "Fruits", "Tubers", "Grains & Cereals", "Cash Crops", "Legumes", "Spices & Herbs"],
  livestock:  ["All", "Cattle", "Poultry", "Aquaculture", "Small Ruminants", "Swine", "Small Animals"],
  "farm-input": ["All", "Fertilizers", "Pesticides", "Herbicides", "Fungicides", "Organic Inputs", "Seeds"],
};

const REGIONS = ["All Regions", "Greater Accra", "East Africa", "Northern", "Central", "Volta", "Bono", "Upper East", "Upper West", "Eastern", "Western"];

const SELLER_TYPE_LABELS: Record<string, string> = { farmer: "Farmer", "input-supplier": "Input Supplier" };
const SELLER_TYPE_COLORS: Record<string, string> = { farmer: "bg-green-100 text-green-700", "input-supplier": "bg-blue-100 text-blue-700" };

export default function ProductListing() {
  const [, navigate] = useLocation();
  const { addItem, totalItems } = useCart();

  const [activeType, setActiveType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [subCategory, setSubCategory] = useState("All");
  const [region, setRegion] = useState("All Regions");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const PAGE_SIZE = 12;

  const subCats = activeType !== "all" ? (SUBCATEGORIES[activeType] ?? ["All"]) : ["All"];

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setSubCategory("All");
    setPage(1);
  };

  const filtered = useMemo(() => {
    let items = [...ALL_PRODUCTS];
    if (activeType !== "all") items = items.filter(p => p.type === activeType);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (subCategory !== "All") items = items.filter(p => p.category === subCategory || p.subCategory === subCategory);
    if (region !== "All Regions") items = items.filter(p => p.region === region);
    if (priceMin) items = items.filter(p => p.price >= Number(priceMin));
    if (priceMax) items = items.filter(p => p.price <= Number(priceMax));
    if (verifiedOnly) items = items.filter(p => p.verified);
    if (organicOnly) items = items.filter(p => p.organic);
    if (minRating > 0) items = items.filter(p => p.rating >= minRating);
    switch (sortBy) {
      case "price-asc":  items.sort((a, b) => a.price - b.price); break;
      case "price-desc": items.sort((a, b) => b.price - a.price); break;
      case "rating":     items.sort((a, b) => b.rating - a.rating); break;
      case "reviews":    items.sort((a, b) => b.reviews - a.reviews); break;
      default:           items.sort((a, b) => b.id - a.id);
    }
    return items;
  }, [activeType, search, subCategory, region, priceMin, priceMax, verifiedOnly, organicOnly, minRating, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeChips = [
    subCategory !== "All"          && { label: subCategory,               clear: () => { setSubCategory("All"); setPage(1); } },
    region !== "All Regions"       && { label: region,                    clear: () => { setRegion("All Regions"); setPage(1); } },
    (priceMin || priceMax)         && { label: `$${priceMin||"0"}–${priceMax||"∞"}`, clear: () => { setPriceMin(""); setPriceMax(""); setPage(1); } },
    verifiedOnly                   && { label: "Verified",                clear: () => { setVerifiedOnly(false); setPage(1); } },
    organicOnly                    && { label: "Organic",                 clear: () => { setOrganicOnly(false); setPage(1); } },
    minRating > 0                  && { label: `${minRating}★+`,          clear: () => { setMinRating(0); setPage(1); } },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const clearAll = () => {
    setSubCategory("All"); setRegion("All Regions"); setPriceMin(""); setPriceMax("");
    setVerifiedOnly(false); setOrganicOnly(false); setMinRating(0); setSearch(""); setPage(1);
  };

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, farmer: product.seller, unit: product.unit, pricePerUnit: product.price, image: product.image, quantity: 1 });
    toast.success(`${product.name} added to cart!`, { action: { label: "View Cart", onClick: () => navigate("/cart") } });
  };

  const renderTypeInfo = (product: Product) => {
    if (product.type === "livestock") return (
      <div className="flex flex-wrap gap-1 mt-1">
        {product.breed      && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">{product.breed}</span>}
        {product.weight     && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">{product.weight}</span>}
        {product.healthStatus && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">{product.healthStatus}</span>}
      </div>
    );
    if (product.type === "farm-input") return (
      <div className="flex flex-wrap gap-1 mt-1">
        {product.formulation && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{product.formulation}</span>}
      </div>
    );
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      {/* Top Category Tabs */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {TOP_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeType === tab.key;
              const count = tab.key === "all" ? ALL_PRODUCTS.length : ALL_PRODUCTS.filter(p => p.type === tab.key).length;
              return (
                <button key={tab.key} onClick={() => handleTypeChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${isActive ? "bg-[#E85D04] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : tab.color}`} />
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-orange-400 text-white" : "bg-gray-200 text-gray-500"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder={`Search ${activeType === "farm-input" ? "farm inputs" : activeType === "all" ? "all products" : activeType}...`}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
          <div className="flex gap-2">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${showFilters ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              <Filter className="w-4 h-4" />
              Filters
              {activeChips.length > 0 && <span className="bg-[#E85D04] text-white text-xs px-1.5 py-0.5 rounded-full">{activeChips.length}</span>}
            </button>
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-2.5 ${viewMode === "grid" ? "bg-[#E85D04] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("list")} className={`p-2.5 ${viewMode === "list" ? "bg-[#E85D04] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="w-60 flex-shrink-0 space-y-4">
              <div className="bg-white rounded-xl border p-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#E85D04]" /> Filters
                  </h3>
                  {activeChips.length > 0 && <button onClick={clearAll} className="text-xs text-[#E85D04] hover:underline font-medium">Clear all</button>}
                </div>

                {/* Sub-category */}
                {activeType !== "all" && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Category</p>
                    <div className="space-y-1">
                      {subCats.map(cat => (
                        <button key={cat} onClick={() => { setSubCategory(cat); setPage(1); }}
                          className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${subCategory === cat ? "bg-orange-50 text-[#E85D04] font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Region */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Region</p>
                  <select value={region} onChange={e => { setRegion(e.target.value); setPage(1); }}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Price Range (USD)</p>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={priceMin} onChange={e => { setPriceMin(e.target.value); setPage(1); }}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    <input type="number" placeholder="Max" value={priceMax} onChange={e => { setPriceMax(e.target.value); setPage(1); }}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                  </div>
                </div>

                {/* Min Rating */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Minimum Rating</p>
                  <div className="flex gap-1">
                    {[0, 3, 4, 4.5].map(r => (
                      <button key={r} onClick={() => { setMinRating(r); setPage(1); }}
                        className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${minRating === r ? "bg-[#E85D04] text-white border-[#E85D04]" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                        {r === 0 ? "Any" : `${r}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  {[
                    { label: "Verified Sellers", icon: Shield, iconColor: "text-blue-500", state: verifiedOnly, toggle: () => { setVerifiedOnly(!verifiedOnly); setPage(1); }, activeColor: "bg-[#E85D04]" },
                    { label: "Organic Only",     icon: Leaf,   iconColor: "text-green-500",state: organicOnly,  toggle: () => { setOrganicOnly(!organicOnly); setPage(1); },   activeColor: "bg-green-500" },
                  ].map(({ label, icon: Icon, iconColor, state, toggle, activeColor }) => (
                    <label key={label} className="flex items-center gap-3 cursor-pointer" onClick={toggle}>
                      <div className={`w-10 h-5 rounded-full transition-colors relative ${state ? activeColor : "bg-gray-200"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${state ? "translate-x-5" : "translate-x-0.5"}`} />
                      </div>
                      <span className="text-sm text-gray-700 flex items-center gap-1"><Icon className={`w-3.5 h-3.5 ${iconColor}`} />{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Results + active chips */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">
                Showing <strong>{filtered.length}</strong> products{search && <> for "<strong>{search}</strong>"</>}
              </span>
              {activeChips.map(chip => (
                <span key={chip.label} className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                  {chip.label} <button onClick={chip.clear}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                <Button onClick={clearAll} variant="outline">Clear All Filters</Button>
              </div>
            ) : (
              <>
                <div className={viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-3"}>
                  {paginated.map(product => (
                    <div key={product.id}
                      className={`bg-white rounded-xl border hover:shadow-md transition-all group ${viewMode === "list" ? "flex gap-4 p-3" : ""}`}>
                      {/* Image */}
                      <div
                        className={`relative overflow-hidden cursor-pointer ${viewMode === "list" ? "w-28 h-28 rounded-lg flex-shrink-0" : "rounded-t-xl"}`}
                        onClick={() => navigate(`/product/${product.id}`)}>
                        <img src={product.image} alt={product.name}
                          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${viewMode === "list" ? "w-full h-full" : "w-full h-44"}`} />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.organic  && <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Leaf className="w-2.5 h-2.5" />Organic</span>}
                          {product.verified && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" />Verified</span>}
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SELLER_TYPE_COLORS[product.sellerType]}`}>
                            {SELLER_TYPE_LABELS[product.sellerType]}
                          </span>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setWishlist(prev => prev.includes(product.id) ? prev.filter(i => i !== product.id) : [...prev, product.id]); }}
                          className="absolute bottom-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className={`${viewMode === "list" ? "flex-1 min-w-0" : "p-3"}`}>
                        <div className="cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                          <p className="text-xs text-gray-500 mb-0.5">{product.category}</p>
                          <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 group-hover:text-[#E85D04] transition-colors">{product.name}</h3>
                          {renderTypeInfo(product)}
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                            <span className="text-xs text-gray-400">({product.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" /><span className="truncate">{product.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <span className="text-base font-bold text-[#E85D04]">${product.price.toLocaleString()}</span>
                            <span className="text-xs text-gray-400">/{product.unit}</span>
                            {product.minOrder > 1 && <p className="text-xs text-gray-400">Min: {product.minOrder} {product.unit}</p>}
                          </div>
                          <Button size="sm" className="bg-[#E85D04] hover:bg-orange-600 text-white h-8 px-3 text-xs"
                            onClick={() => handleAddToCart(product)}>
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-[#E85D04] text-white" : "border hover:bg-gray-50 text-gray-600"}`}>{p}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
