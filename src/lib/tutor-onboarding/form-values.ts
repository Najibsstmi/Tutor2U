import type { Locale } from "@/lib/i18n/messages";
import type { TutorApplicationFormValues } from "@/lib/tutor-onboarding/validation";

export function createEmptyTutorApplicationValues(profile?: {
  fullName?: string;
  locale?: Locale;
}): TutorApplicationFormValues {
  const language = profile?.locale === "en" ? "English" : "Bahasa Melayu";
  const fullName = profile?.fullName ?? "";

  return {
    personal: {
      fullName,
      displayName: fullName,
      profilePhoto: null,
      gender: "female",
      dateOfBirth: "",
      nationality: "Malaysia",
      state: "",
      district: "",
      postcode: "",
      preferredLanguage: language,
      shortBiography: "",
    },
    identity: {
      documentType: "mykad",
      identificationNumber: "",
      frontDocument: null,
      backDocument: null,
      consent: false,
    },
    qualifications: [
      {
        level: "",
        title: "",
        institution: "",
        fieldOfStudy: "",
        graduationYear: new Date().getFullYear(),
        certificate: null,
      },
    ],
    experience: {
      years: 0,
      currentOccupation: "",
      isSchoolTeacher: false,
      teachingInstitution: "",
      biography: "",
      studentLevelsTaught: [""],
      teachingLanguages: [language],
      specialExpertise: [""],
    },
    selections: {
      educationLevels: [],
      curriculums: [],
      subjects: [],
      categories: [],
    },
    serviceArea: {
      mode: "online",
      state: "",
      district: "",
      postcode: "",
      radiusKm: 0,
      travelFeeAmount: 0,
      acceptsStudentHome: true,
      acceptsTutorLocation: false,
      acceptsPublicLocation: false,
    },
    rates: [
      {
        subject: "",
        educationLevel: "",
        mode: "online",
        durationMinutes: 60,
        groupType: "individual",
        sessionType: "standard",
        amount: 0,
      },
    ],
    availability: [
      {
        dayOfWeek: 1,
        startTime: "",
        endTime: "",
        timezone: "Asia/Kuala_Lumpur",
        mode: "online",
        active: true,
      },
    ],
    declarations: {
      accurate: false,
      authentic: false,
      terms: false,
      childSafety: false,
      noOffPlatformPayment: false,
      qualityMonitoring: false,
    },
  };
}

