"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, FileText, LockKeyhole, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm, type FieldPath, type Resolver, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/lib/i18n/use-translations";
import {
  categoryOptions,
  curriculumOptions,
  educationLevelOptions,
  stateOptions,
  subjectOptions,
  type Option,
} from "@/lib/tutor-onboarding/options";
import { assertTransition, type TutorApplicationStatus } from "@/lib/tutor-onboarding/status-transitions";
import { createTutorApplicationSchema, type TutorApplicationFormValues, type UploadValue } from "@/lib/tutor-onboarding/validation";

const draftStorageKey = "tutor2u_tutor_application_draft";
const actorProfileId = "tutor-demo-owner";

const stepKeys = [
  "personal",
  "identity",
  "qualifications",
  "experience",
  "subjects",
  "service",
  "rates",
  "availability",
  "review",
] as const;

const stepFieldGroups = [
  ["personal"],
  ["identity"],
  ["qualifications"],
  ["experience"],
  ["selections"],
  ["serviceArea"],
  ["rates"],
  ["availability"],
  ["declarations"],
] as const;

const defaultUpload = (name: string, type = "application/pdf", size = 420000): UploadValue => ({ name, type, size });

const defaultValues: TutorApplicationFormValues = {
  personal: {
    fullName: "Nur Aisyah Rahman",
    displayName: "Cikgu Aisyah Rahman",
    profilePhoto: defaultUpload("profile-photo.png", "image/png", 280000),
    gender: "female",
    dateOfBirth: "1990-04-12",
    nationality: "Malaysia",
    state: "Kuala Lumpur",
    district: "Kuala Lumpur",
    postcode: "50480",
    preferredLanguage: "Bahasa Melayu",
    shortBiography:
      "Guru Matematik berpengalaman yang membantu murid SPM membina asas algebra dan keyakinan menjawab soalan KBAT.",
  },
  identity: {
    documentType: "mykad",
    identificationNumber: "900412-14-0000",
    frontDocument: defaultUpload("mykad-front.pdf"),
    backDocument: defaultUpload("mykad-back.pdf"),
    consent: true,
  },
  qualifications: [
    {
      level: "Sarjana Muda",
      title: "Ijazah Sarjana Muda Pendidikan Matematik",
      institution: "Universiti Malaya",
      fieldOfStudy: "Pendidikan Matematik",
      graduationYear: 2013,
      certificate: defaultUpload("degree-certificate.pdf"),
    },
  ],
  experience: {
    years: 9,
    currentOccupation: "Guru sekolah menengah",
    isSchoolTeacher: true,
    teachingInstitution: "SMK sekitar Kuala Lumpur",
    biography: "Mengajar Matematik KSSM dan kelas intensif SPM dengan latihan bertahap serta analisis kesilapan.",
    studentLevelsTaught: ["SPM", "Secondary school"],
    teachingLanguages: ["Bahasa Melayu", "English"],
    specialExpertise: ["Matematik Tambahan", "Teknik menjawab"],
  },
  selections: {
    educationLevels: ["Secondary school", "SPM"],
    curriculums: ["KSSM"],
    subjects: ["Matematik", "Matematik Tambahan"],
    categories: ["STEM", "SPM"],
  },
  serviceArea: {
    mode: "both",
    state: "Kuala Lumpur",
    district: "Kuala Lumpur",
    postcode: "50480",
    radiusKm: 15,
    travelFeeAmount: 20,
    acceptsStudentHome: true,
    acceptsTutorLocation: false,
    acceptsPublicLocation: true,
  },
  rates: [
    {
      subject: "Matematik Tambahan",
      educationLevel: "SPM",
      mode: "online",
      durationMinutes: 90,
      groupType: "individual",
      sessionType: "standard",
      amount: 90,
    },
  ],
  availability: [
    {
      dayOfWeek: 1,
      startTime: "20:00",
      endTime: "21:30",
      timezone: "Asia/Kuala_Lumpur",
      mode: "online",
      active: true,
    },
  ],
  declarations: {
    accurate: true,
    authentic: true,
    terms: true,
    childSafety: true,
    noOffPlatformPayment: true,
    qualityMonitoring: true,
  },
};

