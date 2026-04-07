import { describe, test, expect } from "vitest";
import {
  LOCALE_COOKIE_KEY,
  supportedLocales,
  defaultLocale,
  localeNames,
  type Locale,
} from "~/lib/i18n/config";

describe("i18n config", () => {
  describe("constants", () => {
    test("LOCALE_COOKIE_KEY should be defined", () => {
      expect(LOCALE_COOKIE_KEY).toBeDefined();
      expect(LOCALE_COOKIE_KEY).toBe("lng");
    });

    test("supportedLocales should be an array", () => {
      expect(Array.isArray(supportedLocales)).toBe(true);
    });

    test("supportedLocales should contain zh and en", () => {
      expect(supportedLocales).toContain("zh");
      expect(supportedLocales).toContain("en");
    });

    test("supportedLocales length should be 2", () => {
      expect(supportedLocales.length).toBe(2);
    });

    test("defaultLocale should be en", () => {
      expect(defaultLocale).toBe("en");
    });

    test("defaultLocale should be in supportedLocales", () => {
      expect(supportedLocales).toContain(defaultLocale);
    });
  });

  describe("localeNames", () => {
    test("localeNames should be defined", () => {
      expect(localeNames).toBeDefined();
    });

    test("localeNames should have entries for all supported locales", () => {
      supportedLocales.forEach((locale) => {
        expect(localeNames[locale]).toBeDefined();
      });
    });

    test("localeNames should have correct values", () => {
      expect(localeNames.en).toBe("English");
      expect(localeNames.zh).toBe("中文");
    });

    test("localeNames keys should match supportedLocales", () => {
      const keys = Object.keys(localeNames) as Locale[];
      expect(keys.sort()).toEqual(supportedLocales.slice().sort());
    });
  });

  describe("Locale type", () => {
    test("Locale type should be derived from supportedLocales", () => {
      const validLocale: Locale = "en";
      expect(supportedLocales.includes(validLocale)).toBe(true);
    });

    test("Locale should only accept supported locales", () => {
      const testLocales: Locale[] = ["en", "zh"];
      testLocales.forEach((locale) => {
        expect(supportedLocales.includes(locale)).toBe(true);
      });
    });
  });

  describe("edge cases", () => {
    test("supportedLocales should be readonly tuple", () => {
      expect(supportedLocales).toEqual(["zh", "en"] as const);
    });

    test("localeNames should not have extra keys", () => {
      const keys = Object.keys(localeNames);
      expect(keys.length).toBe(supportedLocales.length);
    });

    test("defaultLocale type should match Locale", () => {
      const locale: Locale = defaultLocale;
      expect(locale).toBeDefined();
    });
  });
});
