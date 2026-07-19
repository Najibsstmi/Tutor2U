import enMessages from "../../../messages/en.json";
import msMessages from "../../../messages/ms.json";

export const LOCALE_COOKIE = "tutor2u_locale";
export const locales = ["ms", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ms";

const dictionaries = {
  ms: msMessages,
  en: enMessages,
} as const;

type MessageValue = string | { [key: string]: MessageValue };

export function isLocale(value: string | undefined): value is Locale {
  return value === "ms" || value === "en";
}

export function getLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

function readMessage(tree: MessageValue, path: string[]): string | undefined {
  let current: MessageValue | undefined = tree;

  for (const part of path) {
    if (!current || typeof current === "string") {
      return undefined;
    }

    current = current[part];
  }

  return typeof current === "string" ? current : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  values?: Record<string, string | number>,
): string {
  const message =
    readMessage(dictionaries[locale] as MessageValue, key.split(".")) ??
    readMessage(dictionaries[defaultLocale] as MessageValue, key.split(".")) ??
    key;

  if (!values) {
    return message;
  }

  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    message,
  );
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