type SavedDraft = {
  values: TutorApplicationFormValues;
  status: TutorApplicationStatus;
  history: string[];
};

export function TutorOnboardingFlow() {
  const { locale, t } = useTranslations();
  const [hydrated, setHydrated] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [applicationStatus, setApplicationStatus] = useState<TutorApplicationStatus>("draft");
  const [history, setHistory] = useState<string[]>([]);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved">("idle");

  const schema = useMemo(() => createTutorApplicationSchema(locale), [locale]);
  const form = useForm<TutorApplicationFormValues>({
    resolver: zodResolver(schema) as Resolver<TutorApplicationFormValues>,
    mode: "onBlur",
    defaultValues,
  });

  const qualifications = useFieldArray({ control: form.control, name: "qualifications" });
  const rates = useFieldArray({ control: form.control, name: "rates" });
  const availability = useFieldArray({ control: form.control, name: "availability" });
  const watchedValues = form.watch();
  const completionPercent = calculateCompletion(watchedValues);
  const canSubmit = applicationStatus === "draft" || applicationStatus === "changes_requested";

  useEffect(() => {
    const rawDraft = window.localStorage.getItem(draftStorageKey);

    if (rawDraft) {
      try {
        const draft = JSON.parse(rawDraft) as SavedDraft;
        form.reset(draft.values);
        setApplicationStatus(draft.status);
        setHistory(draft.history ?? []);
      } catch {
        window.localStorage.removeItem(draftStorageKey);
      }
    }

    setHydrated(true);
  }, [form]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const subscription = form.watch(() => {
      setAutosaveState("saving");
      const timeout = window.setTimeout(() => {
        window.localStorage.setItem(
          draftStorageKey,
          JSON.stringify({ values: form.getValues(), status: applicationStatus, history } satisfies SavedDraft),
        );
        setAutosaveState("saved");
      }, 500);
      window.setTimeout(() => window.clearTimeout(timeout), 700);
    });

    return () => subscription.unsubscribe();
  }, [applicationStatus, form, history, hydrated]);

  if (!hydrated) {
    return <OnboardingSkeleton />;
  }

  async function goNext() {
    const fields = stepFieldGroups[activeStep];
    const isValid = await form.trigger(fields as never);

    if (!isValid) {
      toast.error(t("onboarding.submitBlocked"));
      return;
    }

    setActiveStep((current) => Math.min(current + 1, stepKeys.length - 1));
  }

  function goPrevious() {
    setActiveStep((current) => Math.max(current - 1, 0));
  }

  function saveDraft() {
    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({ values: form.getValues(), status: applicationStatus, history } satisfies SavedDraft),
    );
    toast.success(t("onboarding.draftSaved"));
  }

  function submitApplication(values: TutorApplicationFormValues) {
    const nextStatus: TutorApplicationStatus = applicationStatus === "changes_requested" ? "resubmitted" : "submitted";

    try {
      assertTransition({
        actorRole: "tutor",
        actorProfileId,
        ownerProfileId: actorProfileId,
        from: applicationStatus,
        to: nextStatus,
      });
    } catch {
      toast.error(t("adminVerification.invalidTransition"));
      return;
    }

    const historyItem = `${new Date().toLocaleString(locale === "ms" ? "ms-MY" : "en-MY")} - ${t(`status.${nextStatus}`)}`;
    setApplicationStatus(nextStatus);
    setHistory((current) => [historyItem, ...current]);
    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({ values, status: nextStatus, history: [historyItem, ...history] } satisfies SavedDraft),
    );
    toast.success(t(nextStatus === "resubmitted" ? "onboarding.resubmitSuccess" : "onboarding.submitSuccess"));
  }

  const errors = form.formState.errors;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <Card className="rounded-lg border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">{t("onboarding.currentStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge className={statusTone(applicationStatus)}>{t(`status.${applicationStatus}`)}</Badge>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{t("onboarding.completion")}</span>
                <span className="text-slate-500">{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} />
            </div>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle2 className="size-4 text-emerald-600" />
              {autosaveLabel(autosaveState, t)}
            </p>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-slate-200 bg-white p-2">
          {stepKeys.map((stepKey, index) => (
            <button
              key={stepKey}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                activeStep === index ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full border text-xs">{index + 1}</span>
              <span>{t(`onboarding.steps.${stepKey}`)}</span>
            </button>
          ))}
        </div>

        <Card className="rounded-lg border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">{t("onboarding.missingInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {completionPercent === 100 ? (
              <p>{t("common.complete")}</p>
            ) : (
              <p>{t("common.incomplete")}</p>
            )}
            {applicationStatus === "changes_requested" && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertCircle className="size-4" />
                <AlertTitle>{t("onboarding.corrections")}</AlertTitle>
                <AlertDescription>{t("onboarding.privateStorageNotice")}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </aside>

      <form onSubmit={form.handleSubmit(submitApplication, () => toast.error(t("onboarding.submitBlocked")))} className="space-y-4">
        <Card className="rounded-lg border-slate-200 shadow-none">
          <CardHeader>
            <p className="text-sm font-medium text-blue-700">{t("onboarding.eyebrow")}</p>
            <CardTitle className="text-2xl">{t("onboarding.title")}</CardTitle>
            <p className="text-sm text-slate-500">{t("onboarding.subtitle")}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>{t("common.error")}</AlertTitle>
                <AlertDescription>{t("onboarding.submitBlocked")}</AlertDescription>
              </Alert>
            )}

            {activeStep === 0 && <PersonalStep form={form} t={t} />}
            {activeStep === 1 && <IdentityStep form={form} t={t} onUpload={setUploadValue} />}
            {activeStep === 2 && <QualificationsStep form={form} fields={qualifications.fields} append={qualifications.append} remove={qualifications.remove} t={t} onUpload={setUploadValue} />}
            {activeStep === 3 && <ExperienceStep form={form} t={t} />}
            {activeStep === 4 && <SubjectsStep form={form} t={t} />}
            {activeStep === 5 && <ServiceStep form={form} t={t} />}
            {activeStep === 6 && <RatesStep form={form} fields={rates.fields} append={rates.append} remove={rates.remove} t={t} />}
            {activeStep === 7 && <AvailabilityStep form={form} fields={availability.fields} append={availability.append} remove={availability.remove} t={t} />}
            {activeStep === 8 && <ReviewStep values={watchedValues} status={applicationStatus} history={history} t={t} />}
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" onClick={saveDraft}>
            <FileText className="size-4" />
            {t("common.saveDraft")}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goPrevious} disabled={activeStep === 0}>
              {t("common.previous")}
            </Button>
            {activeStep < stepKeys.length - 1 ? (
              <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700" onClick={goNext}>
                {t("common.next")}
              </Button>
            ) : (
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={!canSubmit}>
                {applicationStatus === "changes_requested" ? t("onboarding.resubmit") : t("common.submit")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );

  function setUploadValue(path: UploadFieldPath, file: File | undefined) {
    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/jpg", "application/pdf"].includes(file.type)) {
      toast.error(t("validation.fileType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("validation.fileSize"));
      return;
    }

    form.setValue(path, { name: file.name, type: file.type, size: file.size }, { shouldValidate: true, shouldDirty: true });
  }
}

type TFunction = (key: string, values?: Record<string, string | number>) => string;
type FormHandle = UseFormReturn<TutorApplicationFormValues>;
type UploadFieldPath =
  | "personal.profilePhoto"
  | "identity.frontDocument"
  | "identity.backDocument"
  | `qualifications.${number}.certificate`;

function PersonalStep({ form, t }: { form: FormHandle; t: TFunction }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextField form={form} name="personal.fullName" label={t("onboarding.fields.fullName")} />
      <TextField form={form} name="personal.displayName" label={t("onboarding.fields.displayName")} />
      <SelectField
        control={form.control}
        name="personal.gender"
        label={t("onboarding.fields.gender")}
        options={[
          { value: "female", label: t("onboarding.options.female") },
          { value: "male", label: t("onboarding.options.male") },
          { value: "other", label: t("onboarding.options.other") },
        ]}
      />
      <TextField form={form} name="personal.dateOfBirth" label={t("onboarding.fields.dateOfBirth")} type="date" />
      <TextField form={form} name="personal.nationality" label={t("onboarding.fields.nationality")} />
      <SelectField control={form.control} name="personal.state" label={t("onboarding.fields.state")} options={localizedOptions(stateOptions, t)} />
      <TextField form={form} name="personal.district" label={t("onboarding.fields.district")} />
      <TextField form={form} name="personal.postcode" label={t("onboarding.fields.postcode")} inputMode="numeric" />
      <SelectField
        control={form.control}
        name="personal.preferredLanguage"
        label={t("onboarding.fields.preferredLanguage")}
        options={[
          { value: "Bahasa Melayu", label: t("common.malay") },
          { value: "English", label: t("common.english") },
        ]}
      />
      <FileField form={form} name="personal.profilePhoto" label={t("onboarding.fields.profilePhoto")} optional t={t} />
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="personal.shortBiography">{t("onboarding.fields.shortBiography")}</Label>
        <Textarea id="personal.shortBiography" {...form.register("personal.shortBiography")} />
        <FieldError message={form.formState.errors.personal?.shortBiography?.message} />
      </div>
    </div>
  );
}

function IdentityStep({ form, t, onUpload }: { form: FormHandle; t: TFunction; onUpload: (path: UploadFieldPath, file: File | undefined) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SelectField
        control={form.control}
        name="identity.documentType"
        label={t("onboarding.fields.identityType")}
        options={[
          { value: "mykad", label: t("onboarding.options.mykad") },
          { value: "passport", label: t("onboarding.options.passport") },
          { value: "permanent_resident", label: t("onboarding.options.permanentResident") },
        ]}
      />
      <TextField form={form} name="identity.identificationNumber" label={t("onboarding.fields.identificationNumber")} />
      <FileInput label={t("onboarding.fields.frontDocument")} onChange={(file) => onUpload("identity.frontDocument", file)} current={form.watch("identity.frontDocument")?.name} t={t} />
      <FileInput label={t("onboarding.fields.backDocument")} onChange={(file) => onUpload("identity.backDocument", file)} current={form.watch("identity.backDocument")?.name} t={t} optional />
      <Controller
        control={form.control}
        name="identity.consent"
        render={({ field }) => (
          <CheckboxRow
            id="identity.consent"
            label={t("onboarding.fields.identityConsent")}
            checked={field.value}
            onCheckedChange={field.onChange}
            error={form.formState.errors.identity?.consent?.message}
          />
        )}
      />
      <Alert className="md:col-span-2">
        <LockKeyhole className="size-4" />
        <AlertTitle>{t("common.documents")}</AlertTitle>
        <AlertDescription>{t("onboarding.privateStorageNotice")}</AlertDescription>
      </Alert>
    </div>
  );
}

function QualificationsStep({
  form,
  fields,
  append,
  remove,
  t,
  onUpload,
}: {
  form: FormHandle;
  fields: { id: string }[];
  append: (value: TutorApplicationFormValues["qualifications"][number]) => void;
  remove: (index: number) => void;
  t: TFunction;
  onUpload: (path: UploadFieldPath, file: File | undefined) => void;
}) {
  return (
    <div className="space-y-4">
      {fields.length === 0 && <EmptyState t={t} />}
      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2">
          <TextField form={form} name={`qualifications.${index}.level`} label={t("onboarding.fields.qualificationLevel")} />
          <TextField form={form} name={`qualifications.${index}.title`} label={t("onboarding.fields.qualificationTitle")} />
          <TextField form={form} name={`qualifications.${index}.institution`} label={t("onboarding.fields.institution")} />
          <TextField form={form} name={`qualifications.${index}.fieldOfStudy`} label={t("onboarding.fields.fieldOfStudy")} />
          <TextField form={form} name={`qualifications.${index}.graduationYear`} label={t("onboarding.fields.graduationYear")} type="number" />
          <FileInput
            label={t("onboarding.fields.certificate")}
            onChange={(file) => onUpload(`qualifications.${index}.certificate`, file)}
            current={form.watch(`qualifications.${index}.certificate`)?.name}
            t={t}
          />
          <Button type="button" variant="outline" className="md:w-fit" onClick={() => remove(index)}>
            <Trash2 className="size-4" />
            {t("onboarding.removeItem")}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            level: "",
            title: "",
            institution: "",
            fieldOfStudy: "",
            graduationYear: new Date().getFullYear(),
            certificate: null,
          })
        }
      >
        <Plus className="size-4" />
        {t("onboarding.addQualification")}
      </Button>
    </div>
  );
}

