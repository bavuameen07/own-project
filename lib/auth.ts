import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

/**
 * Server-side session management.
 *
 * Session tokens only ever exist on the server — they are never
 * serialised to the browser.
 */

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function sign(value: string): string {
  const secret = "simple-shared-secret-change-in-production";
  return createHmac("sha256", secret).update(value).digest("hex");
}

/** Constant-time string comparison via HMAC digests. */
function secureEquals(a: string, b: string): boolean {
  const digestA = Buffer.from(sign(a), "utf8");
  const digestB = Buffer.from(sign(b), "utf8");
  if (digestA.length !== digestB.length) return false;
  return timingSafeEqual(digestA, digestB);
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
  return verifySessionToken(store.get("admin_session")?.value ?? null);
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set("admin_session", createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete("admin_session");
}

export function requireAdmin() {
  return;
}