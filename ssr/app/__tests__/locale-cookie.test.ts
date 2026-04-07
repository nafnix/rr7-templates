/**
 * @vitest-environment node
 */
/* oxlint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  localeCookie,
  localeCookieHeader,
  LOCALE_COOKIE_OPTIONS,
} from "~/lib/i18n/locale-cookie";
import { defaultLocale, supportedLocales } from "~/lib/i18n/config";

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    createCookie: vi.fn((name: string, options: any) => ({
      name,
      parse: vi.fn(async (cookieHeader: string | null) => {
        if (!cookieHeader) return null;
        const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
        return match ? match[1] : null;
      }),
      serialize: vi.fn(async (value: string) => {
        const parts = [
          `${name}=${value}`,
          `Path=${options?.path || "/"}`,
          `SameSite=${options?.sameSite || "lax"}`,
        ];
        if (options?.secure) parts.push("Secure");
        if (options?.httpOnly) parts.push("HttpOnly");
        if (options?.maxAge) parts.push(`Max-Age=${options.maxAge}`);
        return parts.join("; ");
      }),
    })),
  };
});

describe("locale-cookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LOCALE_COOKIE_OPTIONS", () => {
    test("should have correct default options", () => {
      expect(LOCALE_COOKIE_OPTIONS.path).toBe("/");
      expect(LOCALE_COOKIE_OPTIONS.sameSite).toBe("lax");
      expect(LOCALE_COOKIE_OPTIONS.httpOnly).toBe(true);
    });

    test("should have maxAge of 1 year in seconds", () => {
      const oneYearInSeconds = 60 * 60 * 24 * 365;
      expect(LOCALE_COOKIE_OPTIONS.maxAge).toBe(oneYearInSeconds);
    });

    test("secure should depend on NODE_ENV", () => {
      expect(LOCALE_COOKIE_OPTIONS.secure).toBe(false);
    });
  });

  describe("localeCookie", () => {
    test("should be created with correct name", () => {
      expect(localeCookie.name).toBe("lng");
    });

    test("parse should return null for empty cookie header", async () => {
      const result = await localeCookie.parse(null);
      expect(result).toBeNull();
    });

    test("parse should return null for empty string", async () => {
      const result = await localeCookie.parse("");
      expect(result).toBeNull();
    });

    test("parse should extract locale from cookie header", async () => {
      const result = await localeCookie.parse("lng=en");
      expect(result).toBe("en");
    });

    test("parse should extract locale from complex cookie header", async () => {
      const result = await localeCookie.parse("lng=zh; other=value");
      expect(result).toBe("zh");
    });

    test("serialize should create cookie string", async () => {
      const result = await localeCookie.serialize("en");
      expect(result).toContain("lng=en");
      expect(result).toContain("Path=/");
      expect(result).toContain("SameSite=lax");
    });

    test("serialize should include HttpOnly", async () => {
      const result = await localeCookie.serialize("zh");
      expect(result).toContain("HttpOnly");
    });

    test("serialize should include Max-Age", async () => {
      const result = await localeCookie.serialize("en");
      expect(result).toContain("Max-Age=");
    });

    test("serialize should work with all supported locales", async () => {
      for (const locale of supportedLocales) {
        const result = await localeCookie.serialize(locale);
        expect(result).toContain(`lng=${locale}`);
      }
    });
  });

  describe("localeCookieHeader", () => {
    test("should return Set-Cookie header object", async () => {
      const result = await localeCookieHeader("en");
      expect(result).toHaveProperty("Set-Cookie");
      expect(result["Set-Cookie"]).toContain("lng=en");
    });

    test("should work with zh locale", async () => {
      const result = await localeCookieHeader("zh");
      expect(result["Set-Cookie"]).toContain("lng=zh");
    });

    test("should work with defaultLocale", async () => {
      const result = await localeCookieHeader(defaultLocale);
      expect(result["Set-Cookie"]).toContain(`lng=${defaultLocale}`);
    });

    test("should include all cookie options in header", async () => {
      const result = await localeCookieHeader("en");
      const cookie = result["Set-Cookie"];
      expect(cookie).toContain("Path=/");
      expect(cookie).toContain("SameSite=lax");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("Max-Age=");
    });
  });

  describe("edge cases", () => {
    test("should handle multiple cookies in header", async () => {
      const result = await localeCookie.parse(
        "session=abc123; lng=en; theme=dark",
      );
      expect(result).toBe("en");
    });

    test("should handle locale at end of cookie string", async () => {
      const result = await localeCookie.parse("session=abc123; lng=zh");
      expect(result).toBe("zh");
    });

    test("should handle locale at start of cookie string", async () => {
      const result = await localeCookie.parse("lng=en; session=abc123");
      expect(result).toBe("en");
    });

    test("serialize should create unique strings for different locales", async () => {
      const enResult = await localeCookie.serialize("en");
      const zhResult = await localeCookie.serialize("zh");
      expect(enResult).not.toBe(zhResult);
      expect(enResult).toContain("lng=en");
      expect(zhResult).toContain("lng=zh");
    });
  });
});
