import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { isRole } from "@/lib/auth/roles";
import { defaultLocale, getLocale, type Locale } from "@/lib/i18n/messages";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export type CurrentProfile = {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  locale: Locale;
};

export type CurrentUserContext = {
  user: User;
  profile: CurrentProfile;
};

export class AuthError extends Error {
  constructor(
    public code: "supabase_not_configured" | "unauthenticated" | "profile_missing" | "forbidden",
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

type ProfileRow = {
  id: string;
  role: Role;
  full_name: string | null;
  email: string | null;
  locale: string | null;
};

function toProfile(row: ProfileRow, user: User): CurrentProfile {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name ?? user.email ?? "Tutor2U user",
    email: row.email ?? user.email ?? "",
    locale: getLocale(row.locale ?? undefined),
  };
}

export const getCurrentProfile = cache(async (): Promise<CurrentUserContext | null> => {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, locale")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (profileError || !profile || !isRole(profile.role)) {
    return null;
  }

  return { user, profile: toProfile(profile, user) };
});

export async function getDashboardRole(): Promise<Role | null> {
  const context = await getCurrentProfile();
  return context?.profile.role ?? null;
}

export async function requireUser(): Promise<CurrentUserContext> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    throw new AuthError("supabase_not_configured", "Supabase env vars are not configured.");
  }

  const context = await getCurrentProfile();

  if (!context) {
    throw new AuthError("unauthenticated", "User is not authenticated.");
  }

  return context;
}

export async function requireRole(allowedRoles: Role | Role[]): Promise<CurrentUserContext> {
  const context = await requireUser();
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!allowed.includes(context.profile.role)) {
    throw new AuthError("forbidden", "User does not have permission for this action.");
  }

  return context;
}

export async function requireAdmin(): Promise<CurrentUserContext> {
  return requireRole("admin");
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected authentication error.";
}

export function profileLocaleOrDefault(context: CurrentUserContext | null) {
  return context?.profile.locale ?? defaultLocale;
}
