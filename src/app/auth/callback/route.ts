import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ROLE_COOKIE, isRole } from "@/lib/auth/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await getSupabaseServerClient();

    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle<{ role: string }>();

        if (isRole(profile?.role)) {
          const cookieStore = await cookies();
          cookieStore.set(AUTH_ROLE_COOKIE, profile.role, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          });
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/dashboard", request.url));
}
