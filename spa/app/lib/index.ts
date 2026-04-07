export { loadMessages, createI18nInstance } from "./i18n/i18n";
export { i18nInstance, initI18n } from "./i18n/i18n-instance";
export {
  detectLocaleClient,
  setStoredLocale,
  activateLocale,
  isSupportedLocale,
  i18nInstance as i18n,
} from "./i18n/i18n.client";
export {
  LOCALE_NAME,
  supportedLocales,
  defaultLocale,
  localeNames,
  type Locale,
} from "./i18n/config";
