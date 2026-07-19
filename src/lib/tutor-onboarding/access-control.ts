import type { Role } from "@/lib/types";
import type { TutorApplicationStatus } from "@/lib/tutor-onboarding/status-transitions";

export type TutorApplicationAccess = {
  actorRole: Role;
  actorProfileId: string;
  ownerProfileId: string;
  status: TutorApplicationStatus;
};

const tutorEditableStatuses: TutorApplicationStatus[] = ["draft", "changes_requested"];

export function canReadTutorApplication(access: TutorApplicationAccess) {
  return access.actorRole === "admin" || access.actorProfileId === access.ownerProfileId;
}

export function canEditTutorApplication(access: TutorApplicationAccess) {
  if (access.actorRole === "admin") {
    return true;
  }

  return access.actorRole === "tutor" && access.actorProfileId === access.ownerProfileId && tutorEditableStatuses.includes(access.status);
}

export function canTutorReadPrivateDocument(access: TutorApplicationAccess) {
  return access.actorRole === "admin" || access.actorProfileId === access.ownerProfileId;
}

export function canChangeVerificationFields(access: TutorApplicationAccess) {
  return access.actorRole === "admin" && access.actorProfileId !== access.ownerProfileId;
}

export function canDocumentBePublic(bucketId: string) {
  return bucketId === "tutor-profile-images";
}
