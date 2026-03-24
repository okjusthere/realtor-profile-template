/**
 * Auth layer — Google OAuth + JWT sessions.
 * Adapted from Openhouse's NextAuth pattern for Express/tRPC.
 */
import type { Request, Response } from "express";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { agentProfiles } from "../../drizzle/schema";

// ─── Domain configuration ───────────────────────────────────────────
// These will be separate domains in production:
//   AGENT_DOMAIN  = where public agent pages are served (e.g. agents.kevvrealty.com)
//   DASHBOARD_URL = where agents manage their profile (e.g. app.kevvrealty.com)
export function getAgentDomain(): string {
  return process.env.AGENT_DOMAIN || process.env.APP_URL || "http://localhost:3000";
}
export function getDashboardUrl(): string {
  return process.env.DASHBOARD_URL || process.env.APP_URL || "http://localhost:3000";
}

// ─── JWT Configuration ──────────────────────────────────────────────

const JWT_SECRET_KEY = () => {
  const secret = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";
  return new TextEncoder().encode(secret);
};

const TOKEN_COOKIE = "auth_token";
const TOKEN_EXPIRY = "7d"; // 7 days

export interface AuthUser {
  id: number;
  slug: string;
  email: string;
  name: string;
  tier: "free" | "pro" | "premium";
  photoUrl: string | null;
}

interface AuthJwtPayload extends JWTPayload {
  agentId: number;
  email: string;
}

// ─── JWT Helpers ────────────────────────────────────────────────────

export async function signJwt(agent: { id: number; email: string }): Promise<string> {
  return new SignJWT({ agentId: agent.id, email: agent.email } satisfies AuthJwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET_KEY());
}

export async function verifyJwt(token: string): Promise<AuthJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY());
    return payload as AuthJwtPayload;
  } catch {
    return null;
  }
}

// ─── Cookie Helpers ─────────────────────────────────────────────────

export function setAuthCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "lax" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(TOKEN_COOKIE, { path: "/" });
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...rest] = c.trim().split("=");
      return [key, rest.join("=")];
    })
  );
}

// ─── Request Auth ───────────────────────────────────────────────────

/**
 * Extract authenticated user from request.
 * Reads JWT from `auth_token` cookie → looks up agent in DB.
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[TOKEN_COOKIE];
  if (!token) return null;

  const payload = await verifyJwt(token);
  if (!payload?.agentId) return null;

  try {
    const db = await getDb();
    if (!db) return null;
    const [agent] = await db
      .select()
      .from(agentProfiles)
      .where(eq(agentProfiles.id, payload.agentId))
      .limit(1);

    if (!agent) return null;

    return {
      id: agent.id,
      slug: agent.slug,
      email: agent.email,
      name: agent.name,
      tier: (agent.tier as "free" | "pro" | "premium") || "free",
      photoUrl: agent.photoUrl,
    };
  } catch (error) {
    console.error("[Auth] Failed to look up agent:", error);
    return null;
  }
}

// ─── Slug Generator ─────────────────────────────────────────────────

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    || "agent";
}

// ─── Google OAuth Config ────────────────────────────────────────────

export function getGoogleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || "";
}
export function getGoogleClientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}
export function isGoogleAuthConfigured(): boolean {
  return !!(getGoogleClientId() && getGoogleClientSecret());
}
