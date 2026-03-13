import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf, Eye, EyeOff, Loader2, Chrome, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ROLE_LABELS: Record<string, string> = {
  farmer:           "Farmer",
  buyer:            "Buyer",
  logistics:        "Logistics Partner",
  input_supplier:   "Farm Input Supplier",
  machinery_dealer: "Machinery Dealer",
  storage:          "Storage Partner",
};

const ROLE_ICONS: Record<string, string> = {
  farmer:           "🌾",
  buyer:            "🛒",
  logistics:        "🚛",
  input_supplier:   "🌱",
  machinery_dealer: "🚜",
  storage:          "🏭",
};

type AvailableRole = { userRole: string | null; name: string | null; id: number };

export default function SignIn() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Role selection state (for multi-role accounts)
  const [availableRoles, setAvailableRoles] = useState<AvailableRole[]>([]);
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.requireRoleSelection) {
        // Multiple roles — show role picker
        setAvailableRoles(data.availableRoles as AvailableRole[]);
        setPendingCredentials({ email: form.email, password: form.password });
        return;
      }
      if (data.user) {
        toast.success(`Welcome back, ${data.user.name ?? "there"}!`);
        utils.auth.me.invalidate();
        navigate("/dashboard");
        window.location.reload();
      }
    },
    onError: (err) => {
      toast.error(err.message || "Sign in failed. Please check your credentials.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) { toast.error("Please enter your email and password."); return; }
    loginMutation.mutate({ email: form.email.trim().toLowerCase(), password: form.password });
  };

  const handleRoleSelect = (userRole: string) => {
    if (!pendingCredentials) return;
    loginMutation.mutate({
      email: pendingCredentials.email,
      password: pendingCredentials.password,
      userRole: userRole as any,
    });
  };

  // ── Role selection screen ────────────────────────────────────────────────────
  if (availableRoles.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-3">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Select Your Role</h2>
            <p className="text-gray-500 text-sm mt-1">
              You have multiple accounts. Choose which one to sign in with.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white p-6 space-y-3">
            {availableRoles.map((account) => {
              const roleKey = account.userRole ?? "buyer";
              return (
                <button
                  key={account.id}
                  onClick={() => handleRoleSelect(roleKey)}
                  disabled={loginMutation.isPending}
                  className="w-full flex items-center justify-between px-4 py-4 border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 group disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ROLE_ICONS[roleKey] ?? "👤"}</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">{ROLE_LABELS[roleKey] ?? roleKey}</div>
                      <div className="text-xs text-gray-500">{account.name ?? "Account"}</div>
                    </div>
                  </div>
                  {loginMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => { setAvailableRoles([]); setPendingCredentials(null); }}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main sign-in form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

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
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to your AfriAgroCore account.</p>

          {/* Google Auth */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/dashboard`,
                },
              });
              if (error) {
                toast.error("Google login failed: " + error.message);
              }
            }}
          >
            <Chrome className="w-4 h-4 text-gray-500" />
            Sign in with Google
          </Button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center">
              <span className="text-xs text-gray-400 bg-white px-3">or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <Input
                id="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                required autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Link href="/forgot-password" className="text-xs text-green-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password" type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500 pr-10"
                  required autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In...</>
              ) : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-green-600 hover:text-green-700 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} AfriAgroCore. Connecting Africa's Agricultural Community.
        </p>
      </div>
    </div>
  );
}
