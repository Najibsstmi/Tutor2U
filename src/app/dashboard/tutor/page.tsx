import type { Metadata } from "next";

import { TutorDashboard } from "@/components/dashboards/tutor-dashboard";

export const metadata: Metadata = { title: "Dashboard Tutor" };

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TutorDashboard />
    </main>
  );
}
