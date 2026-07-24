"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { assertTransition, isTutorApplicationStatus } from "@/lib/tutor-onboarding/status-transitions";
import type { TutorApplicationStatus } from "@/lib/tutor-onboarding/status-transitions";
import type { LocalizedText, TutorApplication } from "@/lib/tutor-onboarding/types";

const statusActionSchema = z.object({
  applicationId: z.string().uuid(),
  to: z.enum(["under_review", "changes_requested", "approved", "rejected", "suspended"]),
  reason: z.string().trim().optional(),
});

const documentStatusSchema = z.object({
  documentId: z.string().uuid(),
  status: z.enum(["verified", "changes_requested"]),
  notes: z.string().trim().optional(),
});

export type AdminActionResult = {
  ok: boolean;
  message: string;
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function localizedText(value: unknown, fallback = ""): LocalizedText {
  if (typeof value === "string") {
    return { ms: value, en: value };
  }

  const record = asRecord(value);
  const ms = typeof record.ms === "string" ? record.ms : fallback;
  const en = typeof record.en === "string" ? record.en : ms;

  return { ms, en };
}

function localizedList(value: unknown): LocalizedText[] {
  return Array.isArray(value) ? value.map((item) => localizedText(item)).filter((item) => item.ms || item.en) : [];
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function optionalNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function optionalBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function dbDocumentStatusToUi(status: unknown): "submitted" | "verified" | "changes_requested" {
  if (status === "approved" || status === "verified") {
    return "verified";
  }

  if (status === "changes_requested" || status === "correction_required") {
    return "changes_requested";
  }

  return "submitted";
}

function documentLabel(scope: string): LocalizedText {
  const labels: Record<string, LocalizedText> = {
    identity_front: { ms: "Dokumen identiti depan", en: "Identity front" },
    identity_back: { ms: "Dokumen identiti belakang", en: "Identity back" },
    qualification: { ms: "Sijil kelayakan", en: "Qualification certificate" },
    profile_photo: { ms: "Gambar profil", en: "Profile photo" },
  };

  return labels[scope] ?? { ms: scope, en: scope };
}

function sizeLabel(bytes: unknown) {
  const value = optionalNumber(bytes);

  if (!value) {
    return "-";
  }

  if (value >= 1024 * 1024) {
    return `${(value / 1024 / 1024).toFixed(1)}MB`;
  }

  return `${Math.max(Math.round(value / 1024), 1)}KB`;
}

function nestedName(value: unknown) {
  const record = Array.isArray(value) ? asRecord(value[0]) : asRecord(value);
  return optionalString(record.name);
}

function groupBy<T extends JsonRecord>(rows: T[], key: string) {
  const groups = new Map<string, T[]>();

  for (const row of rows) {
    const value = optionalString(row[key]);
    if (!value) continue;
    groups.set(value, [...(groups.get(value) ?? []), row]);
  }

  return groups;
}

function calculateRisk(application: JsonRecord, documents: JsonRecord[]) {
  const status = optionalString(application.status);

  if (status === "rejected" || documents.some((document) => dbDocumentStatusToUi(document.status) === "changes_requested")) {
    return "high" as const;
  }

  if (status === "changes_requested") {
    return "medium" as const;
  }

  return "low" as const;
}

export async function getAdminTutorApplications(): Promise<TutorApplication[]> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const { data: applications, error: applicationsError } = await supabase
    .from("tutor_applications")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (applicationsError) {
    throw applicationsError;
  }

  const applicationRows = (applications ?? []) as JsonRecord[];
  const applicationIds = applicationRows.map((application) => optionalString(application.id)).filter(Boolean);
  const tutorProfileIds = applicationRows.map((application) => optionalString(application.tutor_profile_id)).filter(Boolean);

  if (!applicationIds.length) {
    return [];
  }

  const [
    profilesResult,
    documentsResult,
    qualificationsResult,
    experiencesResult,
    serviceAreasResult,
    ratesResult,
    availabilityResult,
    historyResult,
  ] = await Promise.all([
    supabase.from("tutor_profiles").select("*").in("id", tutorProfileIds),
    supabase.from("tutor_documents").select("*").in("application_id", applicationIds).order("created_at", { ascending: false }),
    supabase.from("tutor_qualifications").select("*").in("application_id", applicationIds).order("created_at"),
    supabase.from("tutor_experiences").select("*").in("application_id", applicationIds),
    supabase.from("tutor_service_areas").select("*").in("application_id", applicationIds),
    supabase
      .from("tutor_rates")
      .select("*, subjects(name), education_levels(name)")
      .in("application_id", applicationIds)
      .is("deleted_at", null)
      .order("created_at"),
    supabase
      .from("tutor_availability")
      .select("*")
      .in("application_id", applicationIds)
      .is("deleted_at", null)
      .order("day_of_week"),
    supabase
      .from("tutor_verification_actions")
      .select("*")
      .in("application_id", applicationIds)
      .order("created_at", { ascending: false }),
  ]);

  if (profilesResult.error) throw profilesResult.error;
  if (documentsResult.error) throw documentsResult.error;
  if (qualificationsResult.error) throw qualificationsResult.error;
  if (experiencesResult.error) throw experiencesResult.error;
  if (serviceAreasResult.error) throw serviceAreasResult.error;
  if (ratesResult.error) throw ratesResult.error;
  if (availabilityResult.error) throw availabilityResult.error;
  if (historyResult.error) throw historyResult.error;

  const profilesById = new Map((profilesResult.data ?? []).map((profile) => [String(profile.id), profile as JsonRecord]));
  const documentsByApp = groupBy((documentsResult.data ?? []) as JsonRecord[], "application_id");
  const qualificationsByApp = groupBy((qualificationsResult.data ?? []) as JsonRecord[], "application_id");
  const experiencesByApp = groupBy((experiencesResult.data ?? []) as JsonRecord[], "application_id");
  const serviceAreasByApp = groupBy((serviceAreasResult.data ?? []) as JsonRecord[], "application_id");
  const ratesByApp = groupBy((ratesResult.data ?? []) as JsonRecord[], "application_id");
  const availabilityByApp = groupBy((availabilityResult.data ?? []) as JsonRecord[], "application_id");
  const historyByApp = groupBy((historyResult.data ?? []) as JsonRecord[], "application_id");

  return applicationRows.flatMap((application) => {
    const applicationId = optionalString(application.id);
    const status = optionalString(application.status);

    if (!applicationId || !isTutorApplicationStatus(status)) {
      return [];
    }

    const tutorProfile = profilesById.get(optionalString(application.tutor_profile_id)) ?? {};
    const personal = asRecord(application.personal_information);
    const identity = asRecord(application.identity_private);
    const teachingExperience = asRecord(application.teaching_experience);
    const selections = asRecord(application.selections);
    const declarations = asRecord(application.declarations);
    const documents = documentsByApp.get(applicationId) ?? [];
    const experience = experiencesByApp.get(applicationId)?.[0] ?? {};
    const serviceArea = serviceAreasByApp.get(applicationId)?.[0] ?? {};

    return [
      {
        id: applicationId,
        ownerProfileId: optionalString(tutorProfile.profile_id),
        tutorProfileId: optionalString(application.tutor_profile_id),
        status,
        completionPercent: optionalNumber(application.completion_percent),
        submittedAt: optionalString(application.submitted_at) || undefined,
        reviewedAt: optionalString(application.reviewed_at) || undefined,
        approvedAt: optionalString(application.approved_at) || undefined,
        updatedAt: optionalString(application.updated_at),
        risk: calculateRisk(application, documents),
        personal: {
          fullName: optionalString(personal.fullName) || optionalString(tutorProfile.professional_title),
          displayName: optionalString(personal.displayName) || optionalString(tutorProfile.professional_title),
          gender: optionalString(personal.gender),
          dateOfBirth: optionalString(personal.dateOfBirth),
          nationality: optionalString(personal.nationality),
          state: optionalString(personal.state) || optionalString(tutorProfile.base_state),
          district: optionalString(personal.district) || optionalString(tutorProfile.base_district),
          postcode: optionalString(personal.postcode),
          preferredLanguage: optionalString(personal.preferredLanguage),
          shortBiography: localizedText(personal.shortBiography, optionalString(tutorProfile.bio)),
        },
        identity: {
          documentType:
            optionalString(identity.documentType) === "passport" || optionalString(identity.documentType) === "permanent_resident"
              ? (optionalString(identity.documentType) as "passport" | "permanent_resident")
              : "mykad",
          maskedIdentificationNumber: optionalString(identity.maskedIdentificationNumber),
          consent: optionalBoolean(identity.consent),
        },
        qualifications: (qualificationsByApp.get(applicationId) ?? []).map((qualification) => ({
          id: optionalString(qualification.id),
          level: optionalString(qualification.qualification_level) || optionalString(qualification.qualification_type),
          title: optionalString(qualification.title),
          institution: optionalString(qualification.institution),
          fieldOfStudy: optionalString(qualification.field_of_study),
          graduationYear: optionalNumber(qualification.year_awarded),
          certificateName: "",
          verificationStatus: dbDocumentStatusToUi(qualification.verification_status),
          adminNotes: localizedText(optionalString(qualification.admin_notes)),
        })),
        experience: {
          years: optionalNumber(experience.total_years, optionalNumber(teachingExperience.years)),
          currentOccupation: optionalString(experience.current_occupation) || optionalString(teachingExperience.currentOccupation),
          isSchoolTeacher: optionalBoolean(experience.is_school_teacher, optionalBoolean(teachingExperience.isSchoolTeacher)),
          teachingInstitution: optionalString(experience.teaching_institution) || optionalString(teachingExperience.teachingInstitution),
          biography: localizedText(optionalString(experience.experience_bio) || optionalString(teachingExperience.biography)),
          studentLevelsTaught: stringArray(experience.student_levels_taught).length
            ? stringArray(experience.student_levels_taught)
            : stringArray(teachingExperience.studentLevelsTaught),
          teachingLanguages: stringArray(experience.teaching_languages).length
            ? stringArray(experience.teaching_languages)
            : stringArray(teachingExperience.teachingLanguages),
          specialExpertise: stringArray(experience.special_expertise).length
            ? stringArray(experience.special_expertise)
            : stringArray(teachingExperience.specialExpertise),
        },
        educationLevels: stringArray(selections.educationLevels),
        curriculums: stringArray(selections.curriculums),
        subjects: stringArray(selections.subjects),
        categories: stringArray(selections.categories),
        serviceArea: {
          mode:
            optionalString(serviceArea.mode) === "physical" || optionalString(serviceArea.mode) === "both"
              ? (optionalString(serviceArea.mode) as "physical" | "both")
              : "online",
          state: optionalString(serviceArea.state) || optionalString(personal.state),
          district: optionalString(serviceArea.district) || optionalString(personal.district),
          postcode: optionalString(serviceArea.postcode) || optionalString(personal.postcode),
          radiusKm: optionalNumber(serviceArea.radius_km),
          travelFeeAmount: optionalNumber(serviceArea.travel_fee_cents) / 100,
          acceptsStudentHome: optionalBoolean(serviceArea.accepts_student_home, true),
          acceptsTutorLocation: optionalBoolean(serviceArea.accepts_tutor_location),
          acceptsPublicLocation: optionalBoolean(serviceArea.accepts_public_location),
        },
        rates: (ratesByApp.get(applicationId) ?? []).map((rate) => ({
          id: optionalString(rate.id),
          subject: nestedName(rate.subjects),
          educationLevel: nestedName(rate.education_levels),
          mode: optionalString(rate.mode) === "physical" ? "physical" : "online",
          durationMinutes: optionalNumber(rate.duration_minutes),
          groupType: optionalString(rate.group_type) === "group" ? "group" : "individual",
          sessionType: optionalString(rate.session_type) === "trial" ? "trial" : "standard",
          amount: optionalNumber(rate.amount_cents) / 100,
        })),
        availability: (availabilityByApp.get(applicationId) ?? []).map((slot) => ({
          id: optionalString(slot.id),
          dayOfWeek: optionalNumber(slot.day_of_week),
          startTime: optionalString(slot.starts_at).slice(0, 5),
          endTime: optionalString(slot.ends_at).slice(0, 5),
          timezone: "Asia/Kuala_Lumpur",
          mode: optionalString(slot.mode) === "physical" ? "physical" : "online",
          active: optionalBoolean(slot.active, true),
        })),
        declarations: {
          accurate: optionalBoolean(declarations.accurate),
          authentic: optionalBoolean(declarations.authentic),
          terms: optionalBoolean(declarations.terms),
          childSafety: optionalBoolean(declarations.childSafety),
          noOffPlatformPayment: optionalBoolean(declarations.noOffPlatformPayment),
          qualityMonitoring: optionalBoolean(declarations.qualityMonitoring),
        },
        documents: documents.map((document) => ({
          id: optionalString(document.id),
          label: documentLabel(optionalString(document.document_scope) || optionalString(document.document_type)),
          bucketId: optionalString(document.bucket_id) as TutorApplication["documents"][number]["bucketId"],
          path: optionalString(document.file_path),
          status: dbDocumentStatusToUi(document.status),
          sizeLabel: sizeLabel(document.file_size_bytes),
          private: optionalBoolean(document.private, true),
        })),
        missingItems: localizedList(application.missing_items),
        correctionNotes: localizedList(application.correction_notes),
        adminNotes: localizedList(application.admin_notes),
        history: (historyByApp.get(applicationId) ?? []).map((entry) => ({
          id: optionalString(entry.id),
          actorRole: optionalString(entry.actor_role) === "tutor" ? "tutor" : "admin",
          action: optionalString(entry.action),
          oldStatus: isTutorApplicationStatus(optionalString(entry.old_status))
            ? (optionalString(entry.old_status) as TutorApplicationStatus)
            : undefined,
          newStatus: isTutorApplicationStatus(optionalString(entry.new_status))
            ? (optionalString(entry.new_status) as TutorApplicationStatus)
            : undefined,
          at: optionalString(entry.created_at),
          note: localizedText(entry.reason, optionalString(entry.action)),
        })),
      } satisfies TutorApplication,
    ];
  });
}

export async function updateTutorApplicationStatus(input: z.infer<typeof statusActionSchema>): Promise<AdminActionResult> {
  try {
    const parsed = statusActionSchema.parse(input);
    const context = await requireAdmin();
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return { ok: false, message: "Supabase belum dikonfigurasi." };
    }

    const { data: application, error: applicationError } = await supabase
      .from("tutor_applications")
      .select("id, tutor_profile_id, status")
      .eq("id", parsed.applicationId)
      .single();

    if (applicationError || !application) {
      return { ok: false, message: "Permohonan tidak ditemui." };
    }

    const currentStatus = String(application.status);

    if (!isTutorApplicationStatus(currentStatus)) {
      return { ok: false, message: "Status semasa tidak sah." };
    }

    const { data: tutorProfile, error: tutorProfileError } = await supabase
      .from("tutor_profiles")
      .select("profile_id")
      .eq("id", application.tutor_profile_id)
      .single();

    if (tutorProfileError || !tutorProfile?.profile_id) {
      return { ok: false, message: "Pemilik tutor tidak ditemui." };
    }

    assertTransition({
      actorRole: "admin",
      actorProfileId: context.profile.id,
      ownerProfileId: String(tutorProfile.profile_id),
      from: currentStatus,
      to: parsed.to,
    });

    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      status: parsed.to,
      reviewed_at: now,
      reviewed_by: context.profile.id,
    };

    if (parsed.to === "approved") {
      updatePayload.approved_at = now;
    }

    if (parsed.reason) {
      updatePayload[parsed.to === "changes_requested" ? "correction_notes" : "admin_notes"] = [
        { ms: parsed.reason, en: parsed.reason },
      ];
    }

    const { error: updateError } = await supabase
      .from("tutor_applications")
      .update(updatePayload)
      .eq("id", parsed.applicationId);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    const { error: profileUpdateError } = await supabase
      .from("tutor_profiles")
      .update({ verification_status: parsed.to, approved_at: parsed.to === "approved" ? now : null })
      .eq("id", application.tutor_profile_id);

    if (profileUpdateError) {
      return { ok: false, message: profileUpdateError.message };
    }

    const { error: historyError } = await supabase.from("tutor_verification_actions").insert({
      application_id: parsed.applicationId,
      tutor_profile_id: application.tutor_profile_id,
      actor_profile_id: context.profile.id,
      actor_role: "admin",
      action: "admin_status_update",
      old_status: currentStatus,
      new_status: parsed.to,
      reason: parsed.reason,
      internal_metadata: { source: "server_action" },
    });

    if (historyError) {
      return { ok: false, message: historyError.message };
    }

    revalidatePath("/dashboard/admin/tutor-applications");
    revalidatePath("/cari-tutor");

    return { ok: true, message: "Status permohonan dikemas kini." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Tindakan admin gagal." };
  }
}

