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
      if (session?.access_token && event === "SIGNED_IN") {
        try {
          await syncMutation.mutateAsync({
            accessToken: session.access_token,
          });
          
          await utils.auth.me.invalidate();
          
          // If we came straight from the OAuth callback, forcefully reload to trigger the app_session_id payload
          if (window.location.hash.includes("access_token") || window.location.search.includes("code=")) {
            navigate("/dashboard");
            window.location.reload();
          }
        } catch (error) {
          console.error("Failed to sync Supabase Google session:", error);
        }
      }
    });
  }, [syncMutation, utils, location, navigate]);

  return null;
}
