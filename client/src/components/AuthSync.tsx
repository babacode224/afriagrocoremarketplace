import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";

export function AuthSync() {
  const syncMutation = trpc.auth.syncSupabaseSession.useMutation();
  const utils = trpc.useUtils();
  // Use a ref so we don't re-register the listener on re-renders
  const syncedTokens = useRef<Set<string>>(new Set());
  const isSyncing = useRef(false);

  useEffect(() => {
    // Register the auth state listener ONCE only
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.access_token) {
        if (event === "SIGNED_OUT") {
          syncedTokens.current.clear();
        }
        return;
      }

      // Only sync on SIGNED_IN or INITIAL_SESSION
      if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION") return;

      const token = session.access_token;

      // Prevent duplicate syncs for the same token
      if (syncedTokens.current.has(token) || isSyncing.current) return;

      isSyncing.current = true;

      try {
        console.log("[AuthSync] Syncing session for event:", event);
        await syncMutation.mutateAsync({ accessToken: token });

        syncedTokens.current.add(token);

        // Invalidate queries so tRPC picks up the new session
        await utils.auth.me.invalidate();
        await utils.auth.getProfile.invalidate();

        console.log("[AuthSync] Session synced successfully.");

        // Only redirect/reload when the user was on the signin/signup page
        // OR when there are OAuth tokens in the URL (i.e., coming back from Google OAuth)
        const isOnAuthPage =
          window.location.pathname === "/signin" ||
          window.location.pathname === "/signup";
        const hasOAuthTokens =
          window.location.hash.includes("access_token") ||
          window.location.search.includes("code=");

        if (isOnAuthPage || hasOAuthTokens) {
          console.log("[AuthSync] Redirecting to dashboard after auth.");
          // Use replace to avoid back-button going back to signin
          window.location.replace("/dashboard");
        }
      } catch (error) {
        console.error("[AuthSync] Failed to sync session:", error);
      } finally {
        isSyncing.current = false;
      }
    });

    // Cleanup: unsubscribe when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps — register once only

  return null;
}
