"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { FileSearch, LockKeyhole, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/lib/i18n/use-translations";
import { demoTutorApplications } from "@/lib/tutor-onboarding/demo-applications";
import { stateOptions, subjectOptions } from "@/lib/tutor-onboarding/options";
import { assertTransition, type TutorApplicationStatus } from "@/lib/tutor-onboarding/status-transitions";
import type { TutorApplication } from "@/lib/tutor-onboarding/types";

const adminProfileId = "admin-demo-profile";
const localeDateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

type PendingAction = {
  applicationId: string;
  to: TutorApplicationStatus;
  actionKey: "startReview" | "requestChanges" | "approve" | "reject" | "suspend";
  requiresReason: boolean;
};

export function AdminTutorVerificationPanel() {
  const { locale, t } = useTranslations();
  const [applications, setApplications] = useState(demoTutorApplications);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signedDocumentId, setSignedDocumentId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [reason, setReason] = useState("");

  const selectedApplication = applications.find((application) => application.id === selectedId) ?? null;
  const filteredApplications = applications.filter((application) => {
    const matchesQuery = application.personal.displayName.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || application.status === statusFilter;
    const matchesState = stateFilter === "all" || application.personal.state === stateFilter;
    const matchesSubject = subjectFilter === "all" || application.subjects.includes(subjectFilter);

    return matchesQuery && matchesStatus && matchesState && matchesSubject;
  });

  const metrics = {
    applications: applications.length,
    pending: applications.filter((application) => ["submitted", "resubmitted", "under_review"].includes(application.status)).length,
    approved: applications.filter((application) => application.status === "approved").length,
    changes: applications.filter((application) => application.status === "changes_requested").length,
  };

  function openPendingAction(action: PendingAction) {
    setReason("");
    setPendingAction(action);
  }

  function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.requiresReason && reason.trim().length < 4) {
      toast.error(t("validation.reason"));
      return;
    }

    const application = applications.find((item) => item.id === pendingAction.applicationId);

    if (!application) {
      return;
    }

    try {
      assertTransition({
        actorRole: "admin",
        actorProfileId: adminProfileId,
        ownerProfileId: application.ownerProfileId,
        from: application.status,
        to: pendingAction.to,
      });
    } catch {
      toast.error(t("adminVerification.invalidTransition"));
      return;
    }

    const note = reason.trim() || t(`adminVerification.${pendingAction.actionKey}`);
    const timestamp = new Date().toISOString();

    setApplications((current) =>
      current.map((item) =>
        item.id === pendingAction.applicationId
          ? {
              ...item,
              status: pendingAction.to,
              reviewedAt: timestamp,
              approvedAt: pendingAction.to === "approved" ? timestamp : item.approvedAt,
              adminNotes: [{ ms: note, en: note }, ...item.adminNotes],
              correctionNotes:
                pendingAction.to === "changes_requested" ? [{ ms: note, en: note }, ...item.correctionNotes] : item.correctionNotes,
              history: [
                {
                  id: `hist-${pendingAction.to}-${Date.now()}`,
                  actorRole: "admin",
                  action: `admin_${pendingAction.actionKey}`,
                  oldStatus: item.status,
                  newStatus: pendingAction.to,
                  at: timestamp,
                  note: { ms: note, en: note },
                },
                ...item.history,
              ],
            }
          : item,
      ),
    );

    setPendingAction(null);
    setReason("");
    toast.success(t("adminVerification.actionSuccess"));
  }

  function updateDocumentStatus(applicationId: string, documentId: string, status: "verified" | "changes_requested") {
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              documents: application.documents.map((document) => (document.id === documentId ? { ...document, status } : document)),
              history: [
                {
                  id: `hist-doc-${documentId}-${Date.now()}`,
                  actorRole: "admin",
                  action: "document_verification_changed",
                  at: new Date().toISOString(),
                  note: { ms: t(`documentStatus.${status}`), en: t(`documentStatus.${status}`) },
                },
                ...application.history,
              ],
            }
          : application,
      ),
    );
    toast.success(t("adminVerification.actionSuccess"));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700">{t("adminVerification.eyebrow")}</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">{t("adminVerification.title")}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{t("adminVerification.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title={t("adminVerification.applications")} value={metrics.applications} />
        <Metric title={t("adminVerification.pendingReview")} value={metrics.pending} />
        <Metric title={t("adminVerification.approvedTutors")} value={metrics.approved} />
        <Metric title={t("adminVerification.changesRequested")} value={metrics.changes} />
      </div>

      <Card className="rounded-lg border-slate-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">{t("common.filters")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("adminVerification.searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <FilterSelect label={t("adminVerification.statusFilter")} value={statusFilter} onValueChange={setStatusFilter}>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {["submitted", "under_review", "changes_requested", "resubmitted", "approved", "rejected", "suspended"].map((status) => (
              <SelectItem key={status} value={status}>
                {t(`status.${status}`)}
              </SelectItem>
            ))}
          </FilterSelect>
          <FilterSelect label={t("adminVerification.stateFilter")} value={stateFilter} onValueChange={setStateFilter}>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {stateOptions.map((state) => (
              <SelectItem key={state.value} value={state.value}>
                {t(state.labelKey)}
              </SelectItem>
            ))}
          </FilterSelect>
          <FilterSelect label={t("adminVerification.subjectFilter")} value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {subjectOptions.map((subject) => (
              <SelectItem key={subject.value} value={subject.value}>
                {t(subject.labelKey)}
              </SelectItem>
            ))}
          </FilterSelect>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-slate-200 shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("adminVerification.tutor")}</TableHead>
                  <TableHead>{t("adminVerification.state")}</TableHead>
                  <TableHead>{t("adminVerification.subject")}</TableHead>
                  <TableHead>{t("adminVerification.completion")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("adminVerification.risk")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <p className="p-4 text-sm text-slate-500">{t("adminVerification.empty")}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.personal.displayName}</TableCell>
                      <TableCell>{application.personal.state}</TableCell>
                      <TableCell>{application.subjects.join(", ")}</TableCell>
                      <TableCell>
                        <div className="min-w-28 space-y-1">
                          <Progress value={application.completionPercent} />
                          <span className="text-xs text-slate-500">{application.completionPercent}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusTone(application.status)}>{t(`status.${application.status}`)}</Badge>
                      </TableCell>
                      <TableCell>{t(`risk.${application.risk}`)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedId(application.id)}>
                            <FileSearch className="size-4" />
                            {t("adminVerification.viewApplication")}
                          </Button>
                          <ActionButtons application={application} onAction={openPendingAction} t={t} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedApplication)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>{t("adminVerification.fullApplication")}</DialogTitle>
                <DialogDescription>{selectedApplication.personal.displayName}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <InfoPanel title={t("onboarding.steps.personal")} rows={[selectedApplication.personal.state, selectedApplication.personal.district, selectedApplication.personal.postcode]} />
                  <InfoPanel title={t("adminVerification.qualification")} rows={selectedApplication.qualifications.map((item) => item.title)} />
                  <InfoPanel title={t("adminVerification.serviceArea")} rows={[selectedApplication.serviceArea.mode, selectedApplication.serviceArea.district]} />
                </div>
                <Alert>
                  <LockKeyhole className="size-4" />
                  <AlertTitle>{t("adminVerification.privateFields")}</AlertTitle>
                  <AlertDescription>{t("onboarding.privateStorageNotice")}</AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-950">{t("adminVerification.documents")}</h3>
                  {selectedApplication.documents.map((document) => (
                    <div key={document.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-950">{document.label[locale]}</p>
                        <p className="text-sm text-slate-500">{document.bucketId} / {document.sizeLabel}</p>
                        <Badge variant="outline" className="mt-2">
                          {t(`documentStatus.${document.status}`)}
                        </Badge>
                        {signedDocumentId === document.id && (
                          <p className="mt-2 text-xs text-blue-700">{t("adminVerification.signedUrlReady")}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSignedDocumentId(document.id)}>
                          {t("adminVerification.signedUrl")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateDocumentStatus(selectedApplication.id, document.id, "verified")}>
                          {t("adminVerification.verifyDocument")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateDocumentStatus(selectedApplication.id, document.id, "changes_requested")}>
                          {t("adminVerification.markDocumentNeedsChanges")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoPanel title={t("adminVerification.rates")} rows={selectedApplication.rates.map((rate) => `${rate.subject} RM${rate.amount}`)} />
                  <InfoPanel title={t("adminVerification.availability")} rows={selectedApplication.availability.map((slot) => `${slot.dayOfWeek}: ${slot.startTime}-${slot.endTime}`)} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-950">{t("adminVerification.history")}</h3>
                  {selectedApplication.history.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                      <p className="font-medium text-slate-950">{entry.action}</p>
                      <p className="text-slate-500">{formatDate(entry.at, locale)}</p>
                      <p className="mt-1 text-slate-600">{entry.note[locale]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminVerification.confirmTitle")}</DialogTitle>
            <DialogDescription>{t("adminVerification.confirmDescription")}</DialogDescription>
          </DialogHeader>
          {pendingAction?.requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="admin-reason">{t("common.reason")}</Label>
              <Textarea id="admin-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t("adminVerification.reasonPlaceholder")} />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingAction(null)}>
              {t("common.cancel")}
            </Button>
            <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700" onClick={confirmPendingAction}>
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-none">
      <CardContent className="p-4">
        <div className="mb-3 grid size-9 place-items-center rounded-md bg-blue-50 text-blue-700">
          <ShieldCheck className="size-4" />
        </div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  children,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

function ActionButtons({
  application,
  onAction,
  t,
}: {
  application: TutorApplication;
  onAction: (action: PendingAction) => void;
  t: (key: string) => string;
}) {
  const actions = getActionsForStatus(application.status);

  return (
    <>
      {actions.map((action) => (
        <Button
          key={action.actionKey}
          size="sm"
          variant="outline"
          onClick={() =>
            onAction({
              applicationId: application.id,
              to: action.to,
              actionKey: action.actionKey,
              requiresReason: action.requiresReason,
            })
          }
        >
          {t(`adminVerification.${action.actionKey}`)}
        </Button>
      ))}
    </>
  );
}

function getActionsForStatus(status: TutorApplicationStatus): Array<Omit<PendingAction, "applicationId">> {
  if (status === "submitted" || status === "resubmitted") {
    return [{ to: "under_review", actionKey: "startReview", requiresReason: false }];
  }

  if (status === "under_review") {
    return [
      { to: "changes_requested", actionKey: "requestChanges", requiresReason: true },
      { to: "approved", actionKey: "approve", requiresReason: false },
      { to: "rejected", actionKey: "reject", requiresReason: true },
    ];
  }

  if (status === "approved") {
    return [{ to: "suspended", actionKey: "suspend", requiresReason: true }];
  }

  return [];
}

function InfoPanel({ title, rows }: { title: string; rows: string[] }) {
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

function formatDate(value: string | undefined, locale: "ms" | "en") {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale === "ms" ? "ms-MY" : "en-MY", localeDateOptions).format(new Date(value));
}
