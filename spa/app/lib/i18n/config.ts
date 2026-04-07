export const LOCALE_NAME = "lng";

export const supportedLocales = ["zh", "en"] as const;

export const defaultLocale = "en";

export type Locale = (typeof supportedLocales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};
