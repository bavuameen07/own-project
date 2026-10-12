import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, getSessionSecret } from "@/lib/env";

/**
 * Admin route gate.
 *
 * Runs before any admin page renders so unauthenticated visitors get a clean
 * 307 redirect to the sign-in page instead of a streamed redirect error.
 */

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;

  const expiresAtNumber = Number(expiresAt);
  if (!Number.isFinite(expiresAtNumber) || expiresAtNumber < Date.now()) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(expiresAt));

  return timingSafeEqualHex(hex(digest), signature);
}

const LOGIN_PATH = "/admin/login";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isLoginPath =
    pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authenticated = await isValidSessionToken(token);

  if (isLoginPath) {
    if (!authenticated) return NextResponse.next();

    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = LOGIN_PATH;
  loginUrl.search = "";
  loginUrl.searchParams.set("next", pathname.replace(/^\/+/, ""));

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
