import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { Leaf, Loader2, AlertCircle } from "lucide-react";

/**
 * AuthCallback — handles the Google OAuth redirect.
 *
 * Flow:
 *  1. Supabase exchanges the `code` in the URL for a session (automatic).
 *  2. We call syncSupabaseSession to set the server-side cookie.
 *  3. We redirect to /dashboard — by this point the cookie exists, so
 *     getProfile() will succeed immediately with no race condition.
 */
export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const syncMutation = trpc.auth.syncSupabaseSession.useMutation();

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      try {
        // Supabase automatically exchanges the code/hash for a session.
        // getSession() will have the new session once Supabase processes the URL.
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          // Wait a moment and retry once — Supabase needs a tick to process the hash
          await new Promise((r) => setTimeout(r, 1500));
          const retry = await supabase.auth.getSession();
          if (!retry.data.session) {
            throw new Error(error?.message || "No session after OAuth callback");
          }
          data.session = retry.data.session;
        }

        if (!mounted) return;

        // Sync the Supabase session → sets the server cookie
        await syncMutation.mutateAsync({ accessToken: data.session.access_token });

        if (!mounted) return;

        // Navigate to dashboard — cookie is now set, no race condition
        window.location.replace("/dashboard");
      } catch (err: any) {
        if (!mounted) return;
        console.error("[AuthCallback] Error:", err);
        setErrorMsg(err?.message || "Authentication failed");
        setStatus("error");
      }
    }

    handleCallback();

    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/60 p-10 flex flex-col items-center gap-5 max-w-sm w-full">
        {/* Logo */}
        <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Leaf className="w-8 h-8 text-white" />
        </div>

        {status === "loading" ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <div className="text-center">
              <p className="text-gray-800 font-semibold text-lg">Signing you in…</p>
              <p className="text-gray-500 text-sm mt-1">Just a moment while we set up your session.</p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div className="text-center">
              <p className="text-gray-800 font-semibold text-lg">Sign-in failed</p>
              <p className="text-gray-500 text-sm mt-1">{errorMsg}</p>
            </div>
            <a
              href="/signin"
              className="mt-2 w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Try again
            </a>
          </>
        )}
      </div>
    </div>
  );
}
