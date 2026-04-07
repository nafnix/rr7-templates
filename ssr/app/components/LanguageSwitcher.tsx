import { useFetcher, useRouteLoaderData } from "react-router";
import { activateLocale } from "~/lib/i18n/i18n-instance";
import {
  defaultLocale,
  LOCALE_COOKIE_KEY,
  localeNames,
  supportedLocales,
  type Locale,
} from "~/lib/i18n/config";
import { useState } from "react";
import { i18n } from "@lingui/core";

export function LanguageSwitcher() {
  const { locale: routeLocale } = useRouteLoaderData("root") ?? {
    locale: defaultLocale,
  };
  const fetcher = useFetcher();
  const [error, setError] = useState<string | null>(null);

  // Optimistic UI: use formData during submission, otherwise use routeLocale
  let currentLocale: Locale = routeLocale;
  if (fetcher.formData?.has(LOCALE_COOKIE_KEY)) {
    const formDataLocale = fetcher.formData.get(LOCALE_COOKIE_KEY);
    if (typeof formDataLocale === "string") {
      currentLocale = formDataLocale as Locale;
    }
  }

  function changeLanguage(locale: Locale) {
    setError(null);
    // Fire and forget with error handling
    activateLocale(locale).catch((error) => {
      console.error("Failed to activate locale:", error);
      setError(i18n._("Language activation failed. Please try again."));
    });
    // React Router automatically cancels previous submit when new one happens
    fetcher.submit({ [LOCALE_COOKIE_KEY]: locale }, { method: "POST", action: "/change-language" });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100/80 p-1 backdrop-blur-sm dark:bg-gray-800/80">
        {supportedLocales.map((loc) => (
          <button
            key={loc}
            onClick={() => changeLanguage(loc)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
              currentLocale === loc
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}
