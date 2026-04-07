/* oxlint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { action } from "~/routes/change-language";
import { defaultLocale, LOCALE_COOKIE_KEY, type Locale } from "~/lib/i18n/config";

vi.mock("~/lib/i18n/locale-cookie", async (importOriginal) => {
  const actual = await importOriginal<typeof import("~/lib/i18n/locale-cookie")>();
  return {
    ...actual,
    localeCookieHeader: vi.fn(async (locale: Locale) => ({
      "Set-Cookie": `lng=${locale}; Path=/; SameSite=lax`,
    })),
  };
});

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    data: vi.fn((data: any, init: any) => ({
      data,
      init,
    })),
  };
});

describe("change-language action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful language changes", () => {
    test("should return data object for en", async () => {
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "en");

      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      const result = await action({ request } as any);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.init).toBeDefined();
    });

    test("should return data object for zh", async () => {
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "zh");

      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      const result = await action({ request } as any);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    test("should call localeCookieHeader with correct locale", async () => {
      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "zh");

      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      await action({ request } as any);

      expect(localeCookieHeader).toHaveBeenCalledWith("zh");
    });

    test("should return null data", async () => {
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "en");

      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      const result = await action({ request } as any);

      expect(result.data).toBeNull();
    });
  });

  describe("default locale handling", () => {
    test("should use defaultLocale when no locale provided", async () => {
      const formData = new FormData();

      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      await action({ request } as any);

      expect(localeCookieHeader).toHaveBeenCalledWith(defaultLocale);
    });

    test("should use defaultLocale when locale is empty", async () => {
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "");

      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      await action({ request } as any);

      expect(localeCookieHeader).toHaveBeenCalledWith(defaultLocale);
    });

    test("should fallback to defaultLocale for unsupported locale", async () => {
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "fr");

      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      await action({ request } as any);

      // SECURITY: Unsupported locales should fall back to defaultLocale
      expect(localeCookieHeader).toHaveBeenCalledWith(defaultLocale);
    });
  });

  describe("form data handling", () => {
    test("should extract locale from form data", async () => {
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "zh");
      formData.append("otherField", "otherValue");

      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      await action({ request } as any);

      expect(localeCookieHeader).toHaveBeenCalledWith("zh");
    });

    test("should handle multiple form fields", async () => {
      const formData = new FormData();
      formData.append("field1", "value1");
      formData.append(LOCALE_COOKIE_KEY, "en");
      formData.append("field2", "value2");

      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      await action({ request } as any);

      expect(localeCookieHeader).toHaveBeenCalledWith("en");
    });
  });

  describe("response headers", () => {
    test("should have Set-Cookie header in init", async () => {
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "zh");

      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      const result = await action({ request } as any);

      expect(result.init).toBeDefined();
      expect(result.init?.headers).toBeDefined();
      const headers = result.init?.headers as Record<string, string>;
      expect(headers["Set-Cookie"]).toContain("lng=zh");
    });
  });

  describe("edge cases", () => {
    test("should handle request with empty formData", async () => {
      const formData = new FormData();
      const request = new Request("http://localhost/change-language", {
        method: "POST",
        body: formData,
      });

      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      await action({ request } as any);

      expect(localeCookieHeader).toHaveBeenCalledWith(defaultLocale);
    });

    test("should handle all supported locales", async () => {
      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      const { supportedLocales } = await import("~/lib/i18n/config");

      for (const locale of supportedLocales) {
        vi.clearAllMocks();

        const formData = new FormData();
        formData.append(LOCALE_COOKIE_KEY, locale);

        const request = new Request("http://localhost/change-language", {
          method: "POST",
          body: formData,
        });

        await action({ request } as any);

        expect(localeCookieHeader).toHaveBeenCalledWith(locale);
      }
    });
  });
});
