import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const role = request.cookies.get("dropdeal_role")?.value;
  if (role === "seller") return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("reason", "seller");
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/seller/:path*"],
};
