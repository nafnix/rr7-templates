import { useState, useEffect } from "react";
import {
  detectLocaleClient,
  setStoredLocale,
  activateLocale,
} from "~/lib/i18n/i18n.client";
import { localeNames, supportedLocales, type Locale } from "~/lib/i18n/config";

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>(() => detectLocaleClient());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error]);

  async function handleLanguageChange(newLocale: Locale) {
    try {
      setStoredLocale(newLocale);
      await activateLocale(newLocale);
      setLocale(newLocale);
      setError(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to change language";
      console.error("Failed to change language:", error);
      setError(message);
    }
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-1 rounded-lg bg-gray-100/80 p-1 backdrop-blur-sm dark:bg-gray-800/80"
        role="group"
        aria-label="Language selection"
      >
        {supportedLocales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            aria-label={`Switch to ${localeNames[loc]}`}
            aria-pressed={locale === loc}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
              locale === loc
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
      {error && (
        <div
          role="alert"
          className="absolute top-full right-0 left-0 mt-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 dark:bg-red-900/50 dark:text-red-200"
        >
          {error}
        </div>
      )}
    </div>
  );
}
