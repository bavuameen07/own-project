import { NextResponse } from "next/server";

import { createSession, verifyCredentials } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  let username = "";
  let password = "";

  try {
    const body = (await request.json()) as {
      username?: unknown;
      password?: unknown;
    };
    username = typeof body.username === "string" ? body.username : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  if (!username || !password) {
    return NextResponse.json(
      { success: false, message: "Username and password are required." },
      { status: 400 },
    );
  }

  if (!verifyCredentials(username, password)) {
    return NextResponse.json(
      { success: false, message: "Invalid username or password." },
      { status: 401 },
    );
  }

  await createSession();

  return NextResponse.json(
    { success: true, message: "Signed in." },
    { status: 200 },
  );
}
