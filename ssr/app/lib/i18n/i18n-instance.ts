import { i18n, type I18n } from "@lingui/core";
import { type Locale } from "./config";
import { loadMessages } from "./i18n";

/**
 * Singleton i18n instance from @lingui/core
 * Used for both SSR and client-side rendering
 */
export const i18nInstance = i18n;

/**
 * Get and configure the i18n instance for a specific locale
 * Loads messages and activates the locale
 *
 * @param locale - The target locale
 * @param messages - The messages catalog for the locale
 * @returns The configured i18n instance
 */
export async function activateLocale(locale: Locale): Promise<I18n> {
  const messages = await loadMessages(locale);
  i18nInstance.load(locale, messages);
  i18nInstance.activate(locale);
  return i18nInstance;
}

/**
 * Initialize i18n asynchronously by loading messages for the given locale
 * and activating the instance
 *
 * @param locale - The target locale
 * @returns Promise that resolves when i18n is initialized
 */
export async function initI18n(locale: Locale): Promise<void> {
  await activateLocale(locale);
}
