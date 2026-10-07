import { NextResponse } from "next/server";

import { destroySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(): Promise<NextResponse> {
  await destroySession();
  return NextResponse.json({ success: true, message: "Signed out." }, { status: 200 });
}
