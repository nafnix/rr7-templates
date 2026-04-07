/**
 * @vitest-environment node
 */
/* oxlint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { detectLocale } from "~/lib/i18n/i18n.server";
import { defaultLocale, supportedLocales } from "~/lib/i18n/config";

vi.mock("~/lib/i18n/locale-cookie", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/lib/i18n/locale-cookie")>();
  return {
    ...actual,
    localeCookie: {
      parse: vi.fn(async (cookieHeader: string | null) => {
        if (!cookieHeader) return null;
        const match = cookieHeader.match(/lng=([^;]+)/);
        return match ? match[1] : null;
      }),
    },
  };
});

vi.mock("intl-parse-accept-language", () => ({
  parseAcceptLanguage: vi.fn((header: string, options?: any) => {
    if (!header) return [];

    const locales = header
      .split(",")
      .map((lang) => lang.trim().split(";")[0]?.trim() ?? "")
      .filter((lang) => lang !== "*" && lang !== "")
      .map((lang) => lang.split("-")[0] ?? "");

    if (options?.validate) {
      return locales.filter((locale) => {
        try {
          options!.validate!([locale]);
          return true;
        } catch {
          return false;
        }
      });
    }

    return locales;
  }),
}));

describe("detectLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  describe("URL parameter detection", () => {
    test("should detect locale from URL parameter", async () => {
      const request = new Request("http://localhost/?lng=en");
      const result = await detectLocale(request);
      expect(result).toBe("en");
    });

    test("should detect zh from URL parameter", async () => {
      const request = new Request("http://localhost/?lng=zh");
      const result = await detectLocale(request);
      expect(result).toBe("zh");
    });

    test("should ignore unsupported locale in URL", async () => {
      const request = new Request("http://localhost/?lng=fr");
      const result = await detectLocale(request);
      expect(result).toBe(defaultLocale);
    });

    test("should detect locale with other URL parameters", async () => {
      const request = new Request("http://localhost/?page=home&lng=en");
      const result = await detectLocale(request);
      expect(result).toBe("en");
    });
  });

  describe("Cookie detection", () => {
    test("should detect locale from cookie", async () => {
      const request = new Request("http://localhost/", {
        headers: { Cookie: "lng=en" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("en");
    });

    test("should detect zh from cookie", async () => {
      const request = new Request("http://localhost/", {
        headers: { Cookie: "lng=zh" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("zh");
    });

    test("should ignore unsupported locale in cookie", async () => {
      const request = new Request("http://localhost/", {
        headers: { Cookie: "lng=fr" },
      });
      const result = await detectLocale(request);
      expect(result).toBe(defaultLocale);
    });

    test("should handle multiple cookies", async () => {
      const request = new Request("http://localhost/", {
        headers: { Cookie: "session=abc; lng=zh; theme=dark" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("zh");
    });
  });

  describe("Accept-Language header detection", () => {
    test("should detect locale from Accept-Language header", async () => {
      const request = new Request("http://localhost/", {
        headers: { "Accept-Language": "en" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("en");
    });

    test("should detect zh from Accept-Language", async () => {
      const request = new Request("http://localhost/", {
        headers: { "Accept-Language": "zh" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("zh");
    });

    test("should detect locale with quality values", async () => {
      const request = new Request("http://localhost/", {
        headers: { "Accept-Language": "en;q=0.9,zh;q=0.8" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("en");
    });

    test("should detect locale with region code", async () => {
      const request = new Request("http://localhost/", {
        headers: { "Accept-Language": "en-US" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("en");
    });

    test("should detect zh with region code", async () => {
      const request = new Request("http://localhost/", {
        headers: { "Accept-Language": "zh-CN" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("zh");
    });

    test("should ignore unsupported Accept-Language locale", async () => {
      const request = new Request("http://localhost/", {
        headers: { "Accept-Language": "fr" },
      });
      const result = await detectLocale(request);
      expect(result).toBe(defaultLocale);
    });

    test("should fallback to default when no Accept-Language", async () => {
      const request = new Request("http://localhost/");
      const result = await detectLocale(request);
      expect(result).toBe(defaultLocale);
    });
  });

  describe("Priority order (URL > Cookie > Accept-Language)", () => {
    test("URL should override cookie", async () => {
      const request = new Request("http://localhost/?lng=en", {
        headers: { Cookie: "lng=zh" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("en");
    });

    test("URL should override Accept-Language", async () => {
      const request = new Request("http://localhost/?lng=zh", {
        headers: { "Accept-Language": "en" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("zh");
    });

    test("URL should override both cookie and Accept-Language", async () => {
      const request = new Request("http://localhost/?lng=en", {
        headers: {
          Cookie: "lng=zh",
          "Accept-Language": "fr",
        },
      });
      const result = await detectLocale(request);
      expect(result).toBe("en");
    });

    test("Cookie should override Accept-Language", async () => {
      const request = new Request("http://localhost/", {
        headers: {
          Cookie: "lng=zh",
          "Accept-Language": "en",
        },
      });
      const result = await detectLocale(request);
      expect(result).toBe("zh");
    });

    test("should use default when nothing provided", async () => {
      const request = new Request("http://localhost/");
      const result = await detectLocale(request);
      expect(result).toBe(defaultLocale);
    });
  });

  describe("Edge cases", () => {
    test("should handle empty URL locale", async () => {
      const request = new Request("http://localhost/?lng=");
      const result = await detectLocale(request);
      expect(result).toBe(defaultLocale);
    });

    test("should handle empty cookie", async () => {
      const request = new Request("http://localhost/", {
        headers: { Cookie: "" },
      });
      const result = await detectLocale(request);
      expect(result).toBe(defaultLocale);
    });

    test("should handle malformed cookie", async () => {
      const request = new Request("http://localhost/", {
        headers: { Cookie: "invalid" },
      });
      const result = await detectLocale(request);
      expect(result).toBe(defaultLocale);
    });

    test("should handle complex Accept-Language header", async () => {
      const request = new Request("http://localhost/", {
        headers: {
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
        },
      });
      const result = await detectLocale(request);
      expect(result).toBe("zh");
    });

    test("should handle wildcard in Accept-Language", async () => {
      const request = new Request("http://localhost/", {
        headers: { "Accept-Language": "en,zh,*" },
      });
      const result = await detectLocale(request);
      expect(result).toBe("en");
    });

    test("should return defaultLocale type correctly", async () => {
      const request = new Request("http://localhost/");
      const result = await detectLocale(request);
      expect(supportedLocales.includes(result)).toBe(true);
    });
  });
});
