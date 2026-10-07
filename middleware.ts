import { NextRequest, NextResponse } from "next/server";

/**
 * Edge gate for the admin panel.
 *
 * It runs before any rendering, so an unauthenticated visitor is redirected
 * without a single line of admin markup or data ever being generated.
 * `app/admin/(panel)/layout.tsx` re-checks on the server as defence in depth.
 */

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function sessionSecret(): string | null {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "";
  return secret || null;
}

async function hmacHex(secret: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Length-independent, character-by-character comparison. */
function secureEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const secret = sessionSecret();
  if (!secret) return false;

  const separator = token.indexOf(".");
  if (separator <= 0 || separator === token.length - 1) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expiresAtNumber = Number(expiresAt);
  if (!Number.isFinite(expiresAtNumber)) return false;
  if (expiresAtNumber < Date.now()) return false;
  if (expiresAtNumber - Date.now() > SESSION_MAX_AGE_MS + 60_000) return false;

  return secureEquals(signature, await hmacHex(secret, expiresAt));
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (await hasValidSession(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (nextPath && nextPath !== "/admin/login") {
    loginUrl.searchParams.set("next", nextPath);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
