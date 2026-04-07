import { createCookie } from "react-router";
import { LOCALE_COOKIE_KEY, type Locale } from "./config";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const LOCALE_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  maxAge: ONE_YEAR_IN_SECONDS,
};

export const localeCookie = createCookie(LOCALE_COOKIE_KEY, LOCALE_COOKIE_OPTIONS);

export async function localeCookieHeader(locale: Locale): Promise<{ "Set-Cookie": string }> {
  return { "Set-Cookie": await localeCookie.serialize(locale) };
}
