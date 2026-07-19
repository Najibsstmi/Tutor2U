"use client";

import { useCallback, useSyncExternalStore } from "react";

import { defaultLocale, getLocale, LOCALE_COOKIE, type Locale, translate } from "@/lib/i18n/messages";

function readBrowserLocale(): Locale {
  if (typeof document === "undefined") {
    return defaultLocale;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];

  return getLocale(cookie);
}

export function writeBrowserLocale(locale: Locale) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("tutor2u:locale-change", { detail: locale }));
}

function subscribeToLocale(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("tutor2u:locale-change", callback);
  return () => window.removeEventListener("tutor2u:locale-change", callback);
}

export function useTranslations() {
  const locale = useSyncExternalStore(subscribeToLocale, readBrowserLocale, () => defaultLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    writeBrowserLocale(nextLocale);
  }, []);

  const t = useCallback(
    (key: string, values?: Record<string, string | number>) => translate(locale, key, values),
    [locale],
  );

  return { locale, setLocale, t };
}
