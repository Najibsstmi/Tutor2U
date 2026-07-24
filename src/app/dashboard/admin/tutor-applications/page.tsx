import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminTutorVerificationPanel } from "@/components/admin/tutor-verification-panel";
import { getDashboardRole } from "@/lib/auth/server";
import { getAdminTutorApplications } from "@/lib/admin/verification-actions";

export const metadata: Metadata = { title: "Tutor Applications" };

export default async function AdminTutorApplicationsPage() {
  const role = await getDashboardRole();

  if (role !== "admin") {
    redirect("/login?next=/dashboard/admin/tutor-applications");
  }

  const applications = await getAdminTutorApplications();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminTutorVerificationPanel
        key={applications.map((application) => `${application.id}:${application.status}:${application.updatedAt}`).join("|")}
        applications={applications}
      />
    </main>
  );
}
