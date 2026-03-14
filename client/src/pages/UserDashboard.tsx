import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Package, ShoppingCart, MessageSquare, Bell, LogOut, Menu, X, Leaf,
  Plus, Star, Truck, Warehouse, Sprout, Wrench, User, Heart, TrendingUp,
  CheckCircle, Clock, DollarSign, BarChart3, Home, Settings, AlertCircle,
  Globe, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram, MessageCircle,
  ChevronDown, ChevronUp, Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast as toastFn } from "sonner";

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  farmer: { label: "Farmer", icon: Leaf, color: "text-green-700", bgColor: "bg-green-600" },
  buyer: { label: "Buyer", icon: ShoppingCart, color: "text-blue-700", bgColor: "bg-blue-600" },
  logistics: { label: "Logistics Partner", icon: Truck, color: "text-orange-700", bgColor: "bg-orange-600" },
  storage: { label: "Storage Partner", icon: Warehouse, color: "text-purple-700", bgColor: "bg-purple-600" },
  input_supplier: { label: "Input Supplier", icon: Sprout, color: "text-yellow-700", bgColor: "bg-yellow-600" },
  machinery_dealer: { label: "Machinery Dealer", icon: Wrench, color: "text-red-700", bgColor: "bg-red-600" },
};

function AddProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "", description: "", category: "produce" as const,
    subcategory: "", price: "", unit: "kg", stock: "", imageUrl: "", location: "", country: "", isOrganic: false,
  });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => { toast.success("Product listed successfully!"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label>Product Name *</Label>
          <Input placeholder="e.g. Fresh Tomatoes" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Description</Label>
          <Textarea placeholder="Describe your product..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
        </div>
        <div className="space-y-1">
          <Label>Category *</Label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-400"
            title="Category"
            value={form.category} onChange={e => setForm({...form, category: e.target.value as any})}>
            <option value="produce">Farm Produce</option>
            <option value="livestock">Livestock</option>
            <option value="farm_inputs">Farm Inputs</option>
            <option value="machinery">Farm Machinery</option>
            <option value="tools">Tools & Equipment</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Subcategory</Label>
          <Input placeholder="e.g. Vegetables, Tractors..." value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})} />
        </div>
        <div className="space-y-1">
          <Label>Price (USD $) *</Label>
          <Input type="number" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
        </div>
        <div className="space-y-1">
          <Label>Unit</Label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-400"
            title="Unit"
            value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
            {["kg","ton","bag","crate","piece","liter","unit","acre","set"].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Stock Quantity</Label>
          <Input type="number" placeholder="100" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
        </div>
        <div className="space-y-1">
          <Label>Location</Label>
          <Input placeholder="e.g. Lagos, Nigeria" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        </div>
        <div className="space-y-1">
          <Label>Country</Label>
          <Input placeholder="e.g. Nigeria" value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Image URL</Label>
          <Input placeholder="https://..." value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="organic" checked={form.isOrganic} onChange={e => setForm({...form, isOrganic: e.target.checked})} className="w-4 h-4 text-green-600" />
          <Label htmlFor="organic">Organic / Certified Product</Label>
        </div>
      </div>
      <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Listing..." : "List Product"}
      </Button>
    </form>
  );
}

