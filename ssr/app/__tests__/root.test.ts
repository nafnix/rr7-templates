/* oxlint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { loader, links } from "~/root";
import {
  defaultLocale,
  supportedLocales,
  type Locale,
} from "~/lib/i18n/config";

vi.mock("~/lib/i18n/i18n.server", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/lib/i18n/i18n.server")>();
  return {
    ...actual,
    detectLocale: vi.fn(async () => "en"),
  };
});

vi.mock("~/lib/i18n/locale-cookie", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/lib/i18n/locale-cookie")>();
  return {
    ...actual,
    localeCookieHeader: vi.fn(async (locale: Locale) => ({
      "Set-Cookie": `lng=${locale}; Path=/; SameSite=lax`,
    })),
  };
});

describe("root loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("locale detection", () => {
    test("should call detectLocale with request", async () => {
      const { detectLocale } = await import("~/lib/i18n/i18n.server");
      const request = new Request("http://localhost/");

      await loader({ request } as any);

      expect(detectLocale).toHaveBeenCalledWith(request);
    });

    test("should return locale in response", async () => {
      const request = new Request("http://localhost/");

      const result = await loader({ request } as any);
      const body = await result.clone().json();

      expect(body).toHaveProperty("locale");
    });

    test("should return locale as string", async () => {
      const request = new Request("http://localhost/");

      const result = await loader({ request } as any);
      const body = await result.json();

      expect(typeof body.locale).toBe("string");
    });

    test("should return supported locale", async () => {
      const request = new Request("http://localhost/");

      const result = await loader({ request } as any);
      const body = await result.json();

      expect(supportedLocales.includes(body.locale)).toBe(true);
    });

    test("should return default locale when no headers", async () => {
      const { detectLocale } = await import("~/lib/i18n/i18n.server");
      vi.mocked(detectLocale).mockResolvedValue(defaultLocale);

      const request = new Request("http://localhost/");

      const result = await loader({ request } as any);
      const body = await result.json();

      expect(body.locale).toBe(defaultLocale);
    });
  });

  describe("cookie handling", () => {
    test("should call localeCookieHeader with detected locale", async () => {
      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      const { detectLocale } = await import("~/lib/i18n/i18n.server");
      vi.mocked(detectLocale).mockResolvedValue("zh");

      const request = new Request("http://localhost/");

      await loader({ request } as any);

      expect(localeCookieHeader).toHaveBeenCalledWith("zh");
    });

    test("should call localeCookieHeader", async () => {
      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      const request = new Request("http://localhost/");

      await loader({ request } as any);

      expect(localeCookieHeader).toHaveBeenCalled();
    });

    test("should set cookie header", async () => {
      const request = new Request("http://localhost/");

      await loader({ request } as any);

      const { localeCookieHeader } = await import("~/lib/i18n/locale-cookie");
      expect(localeCookieHeader).toHaveBeenCalled();
    });
  });

  describe("response structure", () => {
    test("should return Response object", async () => {
      const request = new Request("http://localhost/");

      const result = await loader({ request } as any);

      expect(result instanceof Response).toBe(true);
    });

    test("should return JSON response", async () => {
      const request = new Request("http://localhost/");

      const result = await loader({ request } as any);

      expect(result.headers.get("Content-Type")).toContain("application/json");
    });

    test("should have 200 status", async () => {
      const request = new Request("http://localhost/");

      const result = await loader({ request } as any);

      expect(result.status).toBe(200);
    });
  });

  describe("integration with detectLocale", () => {
    test("should handle en locale detection", async () => {
      const { detectLocale } = await import("~/lib/i18n/i18n.server");
      vi.mocked(detectLocale).mockResolvedValue("en");

      const request = new Request("http://localhost/");

      const result = await loader({ request } as any);
      const body = await result.json();

      expect(body.locale).toBe("en");
    });

    test("should handle zh locale detection", async () => {
      const { detectLocale } = await import("~/lib/i18n/i18n.server");
      vi.mocked(detectLocale).mockResolvedValue("zh");

      const request = new Request("http://localhost/");

      const result = await loader({ request } as any);
      const body = await result.json();

      expect(body.locale).toBe("zh");
    });

    test("should work with different request URLs", async () => {
      const { detectLocale } = await import("~/lib/i18n/i18n.server");

      const urls = [
        "http://localhost/",
        "http://localhost/home",
        "http://localhost/about",
      ];

      for (const url of urls) {
        vi.clearAllMocks();

        const request = new Request(url);
        await loader({ request } as any);

        expect(detectLocale).toHaveBeenCalledWith(request);
      }
    });
  });

  describe("edge cases", () => {
    test("should handle requests with cookies", async () => {
      const { detectLocale } = await import("~/lib/i18n/i18n.server");
      vi.mocked(detectLocale).mockResolvedValue("zh");

      const request = new Request("http://localhost/", {
        headers: { Cookie: "lng=zh" },
      });

      const result = await loader({ request } as any);
      const body = await result.json();

      expect(body.locale).toBe("zh");
    });

    test("should handle requests with Accept-Language", async () => {
      const { detectLocale } = await import("~/lib/i18n/i18n.server");
      vi.mocked(detectLocale).mockResolvedValue("en");

      const request = new Request("http://localhost/", {
        headers: { "Accept-Language": "en" },
      });

      const result = await loader({ request } as any);
      const body = await result.json();

      expect(body.locale).toBe("en");
    });

    test("should handle requests with URL parameters", async () => {
      const { detectLocale } = await import("~/lib/i18n/i18n.server");
      vi.mocked(detectLocale).mockResolvedValue("zh");

      const request = new Request("http://localhost/?lng=zh");

      const result = await loader({ request } as any);
      const body = await result.json();

      expect(body.locale).toBe("zh");
    });
  });

  describe("links function", () => {
    test("should return array of link objects", () => {
      const result = links();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test("should include Google Fonts preconnect", () => {
      const result = links();

      const hasGoogleFonts = result.some(
        (link: any) =>
          link.rel === "preconnect" &&
          link.href === "https://fonts.googleapis.com",
      );

      expect(hasGoogleFonts).toBe(true);
    });

    test("should include Google Fonts static preconnect", () => {
      const result = links();

      const hasGstatic = result.some(
        (link: any) =>
          link.rel === "preconnect" &&
          link.href === "https://fonts.gstatic.com",
      );

      expect(hasGstatic).toBe(true);
    });

    test("should include stylesheet link", () => {
      const result = links();

      const hasStylesheet = result.some(
        (link: any) =>
          link.rel === "stylesheet" &&
          link.href &&
          link.href.includes("fonts.googleapis.com"),
      );

      expect(hasStylesheet).toBe(true);
    });

    test("should set crossOrigin for gstatic preconnect", () => {
      const result = links();

      const gstaticLink = result.find(
        (link: any) => link.href === "https://fonts.gstatic.com",
      ) as any;

      expect(gstaticLink?.crossOrigin).toBe("anonymous");
    });
  });
});
