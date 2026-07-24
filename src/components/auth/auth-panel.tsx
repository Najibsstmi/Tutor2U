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
import { loginWithPassword, registerWithPassword } from "@/lib/auth/actions";
import { roleLabels } from "@/lib/auth/roles";
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

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "parent",
    },
  });

  async function onSubmit(values: AuthValues) {
    setLoading(true);

    try {
      if (mode === "register" && values.role === "admin") {
        toast.error("Role admin tidak boleh didaftarkan melalui borang awam.");
        return;
      }

      const requestedPath = searchParams.get("next") ?? undefined;
      const result =
        mode === "login"
          ? await loginWithPassword({ ...values, nextPath: requestedPath })
          : await registerWithPassword({
              email: values.email,
              password: values.password,
              role: values.role === "admin" ? "parent" : values.role,
              nextPath: requestedPath,
            });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.role ? `${roleLabels[result.role]} berjaya masuk.` : result.message);

      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
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
            ? "Masuk menggunakan akaun Supabase Tutor2U anda."
            : "Akaun baru akan disediakan mengikut jenis akaun yang dipilih."}
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
                {mode === "login" ? <SelectItem value="admin">Admin</SelectItem> : null}
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
