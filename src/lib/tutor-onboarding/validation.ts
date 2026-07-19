import { z } from "zod";

import { type Locale, translate } from "@/lib/i18n/messages";
import { findOverlappingAvailability, hasValidTimeRange } from "@/lib/tutor-onboarding/availability";

const fiveMb = 5 * 1024 * 1024;
const acceptedFileTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

export type UploadValue = {
  name: string;
  type: string;
  size: number;
};

function uploadSchema(locale: Locale, required = true) {
  const base = z
    .object({
      name: z.string().min(1, translate(locale, "validation.required")),
      type: z.string().refine((value) => acceptedFileTypes.includes(value), {
        message: translate(locale, "validation.fileType"),
      }),
      size: z.number().max(fiveMb, translate(locale, "validation.fileSize")),
    })
    .nullable();

  return required ? base.refine(Boolean, { message: translate(locale, "validation.required") }) : base;
}

const stringArraySchema = (locale: Locale) => z.array(z.string()).min(1, translate(locale, "validation.required"));

export function createTutorApplicationSchema(locale: Locale) {
  return z
    .object({
      personal: z.object({
        fullName: z.string().min(2, translate(locale, "validation.required")),
        displayName: z.string().min(2, translate(locale, "validation.required")),
        profilePhoto: uploadSchema(locale, false),
        gender: z.string().min(1, translate(locale, "validation.required")),
        dateOfBirth: z.string().min(1, translate(locale, "validation.required")),
        nationality: z.string().min(2, translate(locale, "validation.required")),
        state: z.string().min(2, translate(locale, "validation.required")),
        district: z.string().min(2, translate(locale, "validation.required")),
        postcode: z.string().regex(/^\d{5}$/, translate(locale, "validation.postcode")),
        preferredLanguage: z.string().min(2, translate(locale, "validation.required")),
        shortBiography: z.string().min(40, translate(locale, "validation.minBio")),
      }),
      identity: z.object({
        documentType: z.enum(["mykad", "passport", "permanent_resident"]),
        identificationNumber: z.string().min(6, translate(locale, "validation.required")),
        frontDocument: uploadSchema(locale),
        backDocument: uploadSchema(locale, false),
        consent: z.boolean().refine(Boolean, { message: translate(locale, "validation.declaration") }),
      }),
      qualifications: z.array(
        z.object({
          level: z.string().min(2, translate(locale, "validation.required")),
          title: z.string().min(2, translate(locale, "validation.required")),
          institution: z.string().min(2, translate(locale, "validation.required")),
          fieldOfStudy: z.string().min(2, translate(locale, "validation.required")),
          graduationYear: z
            .number()
            .int()
            .min(1970, translate(locale, "validation.graduationYear"))
            .max(new Date().getFullYear(), translate(locale, "validation.graduationYear")),
          certificate: uploadSchema(locale),
        }),
      ).min(1, translate(locale, "validation.required")),
      experience: z.object({
        years: z.number().min(0, translate(locale, "validation.required")),
        currentOccupation: z.string().min(2, translate(locale, "validation.required")),
        isSchoolTeacher: z.boolean(),
        teachingInstitution: z.string().min(2, translate(locale, "validation.required")),
        biography: z.string().min(30, translate(locale, "validation.required")),
        studentLevelsTaught: stringArraySchema(locale),
        teachingLanguages: stringArraySchema(locale),
        specialExpertise: stringArraySchema(locale),
      }),
      selections: z.object({
        educationLevels: stringArraySchema(locale),
        curriculums: stringArraySchema(locale),
        subjects: stringArraySchema(locale),
        categories: stringArraySchema(locale),
      }),
      serviceArea: z.object({
        mode: z.enum(["online", "physical", "both"]),
        state: z.string().min(2, translate(locale, "validation.required")),
        district: z.string().min(2, translate(locale, "validation.required")),
        postcode: z.string().regex(/^\d{5}$/, translate(locale, "validation.postcode")),
        radiusKm: z.number().min(0),
        travelFeeAmount: z.number().min(0),
        acceptsStudentHome: z.boolean(),
        acceptsTutorLocation: z.boolean(),
        acceptsPublicLocation: z.boolean(),
      }),
      rates: z.array(
        z.object({
          subject: z.string().min(1, translate(locale, "validation.required")),
          educationLevel: z.string().min(1, translate(locale, "validation.required")),
          mode: z.enum(["online", "physical"]),
          durationMinutes: z.number().min(30, translate(locale, "validation.required")),
          groupType: z.enum(["individual", "group"]),
          sessionType: z.enum(["trial", "standard"]),
          amount: z.number().positive(translate(locale, "validation.positiveRate")),
        }),
      ).min(1, translate(locale, "validation.required")),
      availability: z
        .array(
          z
            .object({
              dayOfWeek: z.number().min(0).max(6),
              startTime: z.string().min(1, translate(locale, "validation.required")),
              endTime: z.string().min(1, translate(locale, "validation.required")),
              timezone: z.literal("Asia/Kuala_Lumpur"),
              mode: z.enum(["online", "physical"]),
              active: z.boolean(),
            })
            .refine(hasValidTimeRange, { message: translate(locale, "validation.timeRange") }),
        )
        .min(1, translate(locale, "validation.required")),
      declarations: z.object({
        accurate: z.boolean().refine(Boolean, { message: translate(locale, "validation.declaration") }),
        authentic: z.boolean().refine(Boolean, { message: translate(locale, "validation.declaration") }),
        terms: z.boolean().refine(Boolean, { message: translate(locale, "validation.declaration") }),
        childSafety: z.boolean().refine(Boolean, { message: translate(locale, "validation.declaration") }),
        noOffPlatformPayment: z.boolean().refine(Boolean, { message: translate(locale, "validation.declaration") }),
        qualityMonitoring: z.boolean().refine(Boolean, { message: translate(locale, "validation.declaration") }),
      }),
    })
    .superRefine((value, context) => {
      const overlaps = findOverlappingAvailability(value.availability);

      for (const [, second] of overlaps) {
        context.addIssue({
          code: "custom",
          path: ["availability", second, "startTime"],
          message: translate(locale, "validation.availabilityOverlap"),
        });
      }
    });
}

export type TutorApplicationFormValues = z.infer<ReturnType<typeof createTutorApplicationSchema>>;
