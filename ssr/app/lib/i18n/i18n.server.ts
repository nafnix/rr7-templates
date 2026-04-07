import { parseAcceptLanguage } from "intl-parse-accept-language";
import { defaultLocale, isSupportedLocale, type Locale, LOCALE_COOKIE_KEY } from "./config";
import { localeCookie } from "./locale-cookie";

export const detectLocale = async (request: Request): Promise<Locale> => {
  const url = new URL(request.url);
  const urlLocale = url.searchParams.get(LOCALE_COOKIE_KEY);
  if (urlLocale && isSupportedLocale(urlLocale)) return urlLocale;

  const cookieLocale = await localeCookie.parse(request.headers.get("Cookie"));
  if (typeof cookieLocale === "string" && isSupportedLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = request.headers.get("Accept-Language");
  if (acceptLanguage) {
    const preferredLocales = parseAcceptLanguage(acceptLanguage, {
      validate: Intl.DateTimeFormat.supportedLocalesOf,
      ignoreWildcard: true,
    });

    const matchedLocales = preferredLocales.find(isSupportedLocale);
    if (matchedLocales) return matchedLocales;
  }

  return defaultLocale;
};