function ExperienceStep({ form, t }: { form: FormHandle; t: TFunction }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextField form={form} name="experience.years" label={t("onboarding.fields.experienceYears")} type="number" />
      <TextField form={form} name="experience.currentOccupation" label={t("onboarding.fields.currentOccupation")} />
      <Controller
        control={form.control}
        name="experience.isSchoolTeacher"
        render={({ field }) => (
          <CheckboxRow
            id="experience.isSchoolTeacher"
            label={t("onboarding.options.schoolTeacher")}
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <TextField form={form} name="experience.teachingInstitution" label={t("onboarding.fields.teachingInstitution")} />
      <TextField form={form} name="experience.studentLevelsTaught.0" label={t("onboarding.fields.studentLevelsTaught")} />
      <TextField form={form} name="experience.teachingLanguages.0" label={t("onboarding.fields.teachingLanguages")} />
      <TextField form={form} name="experience.specialExpertise.0" label={t("onboarding.fields.specialExpertise")} />
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="experience.biography">{t("onboarding.fields.experienceBio")}</Label>
        <Textarea id="experience.biography" {...form.register("experience.biography")} />
        <FieldError message={form.formState.errors.experience?.biography?.message} />
      </div>
    </div>
  );
}

function SubjectsStep({ form, t }: { form: FormHandle; t: TFunction }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Controller
        control={form.control}
        name="selections.educationLevels"
        render={({ field }) => <CheckboxGroup label={t("onboarding.fields.educationLevels")} options={educationLevelOptions} value={field.value} onChange={field.onChange} t={t} />}
      />
      <Controller
        control={form.control}
        name="selections.curriculums"
        render={({ field }) => <CheckboxGroup label={t("onboarding.fields.curriculums")} options={curriculumOptions} value={field.value} onChange={field.onChange} t={t} />}
      />
      <Controller
        control={form.control}
        name="selections.subjects"
        render={({ field }) => <CheckboxGroup label={t("onboarding.fields.subjects")} options={subjectOptions} value={field.value} onChange={field.onChange} t={t} />}
      />
      <Controller
        control={form.control}
        name="selections.categories"
        render={({ field }) => <CheckboxGroup label={t("onboarding.fields.categories")} options={categoryOptions} value={field.value} onChange={field.onChange} t={t} />}
      />
    </div>
  );
}

