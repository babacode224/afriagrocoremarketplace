import { useLocation, Link } from "wouter";
import { CheckCircle, Package, Truck, MapPin, Download, Share2, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const ORDER_ITEMS = [
  { name: "Vine Ripened Tomatoes", qty: "2 kg", price: "$50.00", image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=80&h=80&fit=crop" },
  { name: "Large Pona Yam", qty: "3 tubers", price: "$90.00", image: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=80&h=80&fit=crop" },
  { name: "Organic Baby Carrots", qty: "1 bunch", price: "$12.50", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=80&h=80&fit=crop" },
];

const TRACKING_STEPS = [
  { label: "Order Placed", sub: "Feb 25, 2024 · 10:42 AM", done: true, active: false },
  { label: "Seller Confirmed", sub: "Awaiting confirmation", done: false, active: true },
  { label: "Dispatched", sub: "Estimated: Feb 26", done: false, active: false },
  { label: "Out for Delivery", sub: "Estimated: Feb 27", done: false, active: false },
  { label: "Delivered", sub: "Estimated: Feb 28", done: false, active: false },
];

export default function OrderConfirmation() {
  const [, navigate] = useLocation();

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
            <Link href="/marketplace" className="text-sm text-gray-600 hover:text-gray-900">Continue Shopping</Link>
            <Button onClick={() => navigate("/dashboard/buyer")} className="bg-[#E85D04] hover:bg-[#d14e00] text-white text-sm px-4 py-2 rounded-lg">
              My Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-base">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-2 mt-4">
            <span className="text-sm text-green-700 font-medium">Order ID:</span>
            <span className="text-sm font-black text-green-800 font-mono">#AAC-2024-00847</span>
          </div>
        </div>

        {/* Checkout Steps */}
        <div className="flex items-center justify-center gap-2 mb-10 text-sm">
          {["Cart", "Checkout", "Confirmation"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${i === 2 ? "text-green-600 font-bold" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 2 ? "bg-green-500 text-white" : i === 2 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400"
                }`}>
                  {i < 2 ? "✓" : i + 1}
                </div>
                {step}
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Order Details */}
          <div className="lg:col-span-3 space-y-5">
            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#E85D04]" /> Order Items
                </h2>
                <span className="text-xs text-gray-400">{ORDER_ITEMS.length} items</span>
              </div>
              <div className="divide-y divide-gray-50">
                {ORDER_ITEMS.map((item) => (
                  <div key={item.name} className="flex items-center gap-4 px-5 py-4">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.qty}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span><span>$152.50</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Fee</span><span>$25.00</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Promo Discount</span><span>−$7.63</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-200">
                  <span>Total Paid</span><span>$169.87</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E85D04]" /> Delivery Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Delivery Method</p>
                  <p className="font-semibold text-gray-900">Standard Delivery</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Estimated Arrival</p>
                  <p className="font-semibold text-gray-900">Feb 28 – Mar 1, 2024</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Payment Method</p>
                  <p className="font-semibold text-gray-900">MTN Mobile Money</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Payment Status</p>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Paid
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Shipping Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#E85D04] shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-gray-800">House No. 12, Independence Ave, Accra, Africa</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                onClick={() => {}}
              >
                <Download className="w-4 h-4" /> Download Receipt
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                onClick={() => {}}
              >
                <Share2 className="w-4 h-4" /> Share Order
              </Button>
            </div>
          </div>

          {/* Right: Tracking + Next Steps */}
          <div className="lg:col-span-2 space-y-5">
            {/* Order Tracking */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E85D04]" /> Order Tracking
              </h2>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-gray-200" />
                <div className="space-y-5">
                  {TRACKING_STEPS.map((step, i) => (
                    <div key={step.label} className="flex items-start gap-4 relative">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                        step.done
                          ? "bg-green-500 border-green-500"
                          : step.active
                          ? "bg-white border-[#E85D04]"
                          : "bg-white border-gray-200"
                      }`}>
                        {step.done ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                        ) : step.active ? (
                          <div className="w-2.5 h-2.5 bg-[#E85D04] rounded-full animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className={`text-sm font-semibold ${step.done || step.active ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${step.done ? "text-green-600" : step.active ? "text-[#E85D04]" : "text-gray-400"}`}>
                          {step.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">What's Next?</h2>
              <div className="space-y-3">
                {[
                  { icon: "📧", title: "Check your email", desc: "A confirmation email has been sent to your registered address." },
                  { icon: "📱", title: "Track your order", desc: "You'll receive SMS updates as your order progresses." },
                  { icon: "⭐", title: "Rate your purchase", desc: "After delivery, share your experience to help other buyers." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => navigate("/dashboard/buyer")}
                className="w-full bg-[#E85D04] hover:bg-[#d14e00] text-white py-3 rounded-xl font-bold"
              >
                View My Orders
              </Button>
              <Button
                onClick={() => navigate("/marketplace")}
                variant="outline"
                className="w-full border-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
