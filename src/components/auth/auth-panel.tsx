"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { roleDashboardPaths, roleLabels } from "@/lib/auth/roles";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/browser";
import { authSchema } from "@/lib/validation";

type AuthValues = z.infer<typeof authSchema>;

type AuthPanelProps = {
  mode: "login" | "register";
};

export function AuthPanel({ mode }: AuthPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AuthValues["role"]>("parent");
  const configured = isSupabaseConfigured();

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: mode === "login" ? "farah.parent@tutor2u.test" : "",
      password: mode === "login" ? "Password123!" : "",
      role: "parent",
    },
  });

  async function onSubmit(values: AuthValues) {
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (configured && supabase) {
        const result =
          mode === "login"
            ? await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
              })
            : await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: { data: { role: values.role } },
              });

        if (result.error) {
          toast.error(result.error.message);
          return;
        }
      }

      document.cookie = `tutor2u_demo_role=${values.role}; path=/; max-age=604800; SameSite=Lax`;
      toast.success(`${roleLabels[values.role]} berjaya masuk.`);

      const requestedPath = searchParams.get("next");
      router.push(requestedPath?.startsWith("/dashboard") ? requestedPath : roleDashboardPaths[values.role]);
    } finally {
      setLoading(false);
    }
  }

  const Icon = mode === "login" ? LogIn : UserPlus;

  return (
    <Card className="mx-auto w-full max-w-md rounded-lg border-slate-200 shadow-sm">
      <CardHeader>
        <div className="mb-2 grid size-11 place-items-center rounded-md bg-blue-50 text-blue-700">
          <Icon className="size-5" />
        </div>
        <CardTitle>{mode === "login" ? "Login Tutor2U" : "Daftar akaun Tutor2U"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Pilih role demo atau gunakan akaun Supabase anda."
            : "Akaun baru akan disediakan mengikut role yang dipilih."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Jenis akaun</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => {
                const role = value as AuthValues["role"];
                setSelectedRole(role);
                form.setValue("role", role, { shouldValidate: true });
              }}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Ibu bapa</SelectItem>
                <SelectItem value="tutor">Tutor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Emel</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata laluan</Label>
            <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="h-10 w-full bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
          </Button>
        </form>

        <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {configured ? "Supabase aktif untuk projek ini." : "Mod demo aktif kerana env Supabase belum ditetapkan."}
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          {mode === "login" ? "Belum ada akaun?" : "Sudah ada akaun?"}{" "}
          <Link href={mode === "login" ? "/daftar" : "/login"} className="font-medium text-blue-700 hover:underline">
            {mode === "login" ? "Daftar" : "Login"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
