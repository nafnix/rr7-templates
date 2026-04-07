import { data } from "react-router";
import { defaultLocale, isSupportedLocale, LOCALE_COOKIE_KEY } from "~/lib/i18n/config";
import { localeCookieHeader } from "~/lib/i18n/locale-cookie";
import type { Route } from "./+types/change-language";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawLocale = formData.get(LOCALE_COOKIE_KEY);

  // SECURITY: Validate locale against whitelist before use
  const locale =
    typeof rawLocale === "string" && isSupportedLocale(rawLocale) ? rawLocale : defaultLocale;

  return data(null, { headers: await localeCookieHeader(locale) });
}
