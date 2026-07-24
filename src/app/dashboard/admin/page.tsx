import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { getDashboardRole } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default async function Page() {
  const role = await getDashboardRole();

  if (role !== "admin") {
    redirect("/login?next=/dashboard/admin");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminDashboard />
    </main>
  );
}
