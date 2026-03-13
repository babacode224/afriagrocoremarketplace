import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Trash2, ShoppingCart, ArrowRight, Tag, Truck, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

const SUGGESTED = [
  { id: 10, name: "Fresh Bell Peppers", price: 18.0, unit: "box", image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=160&fit=crop", farmer: "Asante Agro Co." },
  { id: 11, name: "Sweet Onions", price: 8.0, unit: "kg", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&h=160&fit=crop", farmer: "Volta Valley Farms" },
  { id: 12, name: "Purple Eggplant", price: 15.0, unit: "kg", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&h=160&fit=crop", farmer: "Kwabena Farms" },
];

export default function Cart() {
  const { items, removeItem, updateQuantity, addItem, totalItems, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [, navigate] = useLocation();

  const deliveryFee = subtotal > 100 ? 0 : 25;
  const discount = promoApplied ? subtotal * 0.05 : 0;
  const total = subtotal + deliveryFee - discount;

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "AGRO5") {
      setPromoApplied(true);
      toast.success("Promo code applied! 5% discount added.");
    } else {
      toast.error("Invalid promo code. Try AGRO5.");
    }
  };

  const handleRemove = (id: number, name: string) => {
    removeItem(id);
    toast.success(`${name} removed from cart`);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-['Inter',sans-serif]">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-[#E85D04] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M12 2C8 2 4 5 4 9c0 2 1 4 2 5l6 8 6-8c1-1 2-3 2-5 0-4-4-7-8-7z"/></svg>
            </div>
            <span className="font-bold text-gray-900">AfriAgroCore</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-sm text-gray-600 hover:text-gray-900">Marketplace</Link>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 text-[#E85D04]">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E85D04] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{totalItems}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-6 h-6 text-[#E85D04]" />
          <h1 className="text-2xl font-black text-gray-900">My Cart</h1>
          <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full">{items.length} {items.length === 1 ? "item" : "items"}</span>
        </div>

        {/* Checkout Steps */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          {["Cart", "Checkout", "Confirmation"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${i === 0 ? "text-[#E85D04] font-bold" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-[#E85D04] text-white" : "bg-gray-200 text-gray-400"}`}>{i + 1}</div>
                {step}
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any produce yet.</p>
            <Button onClick={() => navigate("/marketplace")} className="bg-[#E85D04] hover:bg-[#d14e00] text-white px-8 py-3 rounded-xl font-semibold">
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Delivery Banner */}
              {subtotal < 100 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-700">
                    Add <strong>${(100 - subtotal).toFixed(2)}</strong> more to get <strong>FREE delivery!</strong>
                  </p>
                  <div className="ml-auto w-32 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / 100) * 100)}%` }} />
                  </div>
                </div>
              )}
              {subtotal >= 100 && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-500 shrink-0" />
                  <p className="text-sm text-green-700 font-semibold">🎉 You qualify for FREE delivery!</p>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {items.map((item, idx) => (
                  <div key={item.id} className={`flex items-center gap-4 p-5 ${idx < items.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0 cursor-pointer" onClick={() => navigate(`/product/${item.id}`)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm cursor-pointer hover:text-[#E85D04]" onClick={() => navigate(`/product/${item.id}`)}>{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Sold by: {item.farmer}</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> In stock
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-50 font-bold">−</button>
                        <span className="px-3 py-2 text-sm font-bold text-gray-900 min-w-[2.5rem] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-50 font-bold">+</button>
                      </div>
                      <div className="text-right w-24">
                        <p className="text-base font-black text-gray-900">${(item.pricePerUnit * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">${item.pricePerUnit.toFixed(2)} / {item.unit}</p>
                      </div>
                      <button onClick={() => handleRemove(item.id, item.name)} className="p-2 text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate("/marketplace")} className="flex items-center gap-2 text-sm text-[#E85D04] font-semibold hover:underline">
                ← Continue Shopping
              </button>

              {/* Suggested Items */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-4">You Might Also Like</h3>
                <div className="grid grid-cols-3 gap-3">
                  {SUGGESTED.map((s) => (
                    <div key={s.id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-[#E85D04] transition-colors">
                      <img src={s.image} alt={s.name} className="w-full h-24 object-cover cursor-pointer" onClick={() => navigate(`/product/${s.id}`)} />
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-800 truncate">{s.name}</p>
                        <p className="text-xs font-bold text-[#E85D04] mt-0.5">${s.price.toFixed(2)}</p>
                        <button
                          onClick={() => { addItem({ id: s.id, name: s.name, farmer: s.farmer, unit: s.unit, pricePerUnit: s.price, image: s.image }); toast.success(`${s.name} added!`); }}
                          className="w-full mt-2 bg-orange-50 hover:bg-orange-100 text-[#E85D04] text-[10px] font-bold py-1.5 rounded-lg transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Fee</span>
                    <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                      {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Promo (AGRO5)</span>
                      <span className="font-semibold">−${discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-4 mb-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Total</p>
                      <p className="text-2xl font-black text-gray-900">${total.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-gray-400">Incl. VAT</p>
                  </div>
                </div>

                {!promoApplied && (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#E85D04] uppercase"
                        />
                      </div>
                      <button onClick={applyPromo} className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors">Apply</button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">Try: AGRO5 for 5% off</p>
                  </div>
                )}

                <Button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-[#E85D04] hover:bg-[#d14e00] text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </Button>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <Shield className="w-3.5 h-3.5" /> Secure checkout · 256-bit SSL
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#E85D04]" /> Delivery Estimate
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Standard Delivery</span><span className="font-semibold">Feb 28 – Mar 1</span></div>
                  <div className="flex justify-between"><span>Express Delivery</span><span className="font-semibold text-blue-600">Feb 26 (Tomorrow)</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
