import { NextRequest, NextResponse } from "next/server";

/**
 * General middleware — currently no admin gate active.
 * All routes are accessible without authentication.
 */

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};