import { useLocation, Link } from "wouter";
import {
  ArrowLeft, Package, Truck, MapPin, CheckCircle,
  Clock, MessageSquare, RefreshCw, Star, ChevronRight, Warehouse
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const ORDER_ITEMS = [
  { name: "Vine Ripened Tomatoes", farmer: "Kwabena Farms", qty: "2 kg", price: "$50.00", status: "Dispatched", image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=80&h=80&fit=crop" },
  { name: "Large Pona Yam", farmer: "Asante Agro Co.", qty: "3 tubers", price: "$90.00", status: "Dispatched", image: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=80&h=80&fit=crop" },
  { name: "Organic Baby Carrots", farmer: "Green Valley Farm", qty: "1 bunch", price: "$12.50", status: "Processing", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=80&h=80&fit=crop" },
];

const TIMELINE = [
  { label: "Order Placed", time: "Feb 25, 2024 · 10:42 AM", done: true },
  { label: "Payment Confirmed", time: "Feb 25, 2024 · 10:43 AM", done: true },
  { label: "Seller Confirmed", time: "Feb 25, 2024 · 11:15 AM", done: true },
  { label: "Dispatched", time: "Feb 26, 2024 · 8:00 AM", done: false, active: true },
  { label: "Out for Delivery", time: "Estimated: Feb 27", done: false },
  { label: "Delivered", time: "Estimated: Feb 28", done: false },
];

export default function OrderDetails() {
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
          <div className="ml-auto">
            <Button
              onClick={() => navigate("/dashboard/buyer")}
              variant="outline"
              className="border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link href="/dashboard/buyer" className="hover:text-gray-600">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/dashboard/buyer" className="hover:text-gray-600">My Orders</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">#AAC-2024-00847</span>
        </div>

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard/buyer")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-black text-gray-900">Order #AAC-2024-00847</h1>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Truck className="w-3 h-3" /> In Transit
                </span>
              </div>
              <p className="text-sm text-gray-500">Placed on <strong>Feb 25, 2024</strong> · 3 items · $169.87 total</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => toast.info("Support team will contact you shortly.")}
                className="border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Contact Support
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Refund request submitted.")}
                className="border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Request Refund
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Items + Summary */}
          <div className="lg:col-span-2 space-y-5">
            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E85D04]" />
                <h2 className="font-bold text-gray-900">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {ORDER_ITEMS.map((item) => (
                  <div key={item.name} className="flex items-center gap-4 px-5 py-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Sold by: {item.farmer}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{item.price}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                        item.status === "Dispatched"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <button
                      onClick={() => toast.success(`Review for ${item.name} submitted!`)}
                      className="ml-2 flex items-center gap-1 text-xs text-[#E85D04] font-semibold hover:underline"
                    >
                      <Star className="w-3 h-3" /> Review
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>$152.50</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>Delivery</span><span>$25.00</span></div>
                <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>−$7.63</span></div>
                <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-200">
                  <span>Total Paid</span><span>$169.87</span>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E85D04]" /> Delivery Address
                </h3>
                <p className="text-sm font-semibold text-gray-900">John Mensah</p>
                <p className="text-sm text-gray-600 mt-1">House No. 12, Independence Ave</p>
                <p className="text-sm text-gray-600">Independence Ave, Central District</p>
                <p className="text-sm text-gray-600">Africa</p>
                <p className="text-sm text-gray-500 mt-2">+254 712 000 000</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Payment Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Method</span>
                    <span className="font-semibold text-gray-900">MTN MoMo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-bold text-green-600">Paid ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono text-xs text-gray-700">MTN-9284710</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-700">Feb 25, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E85D04]" /> Order Timeline
              </h2>
              <div className="relative">
                <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-gray-200" />
                <div className="space-y-5">
                  {TIMELINE.map((step) => (
                    <div key={step.label} className="flex items-start gap-4 relative">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                        step.done
                          ? "bg-green-500 border-green-500"
                          : (step as any).active
                          ? "bg-white border-[#E85D04]"
                          : "bg-white border-gray-200"
                      }`}>
                        {step.done ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                        ) : (step as any).active ? (
                          <div className="w-2.5 h-2.5 bg-[#E85D04] rounded-full animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className={`text-sm font-semibold ${step.done || (step as any).active ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${step.done ? "text-green-600" : (step as any).active ? "text-[#E85D04]" : "text-gray-400"}`}>
                          {step.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Book Logistics / Storage CTAs */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Need Additional Services?</h3>
              <div className="space-y-2">
                <Link href="/book-logistics">
                  <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-xl cursor-pointer hover:bg-teal-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="text-sm font-bold text-teal-800">Book Logistics</p>
                        <p className="text-xs text-teal-600">Arrange delivery with a partner</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-teal-600" />
                  </div>
                </Link>
                <Link href="/book-storage">
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-bold text-purple-800">Book Storage</p>
                        <p className="text-xs text-purple-600">Store produce at a facility</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-600" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Logistics Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E85D04]" /> Logistics Partner
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🚚</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Pan-African Haulage Ltd</p>
                  <p className="text-xs text-gray-400">Verified Logistics Partner</p>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking No.</span>
                  <span className="font-mono font-bold text-gray-900">PAH-8472910</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver</span>
                  <span className="font-semibold text-gray-900">Kofi Asante</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-semibold text-gray-900">GH-3421-24</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-gray-200 text-gray-700 text-sm py-2.5 rounded-xl font-semibold"
                onClick={() => toast.info("Live tracking coming soon!")}
              >
                Track Live Location
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
