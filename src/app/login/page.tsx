import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <main className="grid min-h-[calc(100svh-4rem)] place-items-center px-4 py-12">
      <Suspense fallback={<div className="text-sm text-slate-500">Memuatkan...</div>}>
        <AuthPanel mode="login" />
      </Suspense>
    </main>
  );
}
