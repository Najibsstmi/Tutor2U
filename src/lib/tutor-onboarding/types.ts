import type { TutorApplicationStatus } from "@/lib/tutor-onboarding/status-transitions";

export type LocalizedText = {
  ms: string;
  en: string;
};

export type UploadedDocument = {
  id: string;
  label: LocalizedText;
  bucketId: "tutor-identity-documents" | "tutor-qualification-documents" | "tutor-profile-images";
  path: string;
  status: "submitted" | "verified" | "changes_requested";
  sizeLabel: string;
  private: boolean;
};

export type TutorQualification = {
  id: string;
  level: string;
  title: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: number;
  certificateName: string;
  verificationStatus: "submitted" | "verified" | "changes_requested";
  adminNotes: LocalizedText;
};

export type TutorRate = {
  id: string;
  subject: string;
  educationLevel: string;
  mode: "online" | "physical";
  durationMinutes: number;
  groupType: "individual" | "group";
  sessionType: "trial" | "standard";
  amount: number;
};

export type WeeklyAvailabilitySlot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: "Asia/Kuala_Lumpur";
  mode: "online" | "physical";
  active: boolean;
};

export type VerificationHistoryEntry = {
  id: string;
  actorRole: "tutor" | "admin";
  action: string;
  oldStatus?: TutorApplicationStatus;
  newStatus?: TutorApplicationStatus;
  at: string;
  note: LocalizedText;
};

export type TutorApplication = {
  id: string;
  ownerProfileId: string;
  tutorProfileId: string;
  status: TutorApplicationStatus;
  completionPercent: number;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  updatedAt: string;
  risk: "low" | "medium" | "high";
  personal: {
    fullName: string;
    displayName: string;
    gender: string;
    dateOfBirth: string;
    nationality: string;
    state: string;
    district: string;
    postcode: string;
    preferredLanguage: string;
    shortBiography: LocalizedText;
  };
  identity: {
    documentType: "mykad" | "passport" | "permanent_resident";
    maskedIdentificationNumber: string;
    consent: boolean;
  };
  qualifications: TutorQualification[];
  experience: {
    years: number;
    currentOccupation: string;
    isSchoolTeacher: boolean;
    teachingInstitution: string;
    biography: LocalizedText;
    studentLevelsTaught: string[];
    teachingLanguages: string[];
    specialExpertise: string[];
  };
  educationLevels: string[];
  curriculums: string[];
  subjects: string[];
  categories: string[];
  serviceArea: {
    mode: "online" | "physical" | "both";
    state: string;
    district: string;
    postcode: string;
    radiusKm: number;
    travelFeeAmount: number;
    acceptsStudentHome: boolean;
    acceptsTutorLocation: boolean;
    acceptsPublicLocation: boolean;
  };
  rates: TutorRate[];
  availability: WeeklyAvailabilitySlot[];
  declarations: {
    accurate: boolean;
    authentic: boolean;
    terms: boolean;
    childSafety: boolean;
    noOffPlatformPayment: boolean;
    qualityMonitoring: boolean;
  };
  documents: UploadedDocument[];
  missingItems: LocalizedText[];
  correctionNotes: LocalizedText[];
  adminNotes: LocalizedText[];
  history: VerificationHistoryEntry[];
};
