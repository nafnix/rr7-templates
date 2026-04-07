import { i18n } from "@lingui/core";
import { type Locale } from "./config";
import { loadMessages } from "./i18n";

/**
 * Singleton i18n instance from @lingui/core
 * Used for both SSR and client-side rendering
 */
export const i18nInstance = i18n;

/**
 * Initialize i18n asynchronously by loading messages for the given locale
 * and activating the instance
 *
 * @param locale - The target locale
 * @returns Promise that resolves when i18n is initialized
 */
export async function initI18n(locale: Locale): Promise<void> {
  const messages = await loadMessages(locale);
  i18nInstance.load(locale, messages);
  i18nInstance.activate(locale);
}
