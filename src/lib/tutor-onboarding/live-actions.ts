"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/server";
import { defaultLocale, type Locale } from "@/lib/i18n/messages";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createEmptyTutorApplicationValues } from "@/lib/tutor-onboarding/form-values";
import {
  assertTransition,
  isTutorApplicationStatus,
  type TutorApplicationStatus,
} from "@/lib/tutor-onboarding/status-transitions";
import {
  createTutorApplicationSchema,
  type TutorApplicationFormValues,
  type UploadValue,
} from "@/lib/tutor-onboarding/validation";

export type TutorApplicationActionResult = {
  ok: boolean;
  message: string;
  applicationId?: string;
  status?: TutorApplicationStatus;
};

export type TutorOnboardingSnapshot = {
  values: TutorApplicationFormValues;
  status: TutorApplicationStatus;
  history: string[];
};

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;
type JsonRecord = Record<string, unknown>;

type TutorApplicationRow = {
  id: string;
  tutor_profile_id: string;
  status: string;
  personal_information: unknown;
  identity_private: unknown;
  teaching_experience: unknown;
  selections: unknown;
  declarations: unknown;
};

type TutorDocumentRow = {
  document_scope: string | null;
  document_type: string;
  file_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
};

function toLocalizedText(value: string, locale: Locale) {
  return locale === "ms" ? { ms: value, en: value } : { ms: value, en: value };
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function localizedString(value: unknown, locale: Locale) {
  if (typeof value === "string") {
    return value;
  }

  const record = asRecord(value);
  return String(record[locale] ?? record.ms ?? record.en ?? "");
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

function identityDocumentType(value: unknown): "mykad" | "passport" | "permanent_resident" {
  return value === "passport" || value === "permanent_resident" ? value : "mykad";
}

function calculateServerCompletion(values: TutorApplicationFormValues) {
  const checks = [
    values.personal.fullName,
    values.personal.displayName,
    values.personal.state,
    values.personal.district,
    values.personal.postcode,
    values.personal.shortBiography,
    values.identity.documentType,
    values.identity.identificationNumber,
    values.identity.frontDocument?.name,
    values.identity.consent,
    values.qualifications.length,
    values.experience.years >= 0,
    values.experience.biography,
    values.selections.educationLevels.length,
    values.selections.curriculums.length,
    values.selections.subjects.length,
    values.selections.categories.length,
    values.serviceArea.mode,
    values.serviceArea.state,
    values.serviceArea.district,
    values.rates.length,
    values.availability.length,
    Object.values(values.declarations).every(Boolean),
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function normalizeApplicationInput(
  values: TutorApplicationFormValues,
  profile: { fullName: string; locale: Locale },
): TutorApplicationFormValues {
  const base = createEmptyTutorApplicationValues(profile);

  return {
    ...base,
    ...values,
    personal: { ...base.personal, ...values.personal },
    identity: { ...base.identity, ...values.identity },
    qualifications: Array.isArray(values.qualifications) ? values.qualifications : base.qualifications,
    experience: {
      ...base.experience,
      ...values.experience,
      studentLevelsTaught: Array.isArray(values.experience?.studentLevelsTaught)
        ? values.experience.studentLevelsTaught
        : base.experience.studentLevelsTaught,
      teachingLanguages: Array.isArray(values.experience?.teachingLanguages)
        ? values.experience.teachingLanguages
        : base.experience.teachingLanguages,
      specialExpertise: Array.isArray(values.experience?.specialExpertise)
        ? values.experience.specialExpertise
        : base.experience.specialExpertise,
    },
    selections: {
      ...base.selections,
      ...values.selections,
      educationLevels: Array.isArray(values.selections?.educationLevels) ? values.selections.educationLevels : [],
      curriculums: Array.isArray(values.selections?.curriculums) ? values.selections.curriculums : [],
      subjects: Array.isArray(values.selections?.subjects) ? values.selections.subjects : [],
      categories: Array.isArray(values.selections?.categories) ? values.selections.categories : [],
    },
    serviceArea: { ...base.serviceArea, ...values.serviceArea },
    rates: Array.isArray(values.rates) ? values.rates : base.rates,
    availability: Array.isArray(values.availability) ? values.availability : base.availability,
    declarations: { ...base.declarations, ...values.declarations },
  };
}

async function getOrCreateTutorProfile(
  supabase: SupabaseServerClient,
  profileId: string,
  values: TutorApplicationFormValues,
) {
  const { data: existing, error: existingError } = await supabase
    .from("tutor_profiles")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    return String(existing.id);
  }

  const firstRate = values.rates[0]?.amount ?? 0;
  const title = values.personal.displayName || values.personal.fullName || "Tutor Tutor2U";
  const { data: created, error: createError } = await supabase
    .from("tutor_profiles")
    .insert({
      profile_id: profileId,
      verification_status: "draft",
      professional_title: title,
      bio: values.personal.shortBiography || "",
      gender: values.personal.gender || null,
      teaching_experience_years: values.experience.years ?? 0,
      hourly_rate_cents: Math.round(firstRate * 100),
      can_teach_online: values.serviceArea.mode === "online" || values.serviceArea.mode === "both",
      can_teach_physical: values.serviceArea.mode === "physical" || values.serviceArea.mode === "both",
      base_state: values.personal.state || null,
      base_district: values.personal.district || null,
    })
    .select("id")
    .single();

  if (createError) {
    throw createError;
  }

  return String(created.id);
}

async function getActiveApplication(
  supabase: SupabaseServerClient,
  tutorProfileId: string,
): Promise<{ id: string; status: TutorApplicationStatus } | null> {
  const { data, error } = await supabase
    .from("tutor_applications")
    .select("id, status")
    .eq("tutor_profile_id", tutorProfileId)
    .is("deleted_at", null)
    .not("status", "in", "(rejected,suspended)")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id || !isTutorApplicationStatus(String(data.status))) {
    return null;
  }

  return { id: String(data.id), status: data.status };
}

async function resolveLookupIds(supabase: SupabaseServerClient, table: string, names: string[]) {
  const uniqueNames = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
  const ids = new Map<string, string>();

  if (uniqueNames.length === 0) {
    return ids;
  }

  const { data, error } = await supabase.from(table).select("id, name").in("name", uniqueNames);

  if (error) {
    throw error;
  }

  for (const row of data ?? []) {
    if (row.name && !ids.has(String(row.name))) {
      ids.set(String(row.name), String(row.id));
    }
  }

  return ids;
}

async function upsertApplicationCore(
  supabase: SupabaseServerClient,
  tutorProfileId: string,
  values: TutorApplicationFormValues,
  locale: Locale,
) {
  const completionPercent = calculateServerCompletion(values);
  const existing = await getActiveApplication(supabase, tutorProfileId);
  const applicationPayload = {
    tutor_profile_id: tutorProfileId,
    completion_percent: completionPercent,
    personal_information: {
      fullName: values.personal.fullName,
      displayName: values.personal.displayName,
      profilePhoto: values.personal.profilePhoto,
      gender: values.personal.gender,
      dateOfBirth: values.personal.dateOfBirth,
      nationality: values.personal.nationality,
      state: values.personal.state,
      district: values.personal.district,
      postcode: values.personal.postcode,
      preferredLanguage: values.personal.preferredLanguage,
      shortBiography: toLocalizedText(values.personal.shortBiography, locale),
    },
    identity_private: {
      documentType: values.identity.documentType,
      maskedIdentificationNumber: maskIdentification(values.identity.identificationNumber),
      frontDocument: values.identity.frontDocument,
      backDocument: values.identity.backDocument,
      consent: values.identity.consent,
    },
    teaching_experience: values.experience,
    selections: values.selections,
    declarations: values.declarations,
  };

  if (existing) {
    if (existing.status !== "draft" && existing.status !== "changes_requested") {
      return existing;
    }

    const { error } = await supabase.from("tutor_applications").update(applicationPayload).eq("id", existing.id);

    if (error) {
      throw error;
    }

    return existing;
  }

  const { data, error } = await supabase
    .from("tutor_applications")
    .insert({ ...applicationPayload, status: "draft" })
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  return { id: String(data.id), status: data.status as TutorApplicationStatus };
}

async function replaceApplicationDetailRows(
  supabase: SupabaseServerClient,
  tutorProfileId: string,
  applicationId: string,
  values: TutorApplicationFormValues,
) {
  const subjectIds = await resolveLookupIds(supabase, "subjects", [
    ...values.selections.subjects,
    ...values.rates.map((rate) => rate.subject),
  ]);
  const educationLevelIds = await resolveLookupIds(supabase, "education_levels", [
    ...values.selections.educationLevels,
    ...values.rates.map((rate) => rate.educationLevel),
  ]);
  const curriculumIds = await resolveLookupIds(supabase, "curriculums", values.selections.curriculums);

  const experienceDelete = await supabase.from("tutor_experiences").delete().eq("application_id", applicationId);
  if (experienceDelete.error) throw experienceDelete.error;

  const experienceInsert = await supabase.from("tutor_experiences").insert({
    tutor_profile_id: tutorProfileId,
    application_id: applicationId,
    total_years: values.experience.years,
    current_occupation: values.experience.currentOccupation || "",
    is_school_teacher: values.experience.isSchoolTeacher,
    teaching_institution: values.experience.teachingInstitution || null,
    experience_bio: values.experience.biography || "Draf pengalaman belum lengkap.",
    student_levels_taught: values.experience.studentLevelsTaught.filter(Boolean),
    teaching_languages: values.experience.teachingLanguages.filter(Boolean),
    special_expertise: values.experience.specialExpertise.filter(Boolean),
  });
  if (experienceInsert.error) throw experienceInsert.error;

  const qualificationDelete = await supabase.from("tutor_qualifications").delete().eq("application_id", applicationId);
  if (qualificationDelete.error) throw qualificationDelete.error;

  const qualifications = values.qualifications.filter(
    (qualification) => qualification.level && qualification.institution && qualification.title,
  );
  if (qualifications.length) {
    const { error } = await supabase.from("tutor_qualifications").insert(
      qualifications.map((qualification) => ({
        tutor_profile_id: tutorProfileId,
        application_id: applicationId,
        qualification_type: qualification.level,
        qualification_level: qualification.level,
        institution: qualification.institution,
        title: qualification.title,
        field_of_study: qualification.fieldOfStudy || null,
        year_awarded: qualification.graduationYear,
        verification_status: "submitted",
      })),
    );
    if (error) throw error;
  }

  const rateDelete = await supabase.from("tutor_rates").delete().eq("application_id", applicationId);
  if (rateDelete.error) throw rateDelete.error;

  const rates = values.rates.filter((rate) => rate.amount > 0 && rate.durationMinutes > 0);
  if (rates.length) {
    const { error } = await supabase.from("tutor_rates").insert(
      rates.map((rate) => ({
        tutor_profile_id: tutorProfileId,
        application_id: applicationId,
        subject_id: subjectIds.get(rate.subject) ?? null,
        education_level_id: educationLevelIds.get(rate.educationLevel) ?? null,
        mode: rate.mode,
        duration_minutes: rate.durationMinutes,
        group_type: rate.groupType,
        session_type: rate.sessionType,
        amount_cents: Math.round(rate.amount * 100),
        active: true,
      })),
    );
    if (error) throw error;
  }

  const serviceAreaDelete = await supabase.from("tutor_service_areas").delete().eq("application_id", applicationId);
  if (serviceAreaDelete.error) throw serviceAreaDelete.error;

  if (values.serviceArea.state && values.serviceArea.district) {
    const { error } = await supabase.from("tutor_service_areas").insert({
      tutor_profile_id: tutorProfileId,
      application_id: applicationId,
      state: values.serviceArea.state,
      district: values.serviceArea.district,
      postcode: values.serviceArea.postcode || null,
      radius_km: values.serviceArea.radiusKm,
      travel_fee_cents: Math.round(values.serviceArea.travelFeeAmount * 100),
      accepts_student_home: values.serviceArea.acceptsStudentHome,
      accepts_tutor_location: values.serviceArea.acceptsTutorLocation,
      accepts_public_location: values.serviceArea.acceptsPublicLocation,
    });
    if (error) throw error;
  }

  const availabilityDelete = await supabase.from("tutor_availability").delete().eq("application_id", applicationId);
  if (availabilityDelete.error) throw availabilityDelete.error;

  const availability = values.availability.filter((slot) => slot.startTime && slot.endTime);
  if (availability.length) {
    const { error } = await supabase.from("tutor_availability").insert(
      availability.map((slot) => ({
        tutor_profile_id: tutorProfileId,
        application_id: applicationId,
        day_of_week: slot.dayOfWeek,
        starts_at: slot.startTime,
        ends_at: slot.endTime,
        mode: slot.mode,
        status: slot.active ? "available" : "unavailable",
        timezone: slot.timezone,
        active: slot.active,
      })),
    );
    if (error) throw error;
  }

  const subjectDelete = await supabase.from("tutor_subjects").delete().eq("tutor_profile_id", tutorProfileId);
  if (subjectDelete.error) throw subjectDelete.error;

  const curriculumId = values.selections.curriculums.map((name) => curriculumIds.get(name)).find(Boolean) ?? null;
  const tutorSubjects = values.selections.subjects.flatMap((subject) => {
    const subjectId = subjectIds.get(subject);
    if (!subjectId) return [];

    return values.selections.educationLevels.flatMap((educationLevel) => {
      const educationLevelId = educationLevelIds.get(educationLevel);
      return educationLevelId
        ? [
            {
              tutor_profile_id: tutorProfileId,
              subject_id: subjectId,
              education_level_id: educationLevelId,
              curriculum_id: curriculumId,
              years_experience: values.experience.years,
            },
          ]
        : [];
    });
  });

  if (tutorSubjects.length) {
    const { error } = await supabase.from("tutor_subjects").insert(tutorSubjects);
    if (error) throw error;
  }
}

async function persistPublicTutorProfile(
  supabase: SupabaseServerClient,
  tutorProfileId: string,
  values: TutorApplicationFormValues,
  status?: TutorApplicationStatus,
) {
  const firstRate = values.rates.find((rate) => rate.amount > 0)?.amount ?? 0;
  const updatePayload: Record<string, unknown> = {
    professional_title: values.personal.displayName || values.personal.fullName || "Tutor Tutor2U",
    bio: values.personal.shortBiography || "",
    gender: values.personal.gender || null,
    teaching_experience_years: values.experience.years,
    hourly_rate_cents: Math.round(firstRate * 100),
    can_teach_online: values.serviceArea.mode === "online" || values.serviceArea.mode === "both",
    can_teach_physical: values.serviceArea.mode === "physical" || values.serviceArea.mode === "both",
    base_state: values.personal.state || null,
    base_district: values.personal.district || null,
  };

  if (status) {
    updatePayload.verification_status = status;
  }

  const { error } = await supabase.from("tutor_profiles").update(updatePayload).eq("id", tutorProfileId);

  if (error) {
    throw error;
  }
}

function documentToUpload(document: TutorDocumentRow | undefined): UploadValue | null {
  if (!document) {
    return null;
  }

  return {
    name: document.file_path.split("/").at(-1) ?? document.document_type,
    type: document.mime_type ?? "application/pdf",
    size: document.file_size_bytes ?? 0,
  };
}

function mapStoredValues(input: {
  application: TutorApplicationRow;
  documents: TutorDocumentRow[];
  qualifications: JsonRecord[];
  experience: JsonRecord | null;
  serviceArea: JsonRecord | null;
  rates: JsonRecord[];
  availability: JsonRecord[];
  locale: Locale;
  profileFullName: string;
}): TutorApplicationFormValues {
  const base = createEmptyTutorApplicationValues({
    fullName: input.profileFullName,
    locale: input.locale,
  });
  const personal = asRecord(input.application.personal_information);
  const identity = asRecord(input.application.identity_private);
  const selections = asRecord(input.application.selections);
  const teachingExperience = asRecord(input.application.teaching_experience);
  const declarations = asRecord(input.application.declarations);
  const documentByScope = new Map(
    input.documents
      .sort((first, second) => Date.parse(second.created_at) - Date.parse(first.created_at))
      .map((document) => [document.document_scope ?? document.document_type, document]),
  );

  return {
    personal: {
      ...base.personal,
      fullName: optionalString(personal.fullName) || base.personal.fullName,
      displayName: optionalString(personal.displayName) || base.personal.displayName,
      profilePhoto: documentToUpload(documentByScope.get("profile_photo")) ?? (personal.profilePhoto as UploadValue | null) ?? null,
      gender: optionalString(personal.gender) || base.personal.gender,
      dateOfBirth: optionalString(personal.dateOfBirth),
      nationality: optionalString(personal.nationality) || base.personal.nationality,
      state: optionalString(personal.state),
      district: optionalString(personal.district),
      postcode: optionalString(personal.postcode),
      preferredLanguage: optionalString(personal.preferredLanguage) || base.personal.preferredLanguage,
      shortBiography: localizedString(personal.shortBiography, input.locale),
    },
    identity: {
      ...base.identity,
      documentType: identityDocumentType(identity.documentType),
      identificationNumber: "",
      frontDocument: documentToUpload(documentByScope.get("identity_front")) ?? (identity.frontDocument as UploadValue | null) ?? null,
      backDocument: documentToUpload(documentByScope.get("identity_back")) ?? (identity.backDocument as UploadValue | null) ?? null,
      consent: optionalBoolean(identity.consent),
    },
    qualifications: input.qualifications.length
      ? input.qualifications.map((qualification, index) => ({
          level: optionalString(qualification.qualification_level) || optionalString(qualification.qualification_type),
          title: optionalString(qualification.title),
          institution: optionalString(qualification.institution),
          fieldOfStudy: optionalString(qualification.field_of_study),
          graduationYear: optionalNumber(qualification.year_awarded, new Date().getFullYear()),
          certificate: index === 0 ? documentToUpload(documentByScope.get("qualification")) : null,
        }))
      : base.qualifications,
    experience: {
      ...base.experience,
      years: optionalNumber(input.experience?.total_years, optionalNumber(teachingExperience.years)),
      currentOccupation: optionalString(input.experience?.current_occupation) || optionalString(teachingExperience.currentOccupation),
      isSchoolTeacher: optionalBoolean(input.experience?.is_school_teacher, optionalBoolean(teachingExperience.isSchoolTeacher)),
      teachingInstitution: optionalString(input.experience?.teaching_institution) || optionalString(teachingExperience.teachingInstitution),
      biography: optionalString(input.experience?.experience_bio) || optionalString(teachingExperience.biography),
      studentLevelsTaught: stringArray(input.experience?.student_levels_taught).length
        ? stringArray(input.experience?.student_levels_taught)
        : stringArray(teachingExperience.studentLevelsTaught),
      teachingLanguages: stringArray(input.experience?.teaching_languages).length
        ? stringArray(input.experience?.teaching_languages)
        : stringArray(teachingExperience.teachingLanguages),
      specialExpertise: stringArray(input.experience?.special_expertise).length
        ? stringArray(input.experience?.special_expertise)
        : stringArray(teachingExperience.specialExpertise),
    },
    selections: {
      educationLevels: stringArray(selections.educationLevels),
      curriculums: stringArray(selections.curriculums),
      subjects: stringArray(selections.subjects),
      categories: stringArray(selections.categories),
    },
    serviceArea: {
      ...base.serviceArea,
      state: optionalString(input.serviceArea?.state),
      district: optionalString(input.serviceArea?.district),
      postcode: optionalString(input.serviceArea?.postcode),
      radiusKm: optionalNumber(input.serviceArea?.radius_km),
      travelFeeAmount: optionalNumber(input.serviceArea?.travel_fee_cents) / 100,
      acceptsStudentHome: optionalBoolean(input.serviceArea?.accepts_student_home, true),
      acceptsTutorLocation: optionalBoolean(input.serviceArea?.accepts_tutor_location),
      acceptsPublicLocation: optionalBoolean(input.serviceArea?.accepts_public_location),
    },
    rates: input.rates.length
      ? input.rates.map((rate) => ({
          subject: optionalString(asRecord(rate.subjects).name),
          educationLevel: optionalString(asRecord(rate.education_levels).name),
          mode: optionalString(rate.mode) === "physical" ? "physical" : "online",
          durationMinutes: optionalNumber(rate.duration_minutes, 60),
          groupType: optionalString(rate.group_type) === "group" ? "group" : "individual",
          sessionType: optionalString(rate.session_type) === "trial" ? "trial" : "standard",
          amount: optionalNumber(rate.amount_cents) / 100,
        }))
      : base.rates,
    availability: input.availability.length
      ? input.availability.map((slot) => ({
          dayOfWeek: optionalNumber(slot.day_of_week, 1),
          startTime: optionalString(slot.starts_at).slice(0, 5),
          endTime: optionalString(slot.ends_at).slice(0, 5),
          timezone: "Asia/Kuala_Lumpur",
          mode: optionalString(slot.mode) === "physical" ? "physical" : "online",
          active: optionalBoolean(slot.active, true),
        }))
      : base.availability,
    declarations: {
      accurate: optionalBoolean(declarations.accurate),
      authentic: optionalBoolean(declarations.authentic),
      terms: optionalBoolean(declarations.terms),
      childSafety: optionalBoolean(declarations.childSafety),
      noOffPlatformPayment: optionalBoolean(declarations.noOffPlatformPayment),
      qualityMonitoring: optionalBoolean(declarations.qualityMonitoring),
    },
  };
}

async function loadApplicationSnapshot(
  supabase: SupabaseServerClient,
  applicationId: string,
  locale: Locale,
  profileFullName: string,
): Promise<TutorOnboardingSnapshot> {
  const { data: application, error: applicationError } = await supabase
    .from("tutor_applications")
    .select("*")
    .eq("id", applicationId)
    .single<TutorApplicationRow>();

  if (applicationError) {
    throw applicationError;
  }

  const [
    documentsResult,
    qualificationsResult,
    experienceResult,
    serviceAreaResult,
    ratesResult,
    availabilityResult,
    historyResult,
  ] = await Promise.all([
    supabase
      .from("tutor_documents")
      .select("document_scope, document_type, file_path, file_size_bytes, mime_type, created_at")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false }),
    supabase.from("tutor_qualifications").select("*").eq("application_id", applicationId).order("created_at"),
    supabase.from("tutor_experiences").select("*").eq("application_id", applicationId).maybeSingle<JsonRecord>(),
    supabase.from("tutor_service_areas").select("*").eq("application_id", applicationId).maybeSingle<JsonRecord>(),
    supabase
      .from("tutor_rates")
      .select("*, subjects(name), education_levels(name)")
      .eq("application_id", applicationId)
      .is("deleted_at", null)
      .order("created_at"),
    supabase
      .from("tutor_availability")
      .select("*")
      .eq("application_id", applicationId)
      .is("deleted_at", null)
      .order("day_of_week"),
    supabase
      .from("tutor_verification_actions")
      .select("old_status, new_status, reason, created_at")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false }),
  ]);

  if (documentsResult.error) throw documentsResult.error;
  if (qualificationsResult.error) throw qualificationsResult.error;
  if (experienceResult.error) throw experienceResult.error;
  if (serviceAreaResult.error) throw serviceAreaResult.error;
  if (ratesResult.error) throw ratesResult.error;
  if (availabilityResult.error) throw availabilityResult.error;
  if (historyResult.error) throw historyResult.error;

  return {
    values: mapStoredValues({
      application,
      documents: (documentsResult.data ?? []) as TutorDocumentRow[],
      qualifications: (qualificationsResult.data ?? []) as JsonRecord[],
      experience: experienceResult.data,
      serviceArea: serviceAreaResult.data,
      rates: (ratesResult.data ?? []) as JsonRecord[],
      availability: (availabilityResult.data ?? []) as JsonRecord[],
      locale,
      profileFullName,
    }),
    status: isTutorApplicationStatus(application.status) ? application.status : "draft",
    history: (historyResult.data ?? []).map((item) => {
      const date = new Date(String(item.created_at)).toLocaleString(locale === "ms" ? "ms-MY" : "en-MY");
      return `${date} - ${String(item.old_status ?? "draft")} -> ${String(item.new_status ?? "draft")}${
        item.reason ? ` (${String(item.reason)})` : ""
      }`;
    }),
  };
}

