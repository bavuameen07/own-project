import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE } from "@/lib/env";

/**
 * Server-side admin authentication.
 *
 * Credentials and the session secret only ever exist in server-only
 * environment variables — they are never serialised to the browser.
 */

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function sessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "";
  if (!secret) {
    throw new Error(
      "Admin session secret is not configured. Set ADMIN_SESSION_SECRET.",
    );
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

/** Constant-time string comparison via HMAC digests. */
function secureEquals(a: string, b: string): boolean {
  const digestA = Buffer.from(sign(a), "utf8");
  const digestB = Buffer.from(sign(b), "utf8");
  if (digestA.length !== digestB.length) return false;
  return timingSafeEqual(digestA, digestB);
}

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_USERNAME?.trim() && process.env.ADMIN_PASSWORD?.trim(),
  );
}

export function verifyCredentials(
  username: string,
  password: string,
): boolean {
  const expectedUser = process.env.ADMIN_USERNAME?.trim();
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!expectedUser || !expectedPassword) return false;
  if (!username.trim() || !password) return false;

  // Evaluate both comparisons so response timing does not leak which field failed.
  const userMatches = secureEquals(username.trim(), expectedUser);
  const passwordMatches = secureEquals(password, expectedPassword);
  return userMatches && passwordMatches;
}

export function createSessionToken(): string {
  const expiresAt = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;

  const expiresAtNumber = Number(expiresAt);
  if (!Number.isFinite(expiresAtNumber)) return false;
  if (expiresAtNumber < Date.now()) return false;

  return secureEquals(signature, sign(expiresAt));
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_SESSION_COOKIE)?.value ?? null);
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}

function safeNextPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  // Only allow same-origin absolute paths to avoid open redirects.
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return undefined;
  if (!trimmed.startsWith("/admin")) return undefined;
  if (trimmed === "/admin/login") return undefined;
  return trimmed;
}

/** Redirects an unauthenticated visitor to the admin login screen. */
export async function requireAdmin(nextPath?: unknown): Promise<void> {
  if (await isAuthenticated()) return;
  const next = safeNextPath(nextPath);
  redirect(next ? `/admin/login?next=${encodeURIComponent(next)}` : "/admin/login");
}

export { safeNextPath };
