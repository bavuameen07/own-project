/**
 * Central runtime configuration.
 *
 * Only server-side (non `NEXT_PUBLIC_`) values live here so that the Apps Script
 * endpoint and admin credentials are never shipped to the browser.
 */

const DEFAULT_GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw8n_BV06hSvMzLCQ4_hq1f8HKrtlzfNGy_g6-MgF920OY7fvvrUByp90MqtfEy6NY/exec";

const DEFAULT_SESSION_SECRET =
  "35eaaa547a07a539ee5177e3e3755514343fa9ba415e64296335586fcfa53173";

const DEFAULT_ADMIN_USERNAME = "bavu";
const DEFAULT_ADMIN_PASSWORD = "8101";

export function getGoogleScriptUrl(): string {
  return process.env.GOOGLE_SCRIPT_URL?.trim() || DEFAULT_GOOGLE_SCRIPT_URL;
}

export function isGoogleScriptConfigured(): boolean {
  return Boolean(getGoogleScriptUrl());
}

export function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() || DEFAULT_SESSION_SECRET;
}

export function getAdminCredentials(): { username: string; password: string } {
  return {
    username: process.env.ADMIN_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD,
  };
}

export const ADMIN_SESSION_COOKIE = "admin_session";

export const SITE_NAME = "OpenRoles";
export const SITE_DESCRIPTION =
  "Discover meaningful career opportunities and take the next step in your professional journey.";