function ServiceStep({ form, t }: { form: FormHandle; t: TFunction }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SelectField
        control={form.control}
        name="serviceArea.mode"
        label={t("onboarding.fields.teachingMode")}
        options={[
          { value: "online", label: t("common.online") },
          { value: "physical", label: t("common.physical") },
          { value: "both", label: t("common.both") },
        ]}
      />
      <SelectField control={form.control} name="serviceArea.state" label={t("onboarding.fields.state")} options={localizedOptions(stateOptions, t)} />
      <TextField form={form} name="serviceArea.district" label={t("onboarding.fields.district")} />
      <TextField form={form} name="serviceArea.postcode" label={t("onboarding.fields.postcode")} inputMode="numeric" />
      <TextField form={form} name="serviceArea.radiusKm" label={t("onboarding.fields.serviceRadius")} type="number" />
      <TextField form={form} name="serviceArea.travelFeeAmount" label={t("onboarding.fields.travelFee")} type="number" />
      <BooleanField form={form} name="serviceArea.acceptsStudentHome" label={t("onboarding.fields.studentHome")} />
      <BooleanField form={form} name="serviceArea.acceptsTutorLocation" label={t("onboarding.fields.tutorLocation")} />
      <BooleanField form={form} name="serviceArea.acceptsPublicLocation" label={t("onboarding.fields.publicLocation")} />
    </div>
  );
}

