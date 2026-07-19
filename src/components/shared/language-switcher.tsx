"use client";

import { useRouter } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Locale } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/use-translations";

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, setLocale, t } = useTranslations();

  function handleChange(value: string) {
    const nextLocale = value as Locale;
    setLocale(nextLocale);
    router.refresh();
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-[132px]" aria-label={t("common.language")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="ms">{t("common.malay")}</SelectItem>
        <SelectItem value="en">{t("common.english")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
