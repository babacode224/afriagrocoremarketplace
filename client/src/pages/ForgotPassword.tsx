import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf, Loader2, Mail, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const resetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      // In dev mode (no SMTP), the reset URL is returned for testing
      if (data.resetUrl) setDevResetUrl(data.resetUrl);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email address."); return; }
    resetMutation.mutate({ email: email.trim().toLowerCase(), origin: window.location.origin });
  };

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
          {submitted ? (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                The link expires in <strong>1 hour</strong>.
              </p>
              <p className="text-gray-400 text-xs">
                Didn't receive it? Check your spam folder, or{" "}
                <button
                  type="button"
                  className="text-green-600 hover:underline font-medium"
                  onClick={() => { setSubmitted(false); setDevResetUrl(null); }}
                >
                  try again
                </button>.
              </p>

              {/* Dev mode: show reset URL when no SMTP is configured */}
              {devResetUrl && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Dev Mode — No SMTP configured</p>
                  <p className="text-xs text-amber-600 mb-2">Use this link to reset the password:</p>
                  <a
                    href={devResetUrl}
                    className="text-xs text-green-700 underline break-all"
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}

              <Link href="/signin">
                <Button variant="outline" className="mt-4 w-full border-gray-200">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Forgot your password?</h2>
                <p className="text-gray-500 text-sm">
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Reset Link...</>
                  ) : (
                    <><Mail className="w-4 h-4 mr-2" /> Send Reset Link</>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/signin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} AfriAgroCore. Connecting Africa's Agricultural Community.
        </p>
      </div>
    </div>
  );
}
