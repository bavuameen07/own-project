/**
 * Central runtime configuration.
 *
 * Only server-side (non `NEXT_PUBLIC_`) values live here so that the Apps Script
 * endpoint and admin credentials are never shipped to the browser.
 */

export function getGoogleScriptUrl(): string {
  const url = process.env.GOOGLE_SCRIPT_URL?.trim();
  if (!url) {
    throw new Error("Missing required environment variable: GOOGLE_SCRIPT_URL");
  }
  return url;
}

export function isGoogleScriptConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SCRIPT_URL?.trim());
}

export const ADMIN_SESSION_COOKIE = "admin_session";

export const SITE_NAME = "OpenRoles";
export const SITE_DESCRIPTION =
  "Discover meaningful career opportunities and take the next step in your professional journey.";
