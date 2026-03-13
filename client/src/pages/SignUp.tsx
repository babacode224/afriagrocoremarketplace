import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf, Eye, EyeOff, Loader2, Chrome, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ROLES = [
  { value: "farmer",           label: "Farmer",               description: "Sell your farm produce & livestock" },
  { value: "buyer",            label: "Buyer",                 description: "Purchase fresh produce & farm products" },
  { value: "logistics",        label: "Logistics Partner",     description: "Provide transport & delivery services" },
  { value: "input_supplier",   label: "Farm Input Supplier",   description: "Supply seeds, fertilisers & agrochemicals" },
  { value: "machinery_dealer", label: "Machinery Dealer",      description: "Sell or rent farm machinery & equipment" },
  { value: "storage",          label: "Storage Partner",       description: "Offer cold storage & warehouse facilities" },
] as const;

type UserRole = typeof ROLES[number]["value"];

export default function SignUp() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preselectedRole = params.get("role") as UserRole | null;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    userRole: (preselectedRole && ROLES.find(r => r.value === preselectedRole) ? preselectedRole : "") as UserRole | "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);

  const selectedRole = ROLES.find(r => r.value === form.userRole);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      if (!data.emailSent && data.verifyUrl) {
        setVerifyUrl(data.verifyUrl);
        toast.success(`Welcome, ${data.user.name}! Please verify your email.`);
      } else {
        toast.success(`Welcome to AfriAgroCore, ${data.user.name}! Check your email to verify your account.`);
        navigate("/dashboard");
        window.location.reload();
      }
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userRole) { toast.error("Please select your role to continue."); return; }
    if (!form.name.trim()) { toast.error("Please enter your full name."); return; }
    if (!form.email.trim()) { toast.error("Please enter your email address."); return; }
    if (form.password.length < 4) { toast.error("Password must be at least 4 characters."); return; }
    registerMutation.mutate({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      userRole: form.userRole as UserRole,
      phone: form.phone.trim() || undefined,
      origin: window.location.origin,
    });
  };

  // ── Verification pending screen ──────────────────────────────────────────────
  if (verifyUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
          <p className="text-gray-500 mb-6">
            We sent a verification link to <strong>{form.email}</strong>. Click the link to activate your account.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-amber-700 font-medium mb-1">No email service configured yet</p>
            <p className="text-xs text-amber-600 mb-2">Use this link to verify your account directly:</p>
            <a href={verifyUrl} className="text-xs text-green-700 underline break-all font-mono">{verifyUrl}</a>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => { navigate("/dashboard"); window.location.reload(); }}>
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ── Main sign-up form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-3 cursor-pointer">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-green-800">AfriAgroCore</h1>
                <p className="text-xs text-green-600">Africa's Agricultural Marketplace</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-6">Join thousands of farmers, buyers and agri-partners across Africa.</p>

          {/* Google Auth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/dashboard`,
                  queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                  },
                },
              });
              if (error) {
                toast.error("Google login failed: " + error.message);
              }
            }}
          >
            <Chrome className="w-4 h-4 text-gray-500" />
            Continue with Google
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3 w-fit mx-auto">or sign up with email</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            <div className="space-y-1">
              <Label className="text-gray-700 font-medium">I am a <span className="text-red-500">*</span></Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    form.userRole ? "border-green-400 bg-green-50 text-gray-800" : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  <span>{selectedRole ? selectedRole.label : "Select your role..."}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showRoleDropdown ? "rotate-180" : ""}`} />
                </button>
                {showRoleDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {ROLES.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => { setForm({ ...form, userRole: role.value }); setShowRoleDropdown(false); }}
                        className={`w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0 ${
                          form.userRole === role.value ? "bg-green-50" : ""
                        }`}
                      >
                        <div className="font-medium text-sm text-gray-800">{role.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{role.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-gray-700 font-medium">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="name" type="text" placeholder="e.g. Amara Diallo"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="password" type={showPassword ? "text" : "password"}
                  placeholder="Minimum 4 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Phone (optional) */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Phone Number <span className="text-gray-400 font-normal text-xs">(optional — can be added later)</span>
              </Label>
              <Input
                id="phone" type="tel" placeholder="+234 800 000 0000"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg mt-2"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...</>
              ) : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>

          <p className="text-center text-gray-400 text-xs mt-4">
            By creating an account you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span> and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} AfriAgroCore. Connecting Africa's Agricultural Community.
        </p>
      </div>
    </div>
  );
}
