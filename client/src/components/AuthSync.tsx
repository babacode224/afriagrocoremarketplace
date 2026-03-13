import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function AuthSync() {
  const syncMutation = trpc.auth.syncSupabaseSession.useMutation();
  const utils = trpc.useUtils();
  const [location, navigate] = useLocation();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      // When a user successfully authenticates via Google (or any Supabase provider),
      // they get a session. We need to sync this with our legacy tRPC cookie system.
      if (session?.access_token && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        try {
          // Prevent multiple syncs in a row
          if (window.sessionStorage.getItem("auth_sync_" + session.access_token)) {
            return;
          }
          await syncMutation.mutateAsync({
            accessToken: session.access_token,
          });
          
          window.sessionStorage.setItem("auth_sync_" + session.access_token, "true");
          
          // Clear tRPC cache to ensure the new session is picked up
          await utils.auth.me.invalidate();
          await utils.auth.getProfile.invalidate();
          
          // Only redirect/reload if we are on the signin/signup page or have oauth tokens in URL
          const shouldRedirect = window.location.pathname.includes("/signin") || 
                               window.location.pathname.includes("/signup") ||
                               window.location.hash.includes("access_token") || 
                               window.location.search.includes("code=");

          if (shouldRedirect) {
            console.log("[Auth] Sync successful, redirecting to dashboard...");
            navigate("/dashboard");
            // Small delay before reload to ensure 'navigate' registers
            setTimeout(() => window.location.reload(), 100);
          }
        } catch (error) {
          console.error("Failed to sync Supabase Google session:", error);
        }
      } else if (event === "SIGNED_OUT") {
        window.sessionStorage.clear();
      }
    });
  }, [syncMutation, utils, location, navigate]);

  return null;
}
