import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { Leaf, Loader2, AlertCircle } from "lucide-react";

/**
 * AuthCallback — handles the Google OAuth redirect PKCE code exchange.
 *
 * When Supabase redirects back here after Google OAuth it appends ?code=...
 * Supabase automatically detects that code and fires onAuthStateChange with
 * event="SIGNED_IN" once the exchange is complete.  We wait for that event
 * (no getSession() race), sync the server cookie, then navigate to /dashboard.
 */
export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const done = useRef(false);

  const syncMutation = trpc.auth.syncSupabaseSession.useMutation();

  useEffect(() => {
    let mounted = true;

    // onAuthStateChange fires as soon as Supabase exchanges the code for a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || done.current) return;

        console.log("[AuthCallback] event:", event, "session:", !!session);

        if (event === "SIGNED_IN" && session) {
          done.current = true; // prevent double-fire
          try {
            await syncMutation.mutateAsync({ accessToken: session.access_token });
            if (mounted) {
              // Server cookie is now set — go to dashboard
              window.location.replace("/dashboard");
            }
          } catch (err: any) {
            if (!mounted) return;
            console.error("[AuthCallback] syncSupabaseSession failed:", err);
            setErrorMsg(err?.message || "Failed to sync session with server");
            setStatus("error");
          }
        }

        // If Supabase itself failed the exchange
        if (event === "USER_UPDATED" || event === "INITIAL_SESSION") {
          // INITIAL_SESSION can fire before SIGNED_IN — ignore if no session
          if (!session) return;
          // treat same as SIGNED_IN in case SIGNED_IN didn't fire
          if (!done.current) {
            done.current = true;
            try {
              await syncMutation.mutateAsync({ accessToken: session.access_token });
              if (mounted) window.location.replace("/dashboard");
            } catch (err: any) {
              if (!mounted) return;
              setErrorMsg(err?.message || "Failed to sync session");
              setStatus("error");
            }
          }
        }
      }
    );

    // Safety timeout — if nothing fires in 15s show an error
    const timeout = setTimeout(() => {
      if (!mounted || done.current) return;
      setErrorMsg("Sign-in timed out. Please try again.");
      setStatus("error");
    }, 15000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/60 p-10 flex flex-col items-center gap-5 max-w-sm w-full">
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
              <p className="text-red-500 text-sm mt-1 font-mono">{errorMsg}</p>
              <p className="text-gray-400 text-xs mt-2">Check the browser console for more details.</p>
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
