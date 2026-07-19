import type { Metadata } from "next";

import { AdminDashboard } from "@/components/dashboards/admin-dashboard";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminDashboard />
    </main>
  );
}
