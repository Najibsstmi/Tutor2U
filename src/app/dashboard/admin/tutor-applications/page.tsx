import type { Metadata } from "next";

import { AdminTutorVerificationPanel } from "@/components/admin/tutor-verification-panel";

export const metadata: Metadata = { title: "Tutor Applications" };

export default function AdminTutorApplicationsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminTutorVerificationPanel />
    </main>
  );
}