function RatesStep({
  form,
  fields,
  append,
  remove,
  t,
}: {
  form: FormHandle;
  fields: { id: string }[];
  append: (value: TutorApplicationFormValues["rates"][number]) => void;
  remove: (index: number) => void;
  t: TFunction;
}) {
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2 xl:grid-cols-3">
          <SelectField control={form.control} name={`rates.${index}.subject`} label={t("onboarding.fields.rateSubject")} options={localizedOptions(subjectOptions, t)} />
          <SelectField control={form.control} name={`rates.${index}.educationLevel`} label={t("onboarding.fields.rateLevel")} options={localizedOptions(educationLevelOptions, t)} />
          <SelectField
            control={form.control}
            name={`rates.${index}.mode`}
            label={t("onboarding.fields.deliveryMode")}
            options={[
              { value: "online", label: t("common.online") },
              { value: "physical", label: t("common.physical") },
            ]}
          />
          <TextField form={form} name={`rates.${index}.durationMinutes`} label={t("onboarding.fields.duration")} type="number" />
          <SelectField
            control={form.control}
            name={`rates.${index}.groupType`}
            label={t("onboarding.fields.groupType")}
            options={[
              { value: "individual", label: t("onboarding.options.individual") },
              { value: "group", label: t("onboarding.options.group") },
            ]}
          />
          <SelectField
            control={form.control}
            name={`rates.${index}.sessionType`}
            label={t("onboarding.fields.standardSession")}
            options={[
              { value: "trial", label: t("onboarding.fields.trialSession") },
              { value: "standard", label: t("onboarding.fields.standardSession") },
            ]}
          />
          <TextField form={form} name={`rates.${index}.amount`} label={t("onboarding.fields.amount")} type="number" />
          <Button type="button" variant="outline" className="md:w-fit" onClick={() => remove(index)}>
            <Trash2 className="size-4" />
            {t("onboarding.removeItem")}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            subject: "Matematik",
            educationLevel: "SPM",
            mode: "online",
            durationMinutes: 60,
            groupType: "individual",
            sessionType: "trial",
            amount: 50,
          })
        }
      >
        <Plus className="size-4" />
        {t("onboarding.addRate")}
      </Button>
    </div>
  );
}

