"use server";

import { cookies } from "next/headers";
import { z } from "zod";

import {
  AUTH_ROLE_COOKIE,
  isPublicRegistrationRole,
  roleDashboardPaths,
} from "@/lib/auth/roles";
import { getCurrentProfile } from "@/lib/auth/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

const passwordSchema = z.string().min(8, "Kata laluan mesti sekurang-kurangnya 8 aksara.");

const loginSchema = z.object({
  email: z.string().email("Masukkan emel yang sah."),
  password: passwordSchema,
  role: z.enum(["parent", "tutor", "admin"]).optional(),
  nextPath: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email("Masukkan emel yang sah."),
  password: passwordSchema,
  role: z.enum(["parent", "tutor"]),
  fullName: z.string().min(2, "Nama diperlukan.").optional(),
  nextPath: z.string().optional(),
});

const resetSchema = z.object({
  email: z.string().email("Masukkan emel yang sah."),
  origin: z.string().url().optional(),
});

const updatePasswordSchema = z.object({
  password: passwordSchema,
});

export type AuthActionResult = {
  ok: boolean;
  message: string;
  redirectTo?: string;
  role?: Role;
  mode: "supabase";
};

type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;
type PasswordResetInput = z.infer<typeof resetSchema>;
type PasswordUpdateInput = z.infer<typeof updatePasswordSchema>;

function safeDashboardPath(nextPath: string | undefined, role: Role) {
  return nextPath?.startsWith("/dashboard") ? nextPath : roleDashboardPaths[role];
}

async function setRoleCookie(role: Role) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_ROLE_COOKIE);
}

export async function loginWithPassword(input: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Maklumat login tidak sah.", mode: "supabase" };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Supabase belum dikonfigurasi.", mode: "supabase" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, message: error.message, mode: "supabase" };
  }

  const context = await getCurrentProfile();

  if (!context) {
    await clearAuthCookies();
    return {
      ok: false,
      message: "Akaun berjaya disahkan, tetapi rekod profil Tutor2U belum ditemui.",
      mode: "supabase",
    };
  }

  await setRoleCookie(context.profile.role);

  return {
    ok: true,
    message: "Login berjaya.",
    redirectTo: safeDashboardPath(parsed.data.nextPath, context.profile.role),
    role: context.profile.role,
    mode: "supabase",
  };
}

export async function registerWithPassword(input: RegisterInput): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Maklumat daftar tidak sah.", mode: "supabase" };
  }

  if (!isPublicRegistrationRole(parsed.data.role)) {
    return { ok: false, message: "Role admin tidak boleh didaftarkan melalui borang awam.", mode: "supabase" };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Supabase belum dikonfigurasi.", mode: "supabase" };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName ?? parsed.data.email.split("@")[0],
        role: parsed.data.role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, message: error.message, mode: "supabase" };
  }

  if (data.session) {
    const context = await getCurrentProfile();
    await setRoleCookie(context?.profile.role ?? parsed.data.role);
  }

  return {
    ok: true,
    message: data.session
      ? "Akaun berjaya didaftarkan."
      : "Akaun berjaya didaftarkan. Sila semak emel untuk pengesahan.",
    redirectTo: data.session ? safeDashboardPath(parsed.data.nextPath, parsed.data.role) : "/login",
    role: parsed.data.role,
    mode: "supabase",
  };
}

export async function signOutCurrentUser(): Promise<AuthActionResult> {
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  await clearAuthCookies();

  return { ok: true, message: "Anda telah logout.", redirectTo: "/login", mode: "supabase" };
}

export async function requestPasswordReset(input: PasswordResetInput): Promise<AuthActionResult> {
  const parsed = resetSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Emel tidak sah.", mode: "supabase" };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Supabase belum dikonfigurasi untuk reset kata laluan.", mode: "supabase" };
  }

  const origin = parsed.data.origin ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/password-update`,
  });

  if (error) {
    return { ok: false, message: error.message, mode: "supabase" };
  }

  return { ok: true, message: "Pautan reset kata laluan telah dihantar.", mode: "supabase" };
}

export async function updateCurrentPassword(input: PasswordUpdateInput): Promise<AuthActionResult> {
  const parsed = updatePasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Kata laluan tidak sah.", mode: "supabase" };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Supabase belum dikonfigurasi.", mode: "supabase" };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, message: error.message, mode: "supabase" };
  }

  return { ok: true, message: "Kata laluan berjaya dikemas kini.", redirectTo: "/dashboard", mode: "supabase" };
}
