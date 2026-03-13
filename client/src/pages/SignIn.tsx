import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Leaf, Loader2, ShieldCheck, Zap, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      toast.error("Google sign-in failed: " + error.message);
      setLoading(false);
    }
    // If successful, browser will redirect to Google — no need to reset loading
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <div className="inline-flex items-center gap-3 cursor-pointer">
              <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-green-800">AfriAgroCore</h1>
                <p className="text-sm text-green-600">Africa's Agricultural Marketplace</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/60 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AfriAgroCore</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sign in with your Google account to access the platform.
              <br />New users will be onboarded automatically.
            </p>
          </div>

          {/* Google Button */}
          <Button
            type="button"
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-base"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                Redirecting to Google...
              </>
            ) : (
              <>
                {/* Google "G" logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          {/* Trust signals */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5 text-center p-3 bg-green-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="text-xs text-gray-600 font-medium">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center p-3 bg-green-50 rounded-xl">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="text-xs text-gray-600 font-medium">Fast</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center p-3 bg-green-50 rounded-xl">
              <Globe className="w-5 h-5 text-green-600" />
              <span className="text-xs text-gray-600 font-medium">Pan-Africa</span>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6 leading-relaxed">
            By signing in, you agree to our{" "}
            <span className="underline cursor-pointer text-gray-500 hover:text-gray-700">Terms of Service</span>{" "}
            and{" "}
            <span className="underline cursor-pointer text-gray-500 hover:text-gray-700">Privacy Policy</span>.
          </p>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} AfriAgroCore. Connecting Africa's Agricultural Community.
        </p>
      </div>
    </div>
  );
}
