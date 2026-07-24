import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TutorOnboardingFlow } from "@/components/tutor-onboarding/tutor-onboarding-flow";
import { getDashboardRole } from "@/lib/auth/server";
import { getTutorOnboardingSnapshot } from "@/lib/tutor-onboarding/live-actions";

export const metadata: Metadata = { title: "Tutor Onboarding" };

export default async function TutorOnboardingPage() {
  const role = await getDashboardRole();

  if (role !== "tutor") {
    redirect("/login?next=/dashboard/tutor/onboarding");
  }

  const snapshot = await getTutorOnboardingSnapshot();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TutorOnboardingFlow
        key={`${snapshot.status}:${snapshot.history.join("|")}`}
        initialValues={snapshot.values}
        initialStatus={snapshot.status}
        initialHistory={snapshot.history}
      />
    </main>
  );
}
