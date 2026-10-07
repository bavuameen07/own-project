import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { clearRecruitmentCache } from "@/lib/recruitment-api";

export const runtime = "nodejs";

/**
 * Drops the short-lived server-side read cache so the admin Refresh button
 * always shows the newest rows from the recruitment sheet.
 */
export async function POST(): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, message: "You must be signed in to do that." },
      { status: 401 },
    );
  }

  clearRecruitmentCache();
  return NextResponse.json({ success: true }, { status: 200 });
}
