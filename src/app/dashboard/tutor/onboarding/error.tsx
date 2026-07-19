"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function Error({ reset }: { reset: () => void }) {
  const { t } = useTranslations();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>{t("common.error")}</AlertTitle>
        <AlertDescription>{t("onboarding.submitBlocked")}</AlertDescription>
      </Alert>
      <Button className="mt-4" onClick={reset}>
        {t("common.confirm")}
      </Button>
    </main>
  );
}
