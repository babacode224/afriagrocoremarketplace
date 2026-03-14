import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";
import * as crypto from "crypto";
import { SignJWT } from "jose";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

async function issueAppCookie(req: Request, res: Response, user: { id: number; openId: string; role: string; name: string | null }) {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  const token = await new SignJWT({
    id: user.id,
    openId: user.openId,
    role: user.role,
    appId: ENV.appId,
    name: user.name ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  return token;
}

export function registerOAuthRoutes(app: Express) {
  // ── Legacy Manus OAuth callback ──────────────────────────────────────────────
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // ── Direct Google OAuth — bypasses Supabase entirely ─────────────────────────
  // Step 1: Redirect browser to Google
  app.get("/api/auth/google", (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ error: "GOOGLE_CLIENT_ID is not configured" });
      return;
    }

    const origin = `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${origin}/api/auth/google/callback`;
    const state = Buffer.from(JSON.stringify({ redirectUri })).toString("base64url");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    });

    res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });

  // Step 2: Google redirects back here with a code
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code) {
      res.redirect(302, "/signin?error=no_code");
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      res.redirect(302, "/signin?error=google_not_configured");
      return;
    }

    try {
      // Decode redirect_uri from state (or build it fresh)
      let redirectUri: string;
      try {
        const stateObj = JSON.parse(Buffer.from(state ?? "", "base64url").toString());
        redirectUri = stateObj.redirectUri;
      } catch {
        const origin = `${req.protocol}://${req.get("host")}`;
        redirectUri = `${origin}/api/auth/google/callback`;
      }

      // Exchange code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error("[Google OAuth] Token exchange failed:", err);
        res.redirect(302, "/signin?error=token_exchange_failed");
        return;
      }

      const tokens = await tokenRes.json() as { access_token: string; id_token: string };

      // Get user info from Google
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userInfoRes.ok) {
        res.redirect(302, "/signin?error=userinfo_failed");
        return;
      }

      const googleUser = await userInfoRes.json() as {
        sub: string; email: string; name: string; picture?: string;
      };

      if (!googleUser.email) {
        res.redirect(302, "/signin?error=no_email");
        return;
      }

      // Upsert user in our database
      const openId = `google_${googleUser.sub}`;

      let user = await db.getUserByEmail(googleUser.email);

      if (!user) {
        await db.upsertUser({
          openId,
          name: googleUser.name || googleUser.email.split("@")[0],
          email: googleUser.email,
          loginMethod: "google",
          userRole: "buyer",
          role: "user",
          isVerified: true,
          isActive: true,
          avatarUrl: googleUser.picture,
        });
        user = await db.getUserByEmail(googleUser.email);
      } else {
        // Update last sign in and avatar
        await db.updateUser(user.id, {
          lastSignedIn: new Date(),
          avatarUrl: googleUser.picture ?? user.avatarUrl,
        });
      }

      if (!user) {
        res.redirect(302, "/signin?error=user_sync_failed");
        return;
      }

      // Issue our JWT cookie and redirect to dashboard
      await issueAppCookie(req, res, user);
      res.redirect(302, "/dashboard");

    } catch (error) {
      console.error("[Google OAuth] Callback error:", error);
      res.redirect(302, "/signin?error=oauth_error");
    }
  });

  // ── Local email/password login — no Supabase ──────────────────────────────────
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    try {
      const passwordHash = crypto.createHash("sha256").update(password + "afriagrocore_salt_2024").digest("hex");
      const user = await db.getUserByEmail(email.toLowerCase().trim());

      if (!user || user.passwordHash !== passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ error: "Account is deactivated" });
        return;
      }

      await db.updateUser(user.id, { lastSignedIn: new Date() });
      await issueAppCookie(req, res, user);
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, userRole: user.userRole } });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ── Local email/password register — no Supabase ───────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { name, email, password, userRole } = req.body ?? {};
    if (!name || !email || !password || !userRole) {
      res.status(400).json({ error: "name, email, password, and userRole are required" });
      return;
    }

    try {
      const existing = await db.getUserByEmail(email.toLowerCase().trim(), userRole);
      if (existing) {
        res.status(409).json({ error: `You already have a ${userRole} account. Please sign in instead.` });
        return;
      }

      const passwordHash = crypto.createHash("sha256").update(password + "afriagrocore_salt_2024").digest("hex");
      const openId = `local_${crypto.createHash("md5").update(`${email}:${userRole}`).digest("hex")}`;

      await db.upsertUser({
        openId,
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        loginMethod: "email",
        userRole,
        role: "user",
        isVerified: false,
        isActive: true,
      });

      const user = await db.getUserByEmail(email.toLowerCase().trim(), userRole);
      if (!user) {
        res.status(500).json({ error: "Registration failed" });
        return;
      }

      await issueAppCookie(req, res, user);
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, userRole: user.userRole } });
    } catch (error) {
      console.error("[Auth] Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
}
