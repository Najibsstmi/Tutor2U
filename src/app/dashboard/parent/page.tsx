import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ParentDashboard } from "@/components/dashboards/parent-dashboard";
import { getDashboardRole } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Dashboard Ibu Bapa" };

export default async function Page() {
  const role = await getDashboardRole();

  if (role !== "parent") {
    redirect("/login?next=/dashboard/parent");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ParentDashboard />
    </main>
  );
}
