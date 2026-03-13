import { useState } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, CheckCircle, ShieldCheck, ChevronRight, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard Delivery", sub: "3–5 Business Days", price: 25, icon: "🚚" },
  { id: "logistics", label: "Logistics Partner", sub: "Next Day Express", price: 55, icon: "🚀" },
  { id: "pickup", label: "Pickup Station", sub: "Ready in 24 hours", price: 0, icon: "🏪" },
  { id: "storage", label: "Deliver to Storage", sub: "Store & collect later", price: 35, icon: "🏭" },
];

const PAYMENT_METHODS = [
  { id: "mobile", label: "Mobile Money", sub: "MTN, Vodafone, AirtelTigo", icon: "📱" },
  { id: "card", label: "Debit / Credit Card", sub: "Visa, Mastercard", icon: "💳" },
  { id: "bank", label: "Bank Transfer", sub: "Direct bank payment", icon: "🏦" },
  { id: "wallet", label: "AfriAgroCore Wallet", sub: "Balance: $0.00", icon: "👛" },
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("mobile");
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();

  // Form state
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", region: "", notes: "",
  });

  const deliveryFee = DELIVERY_OPTIONS.find((d) => d.id === deliveryMethod)?.price ?? 0;
  const total = subtotal + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async () => {
    // Basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.address || !form.city) {
      toast.error("Please fill in all required delivery fields.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      navigate("/marketplace");
      return;
    }
    setIsProcessing(true);
    // Simulate order processing
    await new Promise((r) => setTimeout(r, 1800));
    clearCart();
    setIsProcessing(false);
    navigate("/order-confirmation");
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-['Inter',sans-serif]">
        <ShoppingCart className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items to your cart before checking out.</p>
        <Button onClick={() => navigate("/marketplace")} className="bg-[#E85D04] hover:bg-[#d14e00] text-white px-8 py-3 rounded-xl font-semibold">
          Browse Marketplace
        </Button>
      </div>
    );
  }

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
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => navigate("/cart")} className="relative p-2 text-gray-600">
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E85D04] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{items.length}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb + Back */}
        <button onClick={() => navigate("/cart")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          {["Cart", "Checkout", "Confirmation"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${i === 1 ? "text-[#E85D04] font-bold" : i === 0 ? "text-green-600 font-semibold" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-green-500 text-white" : i === 1 ? "bg-[#E85D04] text-white" : "bg-gray-200 text-gray-400"}`}>
                  {i === 0 ? "✓" : i + 1}
                </div>
                {step}
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#E85D04] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Delivery Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "firstName", label: "First Name *", placeholder: "John" },
                  { name: "lastName", label: "Last Name *", placeholder: "Mensah" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                    <input name={f.name} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number *</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 24 000 0000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Street Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="House No. 12, Independence Ave"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">City *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Accra"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Region</label>
                  <select name="region" value={form.region} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04] bg-white">
                    <option value="">Select region</option>
                    {["Greater Accra", "East Africa", "Western", "Eastern", "Central", "Northern", "Volta", "Brong-Ahafo"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Order Notes (optional)</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Any special instructions for delivery..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30 focus:border-[#E85D04] resize-none" />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#E85D04] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Delivery Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DELIVERY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDeliveryMethod(opt.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      deliveryMethod === opt.id ? "border-[#E85D04] bg-orange-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${deliveryMethod === opt.id ? "text-[#E85D04]" : "text-gray-900"}`}>{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.sub}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${opt.price === 0 ? "text-green-600" : deliveryMethod === opt.id ? "text-[#E85D04]" : "text-gray-700"}`}>
                        {opt.price === 0 ? "FREE" : `$${opt.price}`}
                      </p>
                    </div>
                    {deliveryMethod === opt.id && (
                      <CheckCircle className="w-4 h-4 text-[#E85D04] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              {/* Quick-book CTAs when logistics or storage is selected */}
              {deliveryMethod === "logistics" && (
                <div className="mt-3 flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-teal-800">Browse available logistics partners</p>
                    <p className="text-xs text-teal-600">Compare rates, vehicles, and delivery times</p>
                  </div>
                  <Link href="/book-logistics">
                    <button className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                      Browse <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              )}
              {deliveryMethod === "storage" && (
                <div className="mt-3 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-purple-800">Browse available storage facilities</p>
                    <p className="text-xs text-purple-600">Cold, ambient, and silo options available</p>
                  </div>
                  <Link href="/book-storage">
                    <button className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                      Browse <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#E85D04] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === pm.id ? "border-[#E85D04] bg-orange-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{pm.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${paymentMethod === pm.id ? "text-[#E85D04]" : "text-gray-900"}`}>{pm.label}</p>
                      <p className="text-xs text-gray-400">{pm.sub}</p>
                    </div>
                    {paymentMethod === pm.id && <CheckCircle className="w-4 h-4 text-[#E85D04] shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Mobile Money Input */}
              {paymentMethod === "mobile" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Mobile Money Number</label>
                  <div className="flex gap-2">
                    <select className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none">
                      <option>MTN</option><option>Vodafone</option><option>AirtelTigo</option>
                    </select>
                    <input type="tel" placeholder="024 000 0000" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D04]/30" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} {item.unit}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-900 shrink-0">${(item.pricePerUnit * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                    {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-lg pt-2 border-t border-gray-100">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-[#E85D04] hover:bg-[#d14e00] text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><CheckCircle className="w-5 h-5" /> Place Order</>
                )}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Secure checkout · 256-bit SSL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
