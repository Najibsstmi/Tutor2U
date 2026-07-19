import type { Role } from "@/lib/types";

export const applicationStatuses = [
  "draft",
  "submitted",
  "under_review",
  "changes_requested",
  "resubmitted",
  "approved",
  "rejected",
  "suspended",
] as const;

export type TutorApplicationStatus = (typeof applicationStatuses)[number];

export const allowedStatusTransitions: Record<TutorApplicationStatus, TutorApplicationStatus[]> = {
  draft: ["submitted"],
  submitted: ["under_review"],
  under_review: ["changes_requested", "approved", "rejected"],
  changes_requested: ["resubmitted"],
  resubmitted: ["under_review"],
  approved: ["suspended"],
  rejected: [],
  suspended: [],
};

export type TransitionActor = {
  actorRole: Role;
  actorProfileId: string;
  ownerProfileId: string;
  from: TutorApplicationStatus;
  to: TutorApplicationStatus;
};

export function isTutorApplicationStatus(value: string): value is TutorApplicationStatus {
  return applicationStatuses.includes(value as TutorApplicationStatus);
}

export function canTransition(from: TutorApplicationStatus, to: TutorApplicationStatus) {
  return allowedStatusTransitions[from].includes(to);
}

export function canActorTransition(actor: TransitionActor) {
  if (!canTransition(actor.from, actor.to)) {
    return false;
  }

  if (actor.actorRole === "admin") {
    return actor.actorProfileId !== actor.ownerProfileId;
  }

  if (actor.actorRole !== "tutor" || actor.actorProfileId !== actor.ownerProfileId) {
    return false;
  }

  return (
    (actor.from === "draft" && actor.to === "submitted") ||
    (actor.from === "changes_requested" && actor.to === "resubmitted")
  );
}

export function assertTransition(actor: TransitionActor) {
  if (!canActorTransition(actor)) {
    throw new Error(`Invalid tutor application transition: ${actor.from} -> ${actor.to}`);
  }
}
