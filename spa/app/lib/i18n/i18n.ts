import { setupI18n, type Messages, type I18n } from "@lingui/core";
import { supportedLocales, defaultLocale, type Locale } from "./config";

export const loadMessages = async (locale: Locale): Promise<Messages> => {
  const resolvedLocale = supportedLocales.includes(locale)
    ? locale
    : defaultLocale;

  const { messages } = await import(`../../locales/${resolvedLocale}.po`);
  return messages;
};

export const createI18nInstance = (
  locale: Locale,
  messages: Messages,
): I18n => {
  const instance = setupI18n({
    locale,
    messages: { [locale]: messages },
  });
  instance.activate(locale);
  return instance;
};
