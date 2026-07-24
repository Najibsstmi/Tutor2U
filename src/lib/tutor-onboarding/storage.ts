import type { UploadedDocument } from "@/lib/tutor-onboarding/types";

export const MAX_TUTOR_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_TUTOR_DOCUMENT_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"] as const;

export type TutorDocumentBucket = UploadedDocument["bucketId"];
export type TutorDocumentScope = "identity_front" | "identity_back" | "qualification" | "profile_photo";

export type UploadCandidate = {
  name: string;
  type: string;
  size: number;
};

const bucketByScope: Record<TutorDocumentScope, TutorDocumentBucket> = {
  identity_front: "tutor-identity-documents",
  identity_back: "tutor-identity-documents",
  qualification: "tutor-qualification-documents",
  profile_photo: "tutor-profile-images",
};

export function getBucketForDocumentScope(scope: TutorDocumentScope): TutorDocumentBucket {
  return bucketByScope[scope];
}

export function isAcceptedTutorDocument(file: UploadCandidate) {
  return ACCEPTED_TUTOR_DOCUMENT_MIME_TYPES.includes(file.type as (typeof ACCEPTED_TUTOR_DOCUMENT_MIME_TYPES)[number])
    && file.size > 0
    && file.size <= MAX_TUTOR_DOCUMENT_BYTES;
}

export function validateTutorDocument(file: UploadCandidate): { ok: true } | { ok: false; message: string } {
  if (!ACCEPTED_TUTOR_DOCUMENT_MIME_TYPES.includes(file.type as (typeof ACCEPTED_TUTOR_DOCUMENT_MIME_TYPES)[number])) {
    return { ok: false, message: "Fail mestilah PNG, JPG, JPEG atau PDF." };
  }

  if (file.size <= 0 || file.size > MAX_TUTOR_DOCUMENT_BYTES) {
    return { ok: false, message: "Saiz fail tidak boleh melebihi 5MB." };
  }

  return { ok: true };
}

export function sanitizeFileName(fileName: string) {
  const trimmed = fileName.trim().toLowerCase();
  const withoutPath = trimmed.split(/[/\\]/).at(-1) ?? "document";
  const normalized = withoutPath
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "document";
}

export function buildTutorDocumentPath(input: {
  profileId: string;
  applicationId: string;
  scope: TutorDocumentScope;
  fileName: string;
  now?: Date;
  randomId?: string;
}) {
  const now = input.now ?? new Date();
  const randomId = input.randomId ?? globalThis.crypto?.randomUUID?.() ?? String(now.getTime());
  const stamp = now.toISOString().replace(/[:.]/g, "-");

  return `${input.profileId}/${input.applicationId}/${input.scope}/${stamp}-${randomId}-${sanitizeFileName(input.fileName)}`;
}