export async function updateTutorDocumentVerification(input: z.infer<typeof documentStatusSchema>): Promise<AdminActionResult> {
  try {
    const parsed = documentStatusSchema.parse(input);
    const context = await requireAdmin();
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return { ok: false, message: "Supabase belum dikonfigurasi." };
    }

    const databaseStatus = parsed.status === "verified" ? "approved" : "changes_requested";
    const { error } = await supabase
      .from("tutor_documents")
      .update({
        status: databaseStatus,
        notes: parsed.notes,
        reviewed_by: context.profile.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", parsed.documentId);

    if (error) {
      return { ok: false, message: error.message };
    }

    revalidatePath("/dashboard/admin/tutor-applications");

    return { ok: true, message: "Status dokumen dikemas kini." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Semakan dokumen gagal." };
  }
}

export async function createAdminDocumentSignedUrl(documentId: string): Promise<AdminActionResult & { url?: string }> {
  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return { ok: false, message: "Supabase belum dikonfigurasi." };
    }

    const { data: document, error: documentError } = await supabase
      .from("tutor_documents")
      .select("id, bucket_id, file_path")
      .eq("id", documentId)
      .single();

    if (documentError || !document) {
      return { ok: false, message: "Dokumen tidak ditemui." };
    }

    const { data, error } = await supabase.storage.from(String(document.bucket_id)).createSignedUrl(String(document.file_path), 600);

    if (error) {
      return { ok: false, message: error.message };
    }

    await supabase
      .from("tutor_documents")
      .update({ signed_url_requested_at: new Date().toISOString() })
      .eq("id", documentId);

    return { ok: true, message: "Signed URL dijana.", url: data.signedUrl };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal menjana signed URL." };
  }
}
