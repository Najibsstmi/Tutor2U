import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TutorDashboard } from "@/components/dashboards/tutor-dashboard";
import { getDashboardRole } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Dashboard Tutor" };

export default async function Page() {
  const role = await getDashboardRole();

  if (role !== "tutor") {
    redirect("/login?next=/dashboard/tutor");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TutorDashboard />
    </main>
  );
}
