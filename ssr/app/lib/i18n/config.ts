export const LOCALE_COOKIE_KEY = "lng";

export const supportedLocales = ["zh", "en"] as const;

export const defaultLocale = "en";

export type Locale = (typeof supportedLocales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};

export function isSupportedLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}