export async function getTutorOnboardingSnapshot(): Promise<TutorOnboardingSnapshot> {
  const context = await requireRole("tutor");
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  const emptyValues = createEmptyTutorApplicationValues({
    fullName: context.profile.fullName,
    locale: context.profile.locale,
  });
  const tutorProfileId = await getOrCreateTutorProfile(supabase, context.profile.id, emptyValues);
  const activeApplication = await getActiveApplication(supabase, tutorProfileId);

  if (!activeApplication) {
    return {
      values: emptyValues,
      status: "draft",
      history: [],
    };
  }

  return loadApplicationSnapshot(supabase, activeApplication.id, context.profile.locale, context.profile.fullName);
}

export async function saveTutorApplicationDraft(input: {
  values: TutorApplicationFormValues;
  locale?: Locale;
}): Promise<TutorApplicationActionResult> {
  try {
    const context = await requireRole("tutor");
    const locale = input.locale ?? context.profile.locale ?? defaultLocale;
    const values = normalizeApplicationInput(input.values, {
      fullName: context.profile.fullName,
      locale,
    });
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return { ok: false, message: "Supabase belum dikonfigurasi." };
    }

    const tutorProfileId = await getOrCreateTutorProfile(supabase, context.profile.id, values);
    const application = await upsertApplicationCore(supabase, tutorProfileId, values, locale);

    if (application.status === "draft" || application.status === "changes_requested") {
      await replaceApplicationDetailRows(supabase, tutorProfileId, application.id, values);
      await persistPublicTutorProfile(supabase, tutorProfileId, values);
    }

    revalidatePath("/dashboard/tutor/onboarding");

    return {
      ok: true,
      message: "Draf permohonan disimpan ke Supabase.",
      applicationId: application.id,
      status: application.status,
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal menyimpan draf." };
  }
}

