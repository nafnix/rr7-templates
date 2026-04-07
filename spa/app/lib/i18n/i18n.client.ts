import {
  defaultLocale,
  LOCALE_NAME,
  supportedLocales,
  type Locale,
} from "./config";
import { initI18n, i18nInstance } from "./i18n-instance";

export function isSupportedLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}

export function detectLocaleClient(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const urlLocale = urlParams.get(LOCALE_NAME);
  if (urlLocale && isSupportedLocale(urlLocale)) {
    return urlLocale;
  }

  let storedLocale: string | null = null;
  try {
    storedLocale = localStorage.getItem(LOCALE_NAME);
  } catch {
    storedLocale = null;
  }
  if (storedLocale && isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  const browserLang = navigator.language.split("-")[0];
  if (browserLang && isSupportedLocale(browserLang)) {
    return browserLang;
  }

  return defaultLocale;
}

export function setStoredLocale(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(LOCALE_NAME, locale);
  } catch {
    console.warn("Failed to store locale preference in localStorage");
  }
}

export async function activateLocale(locale: Locale): Promise<void> {
  await initI18n(locale);
}

export { i18nInstance };
