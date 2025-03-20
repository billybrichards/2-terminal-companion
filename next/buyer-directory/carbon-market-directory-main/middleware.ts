import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware that doesn't do any authentication
export default async function middleware(request: NextRequest) {
  // Just pass through all requests now that we removed authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