export default function UserDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messageContent, setMessageContent] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);

  // Auth guard: try to load the server session (cookie-based).
  // The cookie is set directly by /api/auth/google/callback or /api/auth/login.
  // If the server doesn't recognise us, redirect to /signin.
  const meQuery = trpc.auth.getProfile.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  });
  const user = meQuery.data as any;
  const userRole = user?.userRole ?? "buyer";
  const roleConfig = ROLE_CONFIG[userRole] ?? ROLE_CONFIG.buyer;
  const RoleIcon = roleConfig.icon;

  useEffect(() => {
    if (meQuery.isLoading) return;
    if (meQuery.isError) {
      navigate("/signin");
    }
  }, [meQuery.isLoading, meQuery.isError, navigate]);

  // Profile completion gate
  useEffect(() => {
    if (!meQuery.isLoading && user && user.profileCompleted === false) {
      navigate("/complete-profile");
    }
  }, [meQuery.isLoading, user?.profileCompleted]);

  const myProductsQuery = trpc.products.myProducts.useQuery(undefined, { enabled: activeTab === "products", retry: false });
  const myOrdersQuery = trpc.orders.myOrders.useQuery(undefined, { enabled: activeTab === "orders" || activeTab === "overview", retry: false });
  const sellerOrdersQuery = trpc.orders.sellerOrders.useQuery(undefined, { enabled: activeTab === "seller_orders", retry: false });
  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: activeTab === "cart", retry: false });
  const wishlistQuery = trpc.wishlist.get.useQuery(undefined, { enabled: activeTab === "wishlist", retry: false });
  const conversationsQuery = trpc.messages.conversations.useQuery(undefined, { enabled: activeTab === "messages", retry: false });
  const threadQuery = trpc.messages.thread.useQuery({ partnerId: selectedPartner! }, { enabled: !!selectedPartner, retry: false });
  const notificationsQuery = trpc.notifications.list.useQuery(undefined, { enabled: activeTab === "notifications", retry: false });
  const logisticsQuery = trpc.logistics.myServices.useQuery(undefined, { enabled: activeTab === "logistics", retry: false });
  const storageQuery = trpc.storage.myServices.useQuery(undefined, { enabled: activeTab === "storage_list", retry: false });

  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: () => { setMessageContent(""); threadQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const removeFromCartMutation = trpc.cart.remove.useMutation({
    onSuccess: () => cartQuery.refetch(),
    onError: (e) => toast.error(e.message),
  });

  const checkoutMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => { toast.success(`Order #${data.orderId} placed!`); cartQuery.refetch(); setActiveTab("orders"); },
    onError: (e) => toast.error(e.message),
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { navigate("/"); window.location.reload(); },
  });

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => notificationsQuery.refetch(),
  });

  // Build sidebar items based on role
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    ...(["farmer","input_supplier","machinery_dealer"].includes(userRole) ? [
      { id: "products", label: "My Products", icon: Package },
      { id: "seller_orders", label: "Incoming Orders", icon: TrendingUp },
    ] : []),
    ...(userRole === "buyer" ? [
      { id: "cart", label: "Cart", icon: ShoppingCart },
      { id: "orders", label: "My Orders", icon: Clock },
      { id: "wishlist", label: "Wishlist", icon: Heart },
    ] : []),
    ...(userRole === "logistics" ? [{ id: "logistics", label: "My Services", icon: Truck }] : []),
    ...(userRole === "storage" ? [{ id: "storage_list", label: "My Storage", icon: Warehouse }] : []),
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
    { id: "profile_settings", label: "Profile Settings", icon: Settings, href: "/profile-settings" },
  ];

  const myOrders = myOrdersQuery.data ?? [];
  const totalSpent = myOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);

  // Profile completeness check — uses the server-computed profileCompleted flag
  const isProfileComplete = !!(user?.profileCompleted);
  const isEmailVerified = !!(user?.isVerified);

  const resendVerificationMutation = trpc.auth.resendVerification.useMutation({
    onSuccess: (data) => {
      if (data.alreadyVerified) {
        toast.success("Your email is already verified!");
        meQuery.refetch();
      } else if (!data.emailSent && data.verifyUrl) {
        toast.success("Verification link generated!");
        window.open(data.verifyUrl, "_blank");
      } else {
        toast.success("Verification email sent! Check your inbox.");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  // Persistent profile banner dismiss state (per-user key so it resets for new accounts)
  const profileBannerKey = `afriagro_profile_banner_dismissed_${user?.id ?? ""}`;
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(() => {
    try { return localStorage.getItem(`afriagro_profile_banner_dismissed_${user?.id ?? ""}`) === "1"; } catch { return false; }
  });
  const dismissProfileBanner = () => {
    setProfileBannerDismissed(true);
    try { localStorage.setItem(profileBannerKey, "1"); } catch {}
  };

  // Onboarding checklist state
  const [checklistCollapsed, setChecklistCollapsed] = useState(false);
  const [dismissedChecklist, setDismissedChecklist] = useState(() => {
    try { return localStorage.getItem("afriagro_checklist_dismissed") === "1"; } catch { return false; }
  });

  const onboardingSteps = [
    {
      id: "verify_email",
      label: "Verify your email address",
      desc: "Click the link we sent to your email to activate your account",
      done: isEmailVerified,
      action: () => resendVerificationMutation.mutate({ origin: window.location.origin }),
      actionLabel: resendVerificationMutation.isPending ? "Sending..." : "Resend Verification",
    },
    {
      id: "profile",
      label: "Complete your profile",
      desc: "Add phone, country, bio and a profile photo",
      done: isProfileComplete,
      action: () => navigate("/profile-settings"),
      actionLabel: "Go to Profile Settings",
    },
    ...(["farmer","input_supplier","machinery_dealer"].includes(userRole) ? [
      {
        id: "product",
        label: "List your first product",
        desc: "Add a product so buyers can find you",
        done: (myProductsQuery.data?.length ?? 0) > 0,
        action: () => setActiveTab("add_product"),
        actionLabel: "Add a Product",
      },
    ] : []),
    ...(userRole === "logistics" ? [
      {
        id: "logistics_service",
        label: "Add your first logistics service",
        desc: "List your vehicle and coverage area",
        done: (logisticsQuery.data?.length ?? 0) > 0,
        action: () => setActiveTab("logistics"),
        actionLabel: "Add a Service",
      },
    ] : []),
    ...(userRole === "storage" ? [
      {
        id: "storage_service",
        label: "Add your first storage facility",
        desc: "List your warehouse capacity and location",
        done: (storageQuery.data?.length ?? 0) > 0,
        action: () => setActiveTab("storage_list"),
        actionLabel: "Add a Facility",
      },
    ] : []),
    {
      id: "marketplace",
      label: "Explore the marketplace",
      desc: "Browse available products and services",
      done: false, // always show as a prompt
      action: () => window.open("/marketplace", "_blank"),
      actionLabel: "Browse Marketplace",
    },
    {
      id: "message",
      label: "Send your first message",
      desc: "Connect with a farmer, buyer, or partner",
      done: false,
      action: () => setActiveTab("messages"),
      actionLabel: "Open Messages",
    },
  ];

  const completedSteps = onboardingSteps.filter(s => s.done).length;
  const allDone = completedSteps === onboardingSteps.length;
  const showChecklist = !dismissedChecklist && !allDone;

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => { toast.success("Profile updated!"); meQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [profileForm, setProfileForm] = useState({
    name: "", phone: "", country: "", region: "", bio: "", avatarUrl: "",
    whatsapp: "", address: "", website: "",
    linkedinUrl: "", twitterUrl: "", facebookUrl: "", instagramUrl: "",
  });

  const [profileFormInit, setProfileFormInit] = useState(false);
  if (user && !profileFormInit) {
    setProfileFormInit(true);
    setProfileForm({
      name: user.name ?? "",
      phone: user.phone ?? "",
      country: user.country ?? "",
      region: user.region ?? "",
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? "",
      whatsapp: (user as any).whatsapp ?? "",
      address: (user as any).address ?? "",
      website: (user as any).website ?? "",
      linkedinUrl: (user as any).linkedinUrl ?? "",
      twitterUrl: (user as any).twitterUrl ?? "",
      facebookUrl: (user as any).facebookUrl ?? "",
      instagramUrl: (user as any).instagramUrl ?? "",
    });
  }

  // Don't render anything until Supabase confirms the session (prevents flash)
  if (supabaseSession === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        <div className="p-4 flex items-center gap-3 border-b border-gray-700">
          <div className={`w-9 h-9 ${roleConfig.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <RoleIcon className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm">{user?.name ?? "Loading..."}</p>
              <p className="text-xs text-gray-400">{roleConfig.label}</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto text-gray-400 hover:text-white">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const itemCls = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
              isActive ? `${roleConfig.bgColor} text-white shadow-md` : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`;
            return (item as any).href ? (
              <Link key={item.id} href={(item as any).href} className={itemCls}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ) : (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={itemCls}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-700 space-y-1">
          <Link href="/">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all">
              <Home className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Back to Site</span>}
            </button>
          </Link>
          <button onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {sidebarItems.find(i => i.id === activeTab)?.label ?? "Dashboard"}
            </h1>
            <p className="text-xs text-gray-500">Welcome back, {user?.name ?? "..."}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${roleConfig.bgColor} text-white text-xs px-3 py-1`}>{roleConfig.label}</Badge>
            {["farmer","input_supplier","machinery_dealer"].includes(userRole) && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs"
                onClick={() => setActiveTab("add_product")}>
                <Plus className="w-3 h-3 mr-1" /> Add Product
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* ── Email Not Verified Banner ── */}
          {!isEmailVerified && activeTab === "overview" && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">Verify Your Email Address</p>
                <p className="text-xs text-blue-700 mt-0.5">Your email is not yet verified. Check your inbox for the verification link, or request a new one.</p>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex-shrink-0"
                onClick={() => resendVerificationMutation.mutate({ origin: window.location.origin })}
                disabled={resendVerificationMutation.isPending}>
                {resendVerificationMutation.isPending ? "Sending..." : "Resend Link"}
              </Button>
            </div>
          )}

          {/* ── Complete Your Profile CTA Banner (persistent, dismissible) ── */}
          {!isProfileComplete && !profileBannerDismissed && (
            <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800">Complete Your Profile</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Add your phone number, location, bio, and profile photo to build trust with buyers and sellers.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  onClick={() => navigate("/profile-settings")}>
                  Complete Profile             </Button>
                <button
                  onClick={dismissProfileBanner}
                  className="text-amber-400 hover:text-amber-600 transition-colors p-1 rounded"
                  title="Dismiss"
                  aria-label="Dismiss profile banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Onboarding Checklist ── */}
          {activeTab === "overview" && showChecklist && (
            <div className="mb-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Getting Started — {completedSteps}/{onboardingSteps.length} steps complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {onboardingSteps.map((s, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${s.done ? "bg-white" : "bg-white/30"}`} />
                    ))}
                  </div>
                  <button onClick={() => setChecklistCollapsed(c => !c)} className="ml-2 text-white/80 hover:text-white">
                    {checklistCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setDismissedChecklist(true); localStorage.setItem("afriagro_checklist_dismissed", "1"); }}
                    className="text-white/60 hover:text-white text-xs ml-1">Dismiss</button>
                </div>
              </div>
              {!checklistCollapsed && (
                <div className="divide-y divide-gray-100">
                  {onboardingSteps.map((step) => (
                    <div key={step.id} className={`flex items-center gap-4 px-5 py-3 ${step.done ? "bg-green-50" : "hover:bg-gray-50"} transition-colors`}>
                      <div className="flex-shrink-0">
                        {step.done
                          ? <CheckCircle className="w-5 h-5 text-green-500" />
                          : <Circle className="w-5 h-5 text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${step.done ? "text-gray-400 line-through" : "text-gray-700"}`}>{step.label}</p>
                        <p className="text-xs text-gray-400 truncate">{step.desc}</p>
                      </div>
                      {!step.done && (
                        <Button size="sm" variant="outline" className="text-xs border-green-200 text-green-700 hover:bg-green-50 flex-shrink-0"
                          onClick={step.action}>{step.actionLabel}</Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {["farmer","input_supplier","machinery_dealer"].includes(userRole) && (
                  <>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                      <CardContent className="p-5">
                        <Package className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-3xl font-bold">{myProductsQuery.data?.length ?? "—"}</p>
                        <p className="text-sm opacity-80 mt-1">Listed Products</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <CardContent className="p-5">
                        <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-3xl font-bold">{sellerOrdersQuery.data?.length ?? "—"}</p>
                        <p className="text-sm opacity-80 mt-1">Incoming Orders</p>
                      </CardContent>
                    </Card>
                  </>
                )}
                {userRole === "buyer" && (
                  <>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <CardContent className="p-5">
                        <ShoppingCart className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-3xl font-bold">{myOrders.length}</p>
                        <p className="text-sm opacity-80 mt-1">Total Orders</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                      <CardContent className="p-5">
                        <DollarSign className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-3xl font-bold">${totalSpent.toFixed(0)}</p>
                        <p className="text-sm opacity-80 mt-1">Total Spent</p>
                      </CardContent>
                    </Card>
                  </>
                )}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-5">
                    <MessageSquare className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold">{conversationsQuery.data?.length ?? "—"}</p>
                    <p className="text-sm opacity-80 mt-1">Conversations</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-5">
                    <Bell className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold">{notificationsQuery.data?.filter((n: any) => !n.isRead).length ?? "—"}</p>
                    <p className="text-sm opacity-80 mt-1">Unread Alerts</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              {userRole === "buyer" && myOrders.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-gray-700">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {myOrders.slice(0, 5).map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Order #{order.id}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-700">${Number(order.totalAmount).toFixed(2)}</p>
                            <Badge className={`text-xs capitalize ${order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-700">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/marketplace">
                      <Button variant="outline" size="sm" className="text-xs border-green-200 text-green-700 hover:bg-green-50">
                        Browse Marketplace
                      </Button>
                    </Link>
                    {["farmer","input_supplier","machinery_dealer"].includes(userRole) && (
                      <Button variant="outline" size="sm" className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => setActiveTab("add_product")}>
                        <Plus className="w-3 h-3 mr-1" /> List New Product
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => setActiveTab("messages")}>
                      <MessageSquare className="w-3 h-3 mr-1" /> Messages
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Add Product ── */}
          {activeTab === "add_product" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">List a New Product</h2>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <AddProductForm onSuccess={() => setActiveTab("products")} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── My Products ── */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">My Products ({myProductsQuery.data?.length ?? 0})</h2>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs" onClick={() => setActiveTab("add_product")}>
                  <Plus className="w-3 h-3 mr-1" /> Add Product
                </Button>
              </div>
              {myProductsQuery.isLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(myProductsQuery.data ?? []).map((p: any) => (
                    <Card key={p.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-4">
                        {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-3" />}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm">{p.name}</h3>
                            <p className="text-xs text-gray-500 capitalize">{p.category?.replace("_", " ")} • {p.location}</p>
                          </div>
                          <Badge className={`text-xs ${p.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {p.isApproved ? "Live" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-lg font-bold text-green-700">${Number(p.price).toFixed(2)}<span className="text-xs text-gray-400">/{p.unit}</span></p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Star className="w-3 h-3 text-yellow-400" />{Number(p.rating).toFixed(1)} ({p.reviewCount})
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Stock: {p.stock} {p.unit}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {!myProductsQuery.data?.length && (
                    <div className="col-span-3 text-center py-16 text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No products listed yet</p>
                      <Button size="sm" className="mt-4 bg-green-600 hover:bg-green-700 text-white" onClick={() => setActiveTab("add_product")}>
                        List Your First Product
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Cart ── */}
          {activeTab === "cart" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Shopping Cart ({cartQuery.data?.length ?? 0} items)</h2>
              {cartQuery.isLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" /></div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-3">
                    {(cartQuery.data ?? []).map((item: any) => (
                      <Card key={item.id} className="border-0 shadow-md">
                        <CardContent className="p-4 flex items-center gap-4">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-lg object-cover" />
                          ) : (
                            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-green-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-sm">{item.productName}</h3>
                            <p className="text-xs text-gray-500">Seller: {item.sellerName}</p>
                            <p className="text-sm font-bold text-green-700 mt-1">${Number(item.productPrice).toFixed(2)}/{item.productUnit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-700">Qty: {item.quantity}</p>
                            <p className="text-sm font-bold text-green-700">${(Number(item.productPrice) * item.quantity).toFixed(2)}</p>
                            <Button size="sm" variant="ghost" className="text-red-500 text-xs mt-1 h-6"
                              onClick={() => removeFromCartMutation.mutate({ cartItemId: item.id })}>
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {!cartQuery.data?.length && (
                      <div className="text-center py-16 text-gray-400">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Your cart is empty</p>
                        <Link href="/marketplace">
                          <Button size="sm" className="mt-4 bg-green-600 hover:bg-green-700 text-white">Browse Marketplace</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                  {(cartQuery.data?.length ?? 0) > 0 && (
                    <Card className="border-0 shadow-lg h-fit">
                      <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-semibold">${(cartQuery.data ?? []).reduce((s: number, i: any) => s + Number(i.productPrice) * i.quantity, 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-bold text-lg">
                          <span>Total (USD)</span>
                          <span className="text-green-700">${(cartQuery.data ?? []).reduce((s: number, i: any) => s + Number(i.productPrice) * i.quantity, 0).toFixed(2)}</span>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => checkoutMutation.mutate({ paymentMethod: "cash" })}
                          disabled={checkoutMutation.isPending}>
                          {checkoutMutation.isPending ? "Placing Order..." : "Place Order"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Orders ── */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">My Orders ({myOrders.length})</h2>
              <div className="space-y-3">
                {myOrders.map((order: any) => (
                  <Card key={order.id} className="border-0 shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">Order #{order.id}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />{new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 capitalize mt-1">Payment: {order.paymentMethod?.replace("_", " ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-700">${Number(order.totalAmount).toFixed(2)}</p>
                        <Badge className={`text-xs capitalize mt-1 ${
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          order.status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{order.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!myOrders.length && (
                  <div className="text-center py-16 text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No orders yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Seller Orders ── */}
          {activeTab === "seller_orders" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Incoming Orders ({sellerOrdersQuery.data?.length ?? 0})</h2>
              <div className="space-y-3">
                {(sellerOrdersQuery.data ?? []).map((item: any, i: number) => (
                  <Card key={i} className="border-0 shadow-md">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">Order #{item.orderId}</p>
                        <p className="text-xs text-gray-500">Buyer: {item.buyerName ?? "Unknown"}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} • Unit: ${Number(item.unitPrice).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-700">${Number(item.totalPrice).toFixed(2)}</p>
                        <Badge className={`text-xs capitalize ${item.orderStatus === "delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {item.orderStatus}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!sellerOrdersQuery.data?.length && (
                  <div className="text-center py-16 text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No incoming orders yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Wishlist ── */}
          {activeTab === "wishlist" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Wishlist ({wishlistQuery.data?.length ?? 0})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {(wishlistQuery.data ?? []).map((item: any) => (
                  <Card key={item.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-36 object-cover rounded-lg mb-3" />}
                      <h3 className="font-semibold text-gray-800 text-sm">{item.productName}</h3>
                      <p className="text-xs text-gray-500">Seller: {item.sellerName}</p>
                      <p className="text-lg font-bold text-green-700 mt-2">${Number(item.productPrice).toFixed(2)}/{item.productUnit}</p>
                    </CardContent>
                  </Card>
                ))}
                {!wishlistQuery.data?.length && (
                  <div className="col-span-3 text-center py-16 text-gray-400">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No saved items</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          {activeTab === "messages" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Messages</h2>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[500px]">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="pb-2 border-b"><CardTitle className="text-sm">Conversations</CardTitle></CardHeader>
                  <div className="overflow-y-auto h-[420px]">
                    {(conversationsQuery.data ?? []).map((conv: any) => (
                      <button key={conv.partnerId} onClick={() => setSelectedPartner(conv.partnerId)}
                        className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-50 transition-colors ${selectedPartner === conv.partnerId ? "bg-green-50" : ""}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                            {(conv.partnerName ?? "?")[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-700">{conv.partnerName ?? "Unknown"}</p>
                            <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                          </div>
                          {conv.unread > 0 && <Badge className="bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full p-0">{conv.unread}</Badge>}
                        </div>
                      </button>
                    ))}
                    {!conversationsQuery.data?.length && (
                      <p className="text-center text-gray-400 text-sm py-8">No conversations yet</p>
                    )}
                  </div>
                </Card>

                <Card className="xl:col-span-2 border-0 shadow-lg overflow-hidden flex flex-col">
                  {selectedPartner ? (
                    <>
                      <CardHeader className="pb-2 border-b">
                        <CardTitle className="text-sm">
                          {conversationsQuery.data?.find((c: any) => c.partnerId === selectedPartner)?.partnerName ?? "Conversation"}
                        </CardTitle>
                      </CardHeader>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {(threadQuery.data ?? []).map((msg: any) => {
                          const isMine = msg.senderId !== selectedPartner;
                          return (
                            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMine ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                                {msg.content}
                                <p className={`text-xs mt-1 ${isMine ? "text-green-200" : "text-gray-400"}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-3 border-t flex gap-2">
                        <Input placeholder="Type a message..." value={messageContent} onChange={e => setMessageContent(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && messageContent.trim()) { sendMessageMutation.mutate({ receiverId: selectedPartner, content: messageContent }); }}}
                          className="flex-1 text-sm" />
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => { if (messageContent.trim()) sendMessageMutation.mutate({ receiverId: selectedPartner, content: messageContent }); }}>
                          Send
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Select a conversation</p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Notifications</h2>
              <div className="space-y-3">
                {(notificationsQuery.data ?? []).map((n: any) => (
                  <Card key={n.id} className={`border-0 shadow-md transition-all ${!n.isRead ? "border-l-4 border-l-green-500" : ""}`}>
                    <CardContent className="p-4 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          n.type === "order" ? "bg-blue-100" : n.type === "message" ? "bg-purple-100" : "bg-green-100"
                        }`}>
                          {n.type === "order" ? <ShoppingCart className="w-4 h-4 text-blue-600" /> :
                           n.type === "message" ? <MessageSquare className="w-4 h-4 text-purple-600" /> :
                           <Bell className="w-4 h-4 text-green-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {!n.isRead && (
                        <Button size="sm" variant="ghost" className="text-xs text-green-600 h-7"
                          onClick={() => markReadMutation.mutate({ id: n.id })}>
                          Mark Read
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {!notificationsQuery.data?.length && (
                  <div className="text-center py-16 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Profile ── */}
          {activeTab === "profile" && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-lg font-semibold text-gray-700">My Profile</h2>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name ?? ""} className="w-16 h-16 rounded-2xl object-cover" />
                    ) : (
                      <div className={`w-16 h-16 ${roleConfig.bgColor} rounded-2xl flex items-center justify-center text-white text-2xl font-bold`}>
                        {(user?.name ?? "?")[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{user?.name}</h3>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <Badge className={`${roleConfig.bgColor} text-white text-xs mt-1`}>{roleConfig.label}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div><p className="text-xs text-gray-400">Phone</p><p className="text-sm text-gray-700">{user?.phone ?? "—"}</p></div>
                    <div><p className="text-xs text-gray-400">Country</p><p className="text-sm text-gray-700">{user?.country ?? "—"}</p></div>
                    <div><p className="text-xs text-gray-400">Region</p><p className="text-sm text-gray-700">{user?.region ?? "—"}</p></div>
                    <div><p className="text-xs text-gray-400">Member Since</p><p className="text-sm text-gray-700">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p></div>
                    {user?.bio && <div className="col-span-2"><p className="text-xs text-gray-400">Bio</p><p className="text-sm text-gray-700">{user.bio}</p></div>}
                  </div>
                  <Button size="sm" variant="outline" className="border-gray-200 text-gray-600 text-xs"
                    onClick={() => navigate("/profile-settings")}>
                    <Settings className="w-3 h-3 mr-1" /> Edit Profile Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Profile Settings ── */}
          {activeTab === "profile_settings" && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">Profile Settings</h2>
                {isProfileComplete && (
                  <Badge className="bg-green-100 text-green-700 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Profile Complete</Badge>
                )}
              </div>

              {/* Basic Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-gray-700">Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Full Name</Label>
                      <Input value={profileForm.name} onChange={e => setProfileForm(f => ({...f, name: e.target.value}))} placeholder="Your full name" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email (read-only)</Label>
                      <Input value={user?.email ?? ""} disabled className="bg-gray-50 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1"><Phone className="w-3 h-3" />Phone Number</Label>
                      <Input value={profileForm.phone} onChange={e => setProfileForm(f => ({...f, phone: e.target.value}))} placeholder="+1 234 567 8900" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1"><MessageCircle className="w-3 h-3" />WhatsApp Number</Label>
                      <Input value={profileForm.whatsapp} onChange={e => setProfileForm(f => ({...f, whatsapp: e.target.value}))} placeholder="+1 234 567 8900" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />Country</Label>
                      <Input value={profileForm.country} onChange={e => setProfileForm(f => ({...f, country: e.target.value}))} placeholder="e.g. Nigeria" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Region / State</Label>
                      <Input value={profileForm.region} onChange={e => setProfileForm(f => ({...f, region: e.target.value}))} placeholder="e.g. Lagos" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Address</Label>
                      <Input value={profileForm.address} onChange={e => setProfileForm(f => ({...f, address: e.target.value}))} placeholder="Street address or area" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Bio / About</Label>
                      <Textarea value={profileForm.bio} onChange={e => setProfileForm(f => ({...f, bio: e.target.value}))} placeholder="Tell buyers and sellers about yourself..." rows={3} />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Profile Photo URL</Label>
                      <Input value={profileForm.avatarUrl} onChange={e => setProfileForm(f => ({...f, avatarUrl: e.target.value}))} placeholder="https://..." />
                      {profileForm.avatarUrl && <img src={profileForm.avatarUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover mt-2" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Online Presence */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-gray-700">Online Presence</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1"><Globe className="w-3 h-3" />Website</Label>
                      <Input value={profileForm.website} onChange={e => setProfileForm(f => ({...f, website: e.target.value}))} placeholder="https://yourwebsite.com" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1"><Linkedin className="w-3 h-3" />LinkedIn</Label>
                      <Input value={profileForm.linkedinUrl} onChange={e => setProfileForm(f => ({...f, linkedinUrl: e.target.value}))} placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1"><Twitter className="w-3 h-3" />Twitter / X</Label>
                      <Input value={profileForm.twitterUrl} onChange={e => setProfileForm(f => ({...f, twitterUrl: e.target.value}))} placeholder="https://twitter.com/..." />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1"><Facebook className="w-3 h-3" />Facebook</Label>
                      <Input value={profileForm.facebookUrl} onChange={e => setProfileForm(f => ({...f, facebookUrl: e.target.value}))} placeholder="https://facebook.com/..." />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1"><Instagram className="w-3 h-3" />Instagram</Label>
                      <Input value={profileForm.instagramUrl} onChange={e => setProfileForm(f => ({...f, instagramUrl: e.target.value}))} placeholder="https://instagram.com/..." />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => updateProfileMutation.mutate(profileForm)}
                disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          )}

          {/* ── Logistics Services ── */}
          {activeTab === "logistics" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">My Logistics Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(logisticsQuery.data ?? []).map((s: any) => (
                  <Card key={s.id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-800">{s.name}</h3>
                      <p className="text-xs text-gray-500">Vehicle: {s.vehicleType} • Capacity: {s.capacity}</p>
                      <p className="text-sm font-bold text-green-700 mt-2">${Number(s.pricePerKm).toFixed(2)}/km</p>
                    </CardContent>
                  </Card>
                ))}
                {!logisticsQuery.data?.length && (
                  <div className="col-span-2 text-center py-16 text-gray-400">
                    <Truck className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-medium text-gray-500">No logistics services listed yet</p>
                    <p className="text-sm mt-1">Add your first service to start receiving bookings</p>
                    <Button size="sm" className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => toast.info("Use the form below to add a service")}>Add Your First Service</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Storage Services ── */}
          {activeTab === "storage_list" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">My Storage Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(storageQuery.data ?? []).map((s: any) => (
                  <Card key={s.id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-800">{s.name}</h3>
                      <p className="text-xs text-gray-500">{s.location} • Capacity: {s.capacity}</p>
                      <p className="text-sm font-bold text-green-700 mt-2">${Number(s.pricePerMonth).toFixed(2)}/month</p>
                    </CardContent>
                  </Card>
                ))}
                {!storageQuery.data?.length && (
                  <div className="col-span-2 text-center py-16 text-gray-400">
                    <Warehouse className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-medium text-gray-500">No storage facilities listed yet</p>
                    <p className="text-sm mt-1">Add your first facility to start receiving storage requests</p>
                    <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => toast.info("Use the form below to add a facility")}>Add Your First Facility</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
