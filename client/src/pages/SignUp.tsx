import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Sign-up is handled via Google OAuth — this page just redirects to /signin.
 * When a new Google user first signs in, AuthSync will auto-create their account
 * and route them to /complete-profile for onboarding.
 */
export default function SignUp() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/signin");
  }, [navigate]);

  return null;
}
