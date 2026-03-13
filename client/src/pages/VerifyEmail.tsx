import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") ?? "";
  const [done, setDone] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data) => {
      setDone(true);
      setAlreadyVerified(data.alreadyVerified ?? false);
    },
    onError: (err) => {
      setError(err.message || "Verification failed. The link may have expired.");
    },
  });

  useEffect(() => {
    if (token && !done && !error && !verifyMutation.isPending) {
      verifyMutation.mutate({ token });
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <Link href="/">
          <div className="inline-flex items-center gap-2 mb-8 cursor-pointer">
            <div className="w-10 h-10 bg-[#E85D04] rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M12 2C8 2 4 5 4 9c0 2 1 4 2 5l6 8 6-8c1-1 2-3 2-5 0-4-4-7-8-7zm0 9a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">AfriAgroCore</span>
          </div>
        </Link>

        {/* Loading */}
        {verifyMutation.isPending && (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 text-green-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-gray-800">Verifying your email…</h2>
            <p className="text-gray-500 text-sm">Please wait a moment.</p>
          </div>
        )}

        {/* No token */}
        {!token && !verifyMutation.isPending && (
          <div className="space-y-4">
            <Mail className="w-16 h-16 text-gray-300 mx-auto" />
            <h2 className="text-xl font-bold text-gray-800">Check your inbox</h2>
            <p className="text-gray-500 text-sm">
              We sent a verification link to your email address. Click the link in the email to verify your account.
            </p>
            <Link href="/dashboard">
              <Button className="bg-green-600 hover:bg-green-700 text-white w-full mt-4">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        )}

        {/* Success */}
        {done && !error && (
          <div className="space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-800">
              {alreadyVerified ? "Already verified!" : "Email verified!"}
            </h2>
            <p className="text-gray-500 text-sm">
              {alreadyVerified
                ? "Your email address was already verified. You're all set."
                : "Your email address has been successfully verified. Your account is now fully active."}
            </p>
            <Link href="/dashboard">
              <Button className="bg-green-600 hover:bg-green-700 text-white w-full mt-4">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="space-y-4">
            <XCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-gray-800">Verification failed</h2>
            <p className="text-gray-500 text-sm">{error}</p>
            <p className="text-gray-400 text-xs">
              The link may have already been used or has expired. You can request a new verification link from your dashboard.
            </p>
            <Link href="/dashboard">
              <Button className="bg-green-600 hover:bg-green-700 text-white w-full mt-4">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
