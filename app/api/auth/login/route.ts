import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, message: "Admin authentication is not configured." },
    503,
  );
}