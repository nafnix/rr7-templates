import { setupI18n, type I18n, type Messages } from "@lingui/core";
import { supportedLocales, defaultLocale, type Locale } from "./config";

export function createI18nInstance(locale: Locale, messages: Messages): I18n {
  return setupI18n({ locale, messages: { [locale]: messages } });
}

export const loadMessages = async (locale: Locale): Promise<Messages> => {
  const resolvedLocale = supportedLocales.includes(locale) ? locale : defaultLocale;

  const { messages } = await import(`../../locales/${resolvedLocale}.po`);
  return messages;
};
