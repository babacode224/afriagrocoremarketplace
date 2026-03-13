import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Leaf, ShoppingCart, Truck, Warehouse, Sprout, Wrench,
  User, MapPin, Phone, Globe, CheckCircle, ArrowRight,
  Building2, Tractor, Package, Info
} from "lucide-react";

// ── Role metadata ────────────────────────────────────────────────────────────
const ROLE_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  farmer:          { label: "Farmer",           icon: Leaf,         color: "text-green-700",  bg: "bg-green-600" },
  buyer:           { label: "Buyer",            icon: ShoppingCart, color: "text-blue-700",   bg: "bg-blue-600" },
  logistics:       { label: "Logistics Partner",icon: Truck,        color: "text-orange-700", bg: "bg-orange-600" },
  storage:         { label: "Storage Partner",  icon: Warehouse,    color: "text-purple-700", bg: "bg-purple-600" },
  input_supplier:  { label: "Input Supplier",   icon: Sprout,       color: "text-yellow-700", bg: "bg-yellow-600" },
  machinery_dealer:{ label: "Machinery Dealer", icon: Wrench,       color: "text-red-700",    bg: "bg-red-600" },
};

// ── Multi-select tag input ───────────────────────────────────────────────────
function TagInput({
  label, value, onChange, options, placeholder
}: {
  label: string; value: string[]; onChange: (v: string[]) => void;
  options: string[]; placeholder?: string;
}) {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              value.includes(opt)
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
            }`}>
            {opt}
          </button>
        ))}
      </div>
      {placeholder && value.length === 0 && (
        <p className="text-xs text-gray-400">{placeholder}</p>
      )}
    </div>
  );
}

// ── Select input ─────────────────────────────────────────────────────────────
function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
        required={required}
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Text field ───────────────────────────────────────────────────────────────
function TextField({ label, value, onChange, placeholder, required, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
interface ProfileSettingsProps {
  /** When true, this page is shown as a gate — user cannot skip */
  isGated?: boolean;
}

export default function ProfileSettings({ isGated = false }: ProfileSettingsProps) {
  const [, navigate] = useLocation();
  const { user: authUser, refresh: refreshAuth } = useAuth();
  const authLoading = false; // useAuth is synchronous from JWT context
  const meQuery = trpc.auth.getProfile.useQuery(undefined, { retry: false });
  const user = meQuery.data as any;
  const userRole: string = user?.userRole ?? "buyer";
  const meta = ROLE_META[userRole] ?? ROLE_META.buyer;
  const RoleIcon = meta.icon;

  // ── Redirect unauthenticated users ────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !authUser) navigate("/signin");
  }, [authLoading, authUser, navigate]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    // Common
    name: "", phone: "", country: "", region: "", district: "",
    bio: "", avatarUrl: "", whatsapp: "", address: "",
    website: "", linkedinUrl: "", twitterUrl: "", facebookUrl: "", instagramUrl: "",
    // Farmer
    farmName: "", farmSize: "", farmerType: [] as string[],
    cropTypes: [] as string[], livestockTypes: [] as string[],
    farmingPractices: [] as string[], certifications: [] as string[],
    // Buyer
    buyerType: "", productInterests: [] as string[],
    purchaseFrequency: "", preferredPayment: "",
    // Logistics
    companyName: "", servicesOffered: [] as string[], serviceArea: [] as string[],
    vehicleTypes: [] as string[], fleetSize: "", coldChain: false,
    // Storage
    facilityName: "", facilityType: "", capacity: "",
    storageFeatures: [] as string[],
    // Input Supplier
    productCategories: [] as string[], brands: "", deliveryOptions: [] as string[],
    // Machinery Dealer
    serviceType: "", machineryTypes: [] as string[], rentalAvailable: false,
    // Prefs
    showContactInfo: true, emailNotifications: true, smsNotifications: false,
  });

  const [initialized, setInitialized] = useState(false);

  // Populate form from existing user data
  useEffect(() => {
    if (user && !initialized) {
      setInitialized(true);
      const parse = (v: any) => {
        if (!v) return [];
        try { return JSON.parse(v); } catch { return v.split(",").map((s: string) => s.trim()).filter(Boolean); }
      };
      setForm(prev => ({
        ...prev,
        name: user.name ?? "",
        phone: user.phone ?? "",
        country: user.country ?? "",
        region: user.region ?? "",
        district: user.district ?? "",
        bio: user.bio ?? "",
        avatarUrl: user.avatarUrl ?? "",
        whatsapp: user.whatsapp ?? "",
        address: user.address ?? "",
        website: user.website ?? "",
        linkedinUrl: user.linkedinUrl ?? "",
        twitterUrl: user.twitterUrl ?? "",
        facebookUrl: user.facebookUrl ?? "",
        instagramUrl: user.instagramUrl ?? "",
        farmName: user.farmName ?? "",
        farmSize: user.farmSize ?? "",
        farmerType: parse(user.farmerType),
        cropTypes: parse(user.cropTypes),
        livestockTypes: parse(user.livestockTypes),
        farmingPractices: parse(user.farmingPractices),
        certifications: parse(user.certifications),
        buyerType: user.buyerType ?? "",
        productInterests: parse(user.productInterests),
        purchaseFrequency: user.purchaseFrequency ?? "",
        preferredPayment: user.preferredPayment ?? "",
        companyName: user.companyName ?? "",
        servicesOffered: parse(user.servicesOffered),
        serviceArea: parse(user.serviceArea),
        vehicleTypes: parse(user.vehicleTypes),
        fleetSize: user.fleetSize?.toString() ?? "",
        coldChain: user.coldChain ?? false,
        facilityName: user.facilityName ?? "",
        facilityType: user.facilityType ?? "",
        capacity: user.capacity ?? "",
        storageFeatures: parse(user.storageFeatures),
        productCategories: parse(user.productCategories),
        brands: user.brands ?? "",
        deliveryOptions: parse(user.deliveryOptions),
        serviceType: user.serviceType ?? "",
        machineryTypes: parse(user.machineryTypes),
        rentalAvailable: user.rentalAvailable ?? false,
        showContactInfo: user.showContactInfo ?? true,
        emailNotifications: user.emailNotifications ?? true,
        smsNotifications: user.smsNotifications ?? false,
      }));
    }
  }, [user, initialized]);

  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: (data) => {
      toast.success("Profile saved successfully!");
      meQuery.refetch();
      if (data.profileCompleted && isGated) {
        navigate("/dashboard");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  // ── Serialise arrays to JSON strings for the API ──────────────────────────
  const arr = (v: string[]) => v.length ? JSON.stringify(v) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: form.name || undefined,
      phone: form.phone || undefined,
      country: form.country || undefined,
      region: form.region || undefined,
      district: form.district || undefined,
      bio: form.bio || undefined,
      avatarUrl: form.avatarUrl || undefined,
      whatsapp: form.whatsapp || undefined,
      address: form.address || undefined,
      website: form.website || undefined,
      linkedinUrl: form.linkedinUrl || undefined,
      twitterUrl: form.twitterUrl || undefined,
      facebookUrl: form.facebookUrl || undefined,
      instagramUrl: form.instagramUrl || undefined,
      // Farmer
      farmName: form.farmName || undefined,
      farmSize: form.farmSize || undefined,
      farmerType: arr(form.farmerType),
      cropTypes: arr(form.cropTypes),
      livestockTypes: arr(form.livestockTypes),
      farmingPractices: arr(form.farmingPractices),
      certifications: arr(form.certifications),
      // Buyer
      buyerType: form.buyerType || undefined,
      productInterests: arr(form.productInterests),
      purchaseFrequency: form.purchaseFrequency || undefined,
      preferredPayment: form.preferredPayment || undefined,
      // Logistics
      companyName: form.companyName || undefined,
      servicesOffered: arr(form.servicesOffered),
      serviceArea: arr(form.serviceArea),
      vehicleTypes: arr(form.vehicleTypes),
      fleetSize: form.fleetSize ? parseInt(form.fleetSize) : undefined,
      coldChain: form.coldChain,
      // Storage
      facilityName: form.facilityName || undefined,
      facilityType: form.facilityType || undefined,
      capacity: form.capacity || undefined,
      storageFeatures: arr(form.storageFeatures),
      // Input Supplier
      productCategories: arr(form.productCategories),
      brands: form.brands || undefined,
      deliveryOptions: arr(form.deliveryOptions),
      // Machinery Dealer
      serviceType: form.serviceType || undefined,
      machineryTypes: arr(form.machineryTypes),
      rentalAvailable: form.rentalAvailable,
      // Prefs
      showContactInfo: form.showContactInfo,
      emailNotifications: form.emailNotifications,
      smsNotifications: form.smsNotifications,
    });
  };

  // ── Compute progress ──────────────────────────────────────────────────────
  const requiredFields: Record<string, string[]> = {
    farmer:          ["name", "country", "district", "farmName", "farmerType"],
    buyer:           ["name", "country", "district"],
    logistics:       ["name", "companyName", "servicesOffered", "serviceArea", "country"],
    storage:         ["name", "facilityName", "facilityType", "capacity", "country", "district"],
    input_supplier:  ["name", "companyName", "productCategories", "country", "district"],
    machinery_dealer:["name", "companyName", "serviceType", "country", "district"],
  };
  const req = requiredFields[userRole] ?? requiredFields.buyer;
  const filled = req.filter(f => {
    const v = (form as any)[f];
    return Array.isArray(v) ? v.length > 0 : !!v;
  });
  const progress = Math.round((filled.length / req.length) * 100);
  const isComplete = filled.length === req.length;

  if (authLoading || meQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${meta.bg} rounded-xl flex items-center justify-center`}>
              <RoleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base">
                {isGated ? "Complete Your Profile" : "Profile Settings"}
              </h1>
              <p className="text-xs text-gray-500">{meta.label} Account</p>
            </div>
          </div>
          {!isGated && (
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Progress card */}
        <div className={`rounded-2xl p-5 border ${isComplete ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isComplete
                ? <CheckCircle className="w-5 h-5 text-green-600" />
                : <Info className="w-5 h-5 text-amber-600" />
              }
              <span className={`font-semibold text-sm ${isComplete ? "text-green-800" : "text-amber-800"}`}>
                {isComplete ? "Profile Complete!" : `Profile ${progress}% complete`}
              </span>
            </div>
            <Badge className={isComplete ? "bg-green-600 text-white" : "bg-amber-600 text-white"}>
              {filled.length}/{req.length} required fields
            </Badge>
          </div>
          <ProgressBar pct={progress} />
          {!isComplete && (
            <p className="text-xs text-amber-700 mt-2">
              Fill in all required fields (<span className="text-red-500 font-medium">*</span>) to unlock your dashboard.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Section 1: Basic Info ─────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-gray-800 text-sm">Basic Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TextField label="Full Name" value={form.name} onChange={v => setForm(f => ({...f, name: v}))}
                placeholder="Your full name" required />
              <TextField label="Email Address" value={user?.email ?? ""} onChange={() => {}}
                placeholder="" />
              <TextField label="Phone Number" value={form.phone} onChange={v => setForm(f => ({...f, phone: v}))}
                placeholder="+234 800 000 0000" type="tel" />
              <TextField label="WhatsApp Number" value={form.whatsapp} onChange={v => setForm(f => ({...f, whatsapp: v}))}
                placeholder="+234 800 000 0000" type="tel" />
              <div className="col-span-full space-y-1">
                <Label>Bio / About</Label>
                <Textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))}
                  placeholder="Tell buyers and sellers about yourself..."
                  rows={3} className="resize-none" />
              </div>
              <TextField label="Profile Photo URL" value={form.avatarUrl} onChange={v => setForm(f => ({...f, avatarUrl: v}))}
                placeholder="https://..." />
            </div>
          </section>

          {/* ── Section 2: Location ──────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-gray-800 text-sm">Location</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TextField label="Country" value={form.country} onChange={v => setForm(f => ({...f, country: v}))}
                placeholder="e.g. Nigeria" required />
              <TextField label="State / Region" value={form.region} onChange={v => setForm(f => ({...f, region: v}))}
                placeholder="e.g. Lagos State" />
              <TextField label="District / LGA" value={form.district} onChange={v => setForm(f => ({...f, district: v}))}
                placeholder="e.g. Ikeja" required={["farmer","buyer","storage","input_supplier","machinery_dealer"].includes(userRole)} />
              <TextField label="Full Address" value={form.address} onChange={v => setForm(f => ({...f, address: v}))}
                placeholder="Street address" />
            </div>
          </section>

          {/* ── Section 3: Role-specific fields ─────────────────────────── */}
          {userRole === "farmer" && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-600" />
                <h2 className="font-semibold text-gray-800 text-sm">Farm Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextField label="Farm Name" value={form.farmName} onChange={v => setForm(f => ({...f, farmName: v}))}
                  placeholder="e.g. Green Valley Farm" required />
                <SelectField label="Farm Size" value={form.farmSize} onChange={v => setForm(f => ({...f, farmSize: v}))}
                  options={[
                    { value: "small", label: "Small (< 5 acres)" },
                    { value: "medium", label: "Medium (5–50 acres)" },
                    { value: "large", label: "Large (50–500 acres)" },
                    { value: "commercial", label: "Commercial (500+ acres)" },
                  ]} />
                <div className="col-span-full">
                  <TagInput label="Farmer Type *" value={form.farmerType}
                    onChange={v => setForm(f => ({...f, farmerType: v}))}
                    options={["Crop Farmer", "Livestock Farmer", "Mixed Farmer", "Aquaculture", "Horticulture", "Organic Farmer"]}
                    placeholder="Select at least one type" />
                </div>
                <div className="col-span-full">
                  <TagInput label="Crops Grown" value={form.cropTypes}
                    onChange={v => setForm(f => ({...f, cropTypes: v}))}
                    options={["Maize", "Rice", "Cassava", "Yam", "Tomatoes", "Peppers", "Onions", "Soybeans", "Groundnuts", "Plantain", "Cocoa", "Coffee", "Cotton"]} />
                </div>
                <div className="col-span-full">
                  <TagInput label="Livestock" value={form.livestockTypes}
                    onChange={v => setForm(f => ({...f, livestockTypes: v}))}
                    options={["Cattle", "Goats", "Sheep", "Pigs", "Poultry", "Fish", "Rabbits"]} />
                </div>
                <div className="col-span-full">
                  <TagInput label="Farming Practices" value={form.farmingPractices}
                    onChange={v => setForm(f => ({...f, farmingPractices: v}))}
                    options={["Organic", "Conventional", "Irrigation", "Greenhouse", "Hydroponics", "Agroforestry"]} />
                </div>
                <div className="col-span-full">
                  <TagInput label="Certifications" value={form.certifications}
                    onChange={v => setForm(f => ({...f, certifications: v}))}
                    options={["Organic Certified", "GlobalGAP", "NAFDAC", "SON", "Fairtrade"]} />
                </div>
              </div>
            </section>
          )}

          {userRole === "buyer" && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <h2 className="font-semibold text-gray-800 text-sm">Buyer Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SelectField label="Buyer Type" value={form.buyerType} onChange={v => setForm(f => ({...f, buyerType: v}))}
                  options={[
                    { value: "individual", label: "Individual Consumer" },
                    { value: "retailer", label: "Retailer" },
                    { value: "wholesaler", label: "Wholesaler" },
                    { value: "processor", label: "Food Processor" },
                    { value: "exporter", label: "Exporter" },
                    { value: "ngo", label: "NGO / Aid Organisation" },
                  ]} />
                <SelectField label="Purchase Frequency" value={form.purchaseFrequency}
                  onChange={v => setForm(f => ({...f, purchaseFrequency: v}))}
                  options={[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                    { value: "seasonal", label: "Seasonal" },
                  ]} />
                <SelectField label="Preferred Payment" value={form.preferredPayment}
                  onChange={v => setForm(f => ({...f, preferredPayment: v}))}
                  options={[
                    { value: "bank_transfer", label: "Bank Transfer" },
                    { value: "mobile_money", label: "Mobile Money" },
                    { value: "cash", label: "Cash on Delivery" },
                    { value: "credit", label: "Trade Credit" },
                  ]} />
                <div className="col-span-full">
                  <TagInput label="Product Interests" value={form.productInterests}
                    onChange={v => setForm(f => ({...f, productInterests: v}))}
                    options={["Fresh Produce", "Grains & Cereals", "Livestock", "Dairy", "Processed Foods", "Farm Inputs", "Machinery"]} />
                </div>
              </div>
            </section>
          )}

          {userRole === "logistics" && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-600" />
                <h2 className="font-semibold text-gray-800 text-sm">Logistics Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextField label="Company / Business Name" value={form.companyName}
                  onChange={v => setForm(f => ({...f, companyName: v}))}
                  placeholder="e.g. FastMove Logistics" required />
                <TextField label="Fleet Size" value={form.fleetSize}
                  onChange={v => setForm(f => ({...f, fleetSize: v}))}
                  placeholder="Number of vehicles" type="number" />
                <div className="col-span-full">
                  <TagInput label="Services Offered *" value={form.servicesOffered}
                    onChange={v => setForm(f => ({...f, servicesOffered: v}))}
                    options={["Farm Pickup", "Last-Mile Delivery", "Cold Chain", "Bulk Transport", "Cross-Border", "Warehousing"]}
                    placeholder="Select at least one service" />
                </div>
                <div className="col-span-full">
                  <TagInput label="Service Area *" value={form.serviceArea}
                    onChange={v => setForm(f => ({...f, serviceArea: v}))}
                    options={["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Kaduna", "Enugu", "Onitsha", "Nationwide"]}
                    placeholder="Select coverage areas" />
                </div>
                <div className="col-span-full">
                  <TagInput label="Vehicle Types" value={form.vehicleTypes}
                    onChange={v => setForm(f => ({...f, vehicleTypes: v}))}
                    options={["Motorcycle", "Tricycle", "Pickup Truck", "Mini Van", "Refrigerated Truck", "Flatbed Truck", "Container Truck"]} />
                </div>
                <div className="col-span-full flex items-center gap-3">
                  <input type="checkbox" id="coldChain" checked={form.coldChain}
                    onChange={e => setForm(f => ({...f, coldChain: e.target.checked}))}
                    className="w-4 h-4 text-green-600 rounded" />
                  <Label htmlFor="coldChain">Cold chain / refrigerated transport available</Label>
                </div>
              </div>
            </section>
          )}

          {userRole === "storage" && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-purple-600" />
                <h2 className="font-semibold text-gray-800 text-sm">Storage Facility Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextField label="Facility Name" value={form.facilityName}
                  onChange={v => setForm(f => ({...f, facilityName: v}))}
                  placeholder="e.g. CoolStore Warehouse" required />
                <SelectField label="Facility Type" value={form.facilityType}
                  onChange={v => setForm(f => ({...f, facilityType: v}))}
                  options={[
                    { value: "cold_room", label: "Cold Room" },
                    { value: "dry_warehouse", label: "Dry Warehouse" },
                    { value: "silo", label: "Grain Silo" },
                    { value: "open_yard", label: "Open Yard" },
                  ]} required />
                <TextField label="Capacity" value={form.capacity}
                  onChange={v => setForm(f => ({...f, capacity: v}))}
                  placeholder="e.g. 500 tonnes" required />
                <div className="col-span-full">
                  <TagInput label="Storage Features" value={form.storageFeatures}
                    onChange={v => setForm(f => ({...f, storageFeatures: v}))}
                    options={["Temperature Control", "Humidity Control", "24/7 Security", "CCTV", "Fire Suppression", "Fumigation", "Pest Control"]} />
                </div>
              </div>
            </section>
          )}

          {userRole === "input_supplier" && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-yellow-600" />
                <h2 className="font-semibold text-gray-800 text-sm">Input Supplier Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextField label="Company / Business Name" value={form.companyName}
                  onChange={v => setForm(f => ({...f, companyName: v}))}
                  placeholder="e.g. AgroInputs Ltd" required />
                <TextField label="Brands Carried" value={form.brands}
                  onChange={v => setForm(f => ({...f, brands: v}))}
                  placeholder="e.g. Syngenta, BASF, Notore" />
                <div className="col-span-full">
                  <TagInput label="Product Categories *" value={form.productCategories}
                    onChange={v => setForm(f => ({...f, productCategories: v}))}
                    options={["Seeds", "Fertilisers", "Pesticides", "Herbicides", "Irrigation Equipment", "Soil Amendments", "Animal Feed", "Veterinary Supplies"]}
                    placeholder="Select at least one category" />
                </div>
                <div className="col-span-full">
                  <TagInput label="Delivery Options" value={form.deliveryOptions}
                    onChange={v => setForm(f => ({...f, deliveryOptions: v}))}
                    options={["Pickup Only", "Local Delivery", "Nationwide Delivery", "Express Delivery"]} />
                </div>
              </div>
            </section>
          )}

          {userRole === "machinery_dealer" && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Tractor className="w-4 h-4 text-red-600" />
                <h2 className="font-semibold text-gray-800 text-sm">Machinery Dealer Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextField label="Company / Business Name" value={form.companyName}
                  onChange={v => setForm(f => ({...f, companyName: v}))}
                  placeholder="e.g. AgriMach Nigeria" required />
                <SelectField label="Service Type" value={form.serviceType}
                  onChange={v => setForm(f => ({...f, serviceType: v}))}
                  options={[
                    { value: "sales", label: "Sales Only" },
                    { value: "rental", label: "Rental Only" },
                    { value: "both", label: "Sales & Rental" },
                    { value: "repair", label: "Repair & Maintenance" },
                  ]} required />
                <div className="col-span-full">
                  <TagInput label="Machinery Types" value={form.machineryTypes}
                    onChange={v => setForm(f => ({...f, machineryTypes: v}))}
                    options={["Tractors", "Harvesters", "Ploughs", "Irrigation Systems", "Sprayers", "Threshers", "Planters", "Grain Dryers", "Milking Machines"]} />
                </div>
                <div className="col-span-full flex items-center gap-3">
                  <input type="checkbox" id="rentalAvailable" checked={form.rentalAvailable}
                    onChange={e => setForm(f => ({...f, rentalAvailable: e.target.checked}))}
                    className="w-4 h-4 text-green-600 rounded" />
                  <Label htmlFor="rentalAvailable">Rental / hire-purchase available</Label>
                </div>
              </div>
            </section>
          )}

          {/* ── Section 4: Online Presence ───────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-gray-800 text-sm">Online Presence</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TextField label="Website" value={form.website} onChange={v => setForm(f => ({...f, website: v}))}
                placeholder="https://yourwebsite.com" />
              <TextField label="LinkedIn" value={form.linkedinUrl} onChange={v => setForm(f => ({...f, linkedinUrl: v}))}
                placeholder="https://linkedin.com/in/..." />
              <TextField label="Twitter / X" value={form.twitterUrl} onChange={v => setForm(f => ({...f, twitterUrl: v}))}
                placeholder="https://twitter.com/..." />
              <TextField label="Facebook" value={form.facebookUrl} onChange={v => setForm(f => ({...f, facebookUrl: v}))}
                placeholder="https://facebook.com/..." />
              <TextField label="Instagram" value={form.instagramUrl} onChange={v => setForm(f => ({...f, instagramUrl: v}))}
                placeholder="https://instagram.com/..." />
            </div>
          </section>

          {/* ── Section 5: Preferences ───────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-gray-800 text-sm">Preferences</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { id: "showContactInfo", label: "Show my contact info on public profile", key: "showContactInfo" as const },
                { id: "emailNotifications", label: "Receive email notifications", key: "emailNotifications" as const },
                { id: "smsNotifications", label: "Receive SMS notifications", key: "smsNotifications" as const },
              ].map(({ id, label, key }) => (
                <div key={id} className="flex items-center gap-3">
                  <input type="checkbox" id={id} checked={form[key] as boolean}
                    onChange={e => setForm(f => ({...f, [key]: e.target.checked}))}
                    className="w-4 h-4 text-green-600 rounded" />
                  <Label htmlFor={id}>{label}</Label>
                </div>
              ))}
            </div>
          </section>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pb-8">
            {!isGated && (
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className={`${meta.bg} hover:opacity-90 text-white px-8 ${isGated ? "w-full" : ""}`}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : (
                isComplete
                  ? <><CheckCircle className="w-4 h-4 mr-2" /> Save & Go to Dashboard</>
                  : <><ArrowRight className="w-4 h-4 mr-2" /> Save Profile</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