function AvailabilityStep({
  form,
  fields,
  append,
  remove,
  t,
}: {
  form: FormHandle;
  fields: { id: string }[];
  append: (value: TutorApplicationFormValues["availability"][number]) => void;
  remove: (index: number) => void;
  t: TFunction;
}) {
  const dayOptions = [
    { value: "1", label: t("onboarding.options.monday") },
    { value: "2", label: t("onboarding.options.tuesday") },
    { value: "3", label: t("onboarding.options.wednesday") },
    { value: "4", label: t("onboarding.options.thursday") },
    { value: "5", label: t("onboarding.options.friday") },
    { value: "6", label: t("onboarding.options.saturday") },
    { value: "0", label: t("onboarding.options.sunday") },
  ];

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2 xl:grid-cols-3">
          <SelectField control={form.control} name={`availability.${index}.dayOfWeek`} label={t("onboarding.fields.dayOfWeek")} options={dayOptions} />
          <TextField form={form} name={`availability.${index}.startTime`} label={t("onboarding.fields.startTime")} type="time" />
          <TextField form={form} name={`availability.${index}.endTime`} label={t("onboarding.fields.endTime")} type="time" />
          <SelectField
            control={form.control}
            name={`availability.${index}.mode`}
            label={t("onboarding.fields.deliveryMode")}
            options={[
              { value: "online", label: t("common.online") },
              { value: "physical", label: t("common.physical") },
            ]}
          />
          <TextField form={form} name={`availability.${index}.timezone`} label={t("onboarding.fields.timezone")} disabled />
          <BooleanField form={form} name={`availability.${index}.active`} label={t("common.active")} />
          <Button type="button" variant="outline" className="md:w-fit" onClick={() => remove(index)}>
            <Trash2 className="size-4" />
            {t("onboarding.removeItem")}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            dayOfWeek: 1,
            startTime: "17:00",
            endTime: "18:00",
            timezone: "Asia/Kuala_Lumpur",
            mode: "online",
            active: true,
          })
        }
      >
        <Plus className="size-4" />
        {t("onboarding.addAvailability")}
      </Button>
    </div>
  );
}

