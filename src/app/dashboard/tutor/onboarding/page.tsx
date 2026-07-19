import type { Metadata } from "next";

import { TutorOnboardingFlow } from "@/components/tutor-onboarding/tutor-onboarding-flow";

export const metadata: Metadata = { title: "Tutor Onboarding" };

export default function TutorOnboardingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TutorOnboardingFlow />
    </main>
  );
}
