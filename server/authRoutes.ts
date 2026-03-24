/**
 * Express routes for Google OAuth flow.
 * Adapted from Openhouse's NextAuth Google provider.
 *
 * Flow:
 *   1. GET /auth/google          → redirect to Google consent screen
 *   2. GET /auth/google/callback  → exchange code → upsert agent → set JWT cookie → redirect
 *   3. POST /auth/logout          → clear cookie
 *   4. GET /auth/me               → return current session user
 */
import { Router, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { agentProfiles } from "../drizzle/schema";
import {
  getGoogleClientId,
  getGoogleClientSecret,
  isGoogleAuthConfigured,
  signJwt,
  setAuthCookie,
  clearAuthCookie,
  getAuthUser,
  getDashboardUrl,
  generateSlug,
} from "./_core/auth";

// ─── Google OAuth URLs ──────────────────────────────────────────────
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

interface GoogleUserInfo {
  sub: string;        // Google user ID
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────

function getCallbackUrl(req: Request): string {
  // In production, use DASHBOARD_URL; in dev, use the request origin
  const base = getDashboardUrl();
  return `${base}/auth/google/callback`;
}

async function findOrCreateAgent(googleUser: GoogleUserInfo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const email = googleUser.email.toLowerCase();

  // 1. Try to find by oauthId (returning Google user)
  const [byOauth] = await db
    .select()
    .from(agentProfiles)
    .where(and(
      eq(agentProfiles.oauthProvider, "google"),
      eq(agentProfiles.oauthId, googleUser.sub)
    ))
    .limit(1);

  if (byOauth) {
    // Update photo/name if changed
    await db.update(agentProfiles).set({
      name: googleUser.name || byOauth.name,
      photoUrl: googleUser.picture || byOauth.photoUrl,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(agentProfiles.id, byOauth.id));

    return byOauth;
  }

  // 2. Try to find by email (agent registered but never logged in via OAuth)
  const [byEmail] = await db
    .select()
    .from(agentProfiles)
    .where(eq(agentProfiles.email, email))
    .limit(1);

  if (byEmail) {
    // Link Google OAuth to existing profile
    await db.update(agentProfiles).set({
      oauthProvider: "google",
      oauthId: googleUser.sub,
      photoUrl: googleUser.picture || byEmail.photoUrl,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(agentProfiles.id, byEmail.id));

    return byEmail;
  }

  // 3. Create new agent profile
  let slug = generateSlug(googleUser.name || "agent");
  // Ensure slug is unique
  const [existing] = await db
    .select()
    .from(agentProfiles)
    .where(eq(agentProfiles.slug, slug))
    .limit(1);

  if (existing) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const [newAgent] = await db.insert(agentProfiles).values({
    slug,
    email,
    name: googleUser.name || "Agent",
    photoUrl: googleUser.picture || null,
    oauthProvider: "google",
    oauthId: googleUser.sub,
    status: "active",
    tier: "free",
    lastLoginAt: new Date(),
  }).returning();

  return newAgent;
}

// ─── Router ─────────────────────────────────────────────────────────

export function createAuthRouter(): Router {
  const router = Router();

  /**
   * GET /auth/google — Redirect to Google consent screen
   */
  router.get("/auth/google", (req: Request, res: Response) => {
    if (!isGoogleAuthConfigured()) {
      return res.status(503).json({
        error: "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      });
    }

    const params = new URLSearchParams({
      client_id: getGoogleClientId(),
      redirect_uri: getCallbackUrl(req),
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
      // Pass return URL as state
      state: (req.query.returnTo as string) || "/dashboard",
    });

    return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  });

  /**
   * GET /auth/google/callback — Exchange code for tokens, create/link agent, set cookie
   */
  router.get("/auth/google/callback", async (req: Request, res: Response) => {
    const { code, error, state } = req.query;
    const returnTo = (state as string) || "/dashboard";

    if (error) {
      console.error("[Auth] Google OAuth error:", error);
      return res.redirect(`/login?error=google_denied`);
    }

    if (!code || typeof code !== "string") {
      return res.redirect(`/login?error=missing_code`);
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: getGoogleClientId(),
          client_secret: getGoogleClientSecret(),
          redirect_uri: getCallbackUrl(req),
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const text = await tokenResponse.text();
        console.error("[Auth] Token exchange failed:", text);
        return res.redirect(`/login?error=token_exchange_failed`);
      }

      const tokens = (await tokenResponse.json()) as { access_token: string };

      // Fetch user info
      const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userInfoResponse.ok) {
        console.error("[Auth] Failed to fetch user info");
        return res.redirect(`/login?error=userinfo_failed`);
      }

      const googleUser = (await userInfoResponse.json()) as GoogleUserInfo;

      if (!googleUser.email) {
        return res.redirect(`/login?error=no_email`);
      }

      // Upsert agent profile
      const agent = await findOrCreateAgent(googleUser);

      if (!agent) {
        return res.redirect(`/login?error=provision_failed`);
      }

      // Sign JWT and set cookie
      const token = await signJwt({ id: agent.id, email: agent.email });
      setAuthCookie(res, token);

      // Redirect to dashboard
      return res.redirect(returnTo);
    } catch (err) {
      console.error("[Auth] Google callback error:", err);
      return res.redirect(`/login?error=server_error`);
    }
  });

  /**
   * POST /auth/logout — Clear session cookie
   */
  router.post("/auth/logout", (_req: Request, res: Response) => {
    clearAuthCookie(res);
    return res.json({ ok: true });
  });

  /**
   * GET /auth/me — Return current session user (or null)
   */
  router.get("/auth/me", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    return res.json({ user });
  });

  /**
   * GET /auth/providers — Return which auth providers are configured
   */
  router.get("/auth/providers", (_req: Request, res: Response) => {
    return res.json({
      providers: [
        {
          id: "google",
          label: "Google",
          configured: isGoogleAuthConfigured(),
        },
      ],
    });
  });

  return router;
}
