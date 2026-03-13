import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Leaf, Loader2, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, Lock } from "lucide-react";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      toast.success("Password reset successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Reset failed. The link may have expired.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (form.newPassword !== form.confirmPassword) { toast.error("Passwords do not match."); return; }
    if (!token) { toast.error("Invalid reset link. Please request a new one."); return; }
    resetMutation.mutate({ token, newPassword: form.newPassword });
  };

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Invalid Reset Link</h2>
            <p className="text-gray-500 text-sm">This password reset link is missing or malformed. Please request a new one.</p>
            <Link href="/forgot-password">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white mt-2">Request New Link</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          {success ? (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Password Reset!</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold mt-2"
                onClick={() => navigate("/signin")}
              >
                Sign In Now
              </Button>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Set a new password</h2>
                <p className="text-gray-500 text-sm">
                  Choose a strong password of at least 6 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="newPassword" className="text-gray-700 font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500 pr-10"
                      required
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className={`border-gray-200 focus:border-green-500 focus:ring-green-500 pr-10 ${
                        form.confirmPassword && form.confirmPassword !== form.newPassword
                          ? "border-red-300 focus:border-red-400"
                          : ""
                      }`}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting Password...</>
                  ) : (
                    <><Lock className="w-4 h-4 mr-2" /> Reset Password</>
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
