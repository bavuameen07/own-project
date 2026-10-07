import { NextResponse } from "next/server";

import { createSession, isAuthConfigured, verifyCredentials } from "@/lib/auth";
import { getRecruitmentList } from "@/lib/recruitment-api";

export const runtime = "nodejs";

/**
 * Starts loading the recruitment data while the browser follows the redirect,
 * so the dashboard usually opens from cache instead of waiting on Google Apps
 * Script. Failures are swallowed — the page still fetches on its own.
 */
function warmUpRecruitmentCache(): void {
  void getRecruitmentList().catch(() => undefined);
}

function json(body: Record<string, unknown>, status: number): NextResponse {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isAuthConfigured()) {
    return json(
      {
        success: false,
        message: "Sign-in is temporarily unavailable. Please try again later.",
      },
      503,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ success: false, message: "Invalid request." }, 400);
  }

  const record =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {};

  const username = typeof record.username === "string" ? record.username : "";
  const password = typeof record.password === "string" ? record.password : "";

  if (!username.trim() || !password) {
    return json(
      { success: false, message: "Please enter your username and password." },
      400,
    );
  }

  if (!verifyCredentials(username, password)) {
    // Deliberately generic — never reveal which credential failed.
    return json({ success: false, message: "Invalid credentials." }, 401);
  }

  await createSession();
  warmUpRecruitmentCache();

  return json({ success: true, message: "Signed in." }, 200);
}