export async function submitTutorApplicationLive(input: {
  values: TutorApplicationFormValues;
  locale?: Locale;
}): Promise<TutorApplicationActionResult> {
  try {
    const context = await requireRole("tutor");
    const locale = input.locale ?? context.profile.locale ?? defaultLocale;
    const schema = createTutorApplicationSchema(locale);
    const parsed = schema.safeParse(input.values);

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Maklumat permohonan tidak sah." };
    }

    const saved = await saveTutorApplicationDraft({ values: parsed.data, locale });

    if (!saved.ok || !saved.applicationId || !saved.status) {
      return saved;
    }

    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return { ok: false, message: "Supabase belum dikonfigurasi." };
    }

    const nextStatus: TutorApplicationStatus = saved.status === "changes_requested" ? "resubmitted" : "submitted";
    assertTransition({
      actorRole: "tutor",
      actorProfileId: context.profile.id,
      ownerProfileId: context.profile.id,
      from: saved.status,
      to: nextStatus,
    });

    const { data: application, error: applicationError } = await supabase
      .from("tutor_applications")
      .select("tutor_profile_id")
      .eq("id", saved.applicationId)
      .single();

    if (applicationError) {
      throw applicationError;
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("tutor_applications")
      .update({
        status: nextStatus,
        submitted_at: now,
      })
      .eq("id", saved.applicationId);

    if (error) {
      throw error;
    }

    await persistPublicTutorProfile(supabase, String(application.tutor_profile_id), parsed.data, nextStatus);
    revalidatePath("/dashboard/tutor/onboarding");
    revalidatePath("/dashboard/admin/tutor-applications");

    return {
      ok: true,
      message: nextStatus === "resubmitted" ? "Permohonan dihantar semula ke Supabase." : "Permohonan dihantar ke Supabase.",
      applicationId: saved.applicationId,
      status: nextStatus,
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Gagal menghantar permohonan." };
  }
}

function maskIdentification(value: string) {
  const cleaned = value.replace(/[^\da-z]/gi, "");
  return cleaned.length <= 4 ? "****" : `${"*".repeat(Math.max(cleaned.length - 4, 4))}${cleaned.slice(-4)}`;
}