function ReviewStep({
  values,
  status,
  history,
  t,
}: {
  values: TutorApplicationFormValues;
  status: TutorApplicationStatus;
  history: string[];
  t: TFunction;
}) {
  const declarations = [
    ["accurate", values.declarations.accurate, t("onboarding.fields.accurate")],
    ["authentic", values.declarations.authentic, t("onboarding.fields.authentic")],
    ["terms", values.declarations.terms, t("onboarding.fields.terms")],
    ["childSafety", values.declarations.childSafety, t("onboarding.fields.childSafety")],
    ["noOffPlatformPayment", values.declarations.noOffPlatformPayment, t("onboarding.fields.noOffPlatformPayment")],
    ["qualityMonitoring", values.declarations.qualityMonitoring, t("onboarding.fields.qualityMonitoring")],
  ] as const;

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="size-4" />
        <AlertTitle>{t("onboarding.steps.review")}</AlertTitle>
        <AlertDescription>{t("onboarding.reviewNotice")}</AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        <SummaryBlock title={t("onboarding.steps.personal")} rows={[values.personal.displayName, values.personal.state, values.personal.district, values.personal.postcode]} />
        <SummaryBlock title={t("onboarding.steps.subjects")} rows={[...values.selections.subjects, ...values.selections.educationLevels]} />
        <SummaryBlock title={t("onboarding.steps.rates")} rows={values.rates.map((rate) => `${rate.subject} - ${t("common.currency")}${rate.amount}`)} />
        <SummaryBlock title={t("onboarding.steps.availability")} rows={values.availability.map((slot) => `${slot.dayOfWeek}: ${slot.startTime}-${slot.endTime} ${slot.timezone}`)} />
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-950">{t("common.status")}</h3>
        <Badge className={statusTone(status)}>{t(`status.${status}`)}</Badge>
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-950">{t("onboarding.steps.review")}</h3>
        {declarations.map(([key, checked, label]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className={`size-4 ${checked ? "text-emerald-600" : "text-slate-300"}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-950">{t("common.history")}</h3>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t("common.empty")}</p>
        ) : (
          <div className="mt-2 space-y-2 text-sm text-slate-600">
            {history.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TextField({
  form,
  name,
  label,
  type = "text",
  inputMode,
  disabled,
}: {
  form: FormHandle;
  name: FieldPath<TutorApplicationFormValues>;
  label: string;
  type?: string;
  inputMode?: "numeric";
  disabled?: boolean;
}) {
  const fieldState = form.getFieldState(name, form.formState);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        inputMode={inputMode}
        disabled={disabled}
        {...form.register(name, type === "number" ? { valueAsNumber: true } : undefined)}
      />
      <FieldError message={fieldState.error?.message} />
    </div>
  );
}

function SelectField({
  control,
  name,
  label,
  options,
}: {
  control: FormHandle["control"];
  name: FieldPath<TutorApplicationFormValues>;
  label: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label>{label}</Label>
          <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number.isNaN(Number(value)) ? value : coerceSelectValue(value))}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}

function BooleanField({ form, name, label }: { form: FormHandle; name: FieldPath<TutorApplicationFormValues>; label: string }) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <CheckboxRow id={name} label={label} checked={Boolean(field.value)} onCheckedChange={field.onChange} error={fieldState.error?.message} />
      )}
    />
  );
}

function FileField({
  form,
  name,
  label,
  optional,
  t,
}: {
  form: FormHandle;
  name: UploadFieldPath;
  label: string;
  optional?: boolean;
  t: TFunction;
}) {
  return (
    <FileInput
      label={label}
      current={form.watch(name)?.name}
      optional={optional}
      t={t}
      onChange={(file) => {
        if (file) {
          form.setValue(name, { name: file.name, type: file.type, size: file.size }, { shouldDirty: true, shouldValidate: true });
        }
      }}
    />
  );
}

function FileInput({
  label,
  current,
  optional,
  t,
  onChange,
}: {
  label: string;
  current?: string;
  optional?: boolean;
  t: TFunction;
  onChange: (file: File | undefined) => void;
}) {
  const id = `upload-${label.replace(/\W+/g, "-")}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} <span className="text-xs text-slate-500">{optional ? t("common.optional") : t("common.required")}</span>
      </Label>
      <Input id={id} type="file" accept="image/png,image/jpeg,application/pdf" onChange={(event) => onChange(event.target.files?.[0])} />
      {current && <p className="text-xs text-slate-500">{current}</p>}
    </div>
  );
}

function CheckboxRow({
  id,
  label,
  checked,
  onCheckedChange,
  error,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 rounded-lg border border-slate-200 p-3">
        <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
        <Label htmlFor={id} className="leading-5">
          {label}
        </Label>
      </div>
      <FieldError message={error} />
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  value,
  onChange,
  t,
}: {
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  t: TFunction;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-950">{label}</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = value.includes(option.value);
          return (
            <CheckboxRow
              key={option.value}
              id={`${label}-${option.value}`}
              label={t(option.labelKey)}
              checked={checked}
              onCheckedChange={(nextChecked) =>
                onChange(nextChecked ? [...value, option.value] : value.filter((item) => item !== option.value))
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function SummaryBlock({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {rows.map((row) => (
          <Badge key={row} variant="outline">
            {row}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-red-600">{message}</p>;
}

function EmptyState({ t }: { t: TFunction }) {
  return <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">{t("common.empty")}</p>;
}

function OnboardingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
      <Skeleton className="h-[640px] rounded-lg" />
    </div>
  );
}

function localizedOptions(options: Option[], t: TFunction) {
  return options.map((option) => ({ value: option.value, label: t(option.labelKey) }));
}

function coerceSelectValue(value: string) {
  return /^\d+$/.test(value) ? Number(value) : value;
}

function calculateCompletion(values: TutorApplicationFormValues) {
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

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function autosaveLabel(state: "idle" | "saving" | "saved", t: TFunction) {
  if (state === "saving") {
    return t("onboarding.autosaveSaving");
  }

  if (state === "saved") {
    return t("onboarding.autosaveSaved");
  }

  return t("onboarding.autosaveIdle");
}

function statusTone(status: TutorApplicationStatus) {
  const tones: Record<TutorApplicationStatus, string> = {
    draft: "border-slate-200 bg-slate-50 text-slate-700",
    submitted: "border-blue-200 bg-blue-50 text-blue-700",
    under_review: "border-amber-200 bg-amber-50 text-amber-700",
    changes_requested: "border-red-200 bg-red-50 text-red-700",
    resubmitted: "border-blue-200 bg-blue-50 text-blue-700",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
    suspended: "border-slate-300 bg-slate-100 text-slate-700",
  };

  return tones[status];
}
