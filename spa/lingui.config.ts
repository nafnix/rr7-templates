import { defineConfig } from "@lingui/cli";
import { defaultLocale, supportedLocales } from "./app/lib/i18n/config";

export default defineConfig({
  sourceLocale: defaultLocale,
  locales: [...supportedLocales],
  catalogs: [
    {
      path: "<rootDir>/app/locales/{locale}",
      include: ["app"],
    },
  ],
});
