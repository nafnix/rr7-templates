import { defineConfig } from "@lingui/cli";
import { defaultLocale, localeNames } from "./app/lib/i18n/config";

export default defineConfig({
  sourceLocale: defaultLocale,
  locales: Object.keys(localeNames),
  catalogs: [
    {
      path: "<rootDir>/app/locales/{locale}",
      include: ["app"],
    },
  ],
});
