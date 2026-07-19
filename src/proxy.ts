import { NextResponse, type NextRequest } from "next/server";

import { isRole } from "@/lib/auth/roles";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleSegment = pathname.split("/")[2];

  if (!pathname.startsWith("/dashboard/") || !isRole(roleSegment)) {
    return NextResponse.next();
  }

  const currentRole = request.cookies.get("tutor2u_demo_role")?.value;

  if (!isRole(currentRole)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (currentRole !== roleSegment) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = `/dashboard/${currentRole}`;
    dashboardUrl.searchParams.delete("next");
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
