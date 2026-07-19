import type { Metadata } from "next";

import { ParentDashboard } from "@/components/dashboards/parent-dashboard";

export const metadata: Metadata = { title: "Dashboard Ibu Bapa" };

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ParentDashboard />
    </main>
  );
}
