import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { vi, afterEach } from "vitest";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock React Router hooks and utilities
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    // Mock useRouteLoaderData for tests
    useRouteLoaderData: vi.fn((routeId: string) => {
      if (routeId === "root") {
        return { locale: "en" };
      }
      return null;
    }),
    // Mock useFetcher for component tests
    useFetcher: vi.fn(() => ({
      submit: vi.fn(),
      state: "idle",
      data: null,
    })),
    // Mock createCookie for server tests
    createCookie: vi.fn((name: string, options: Record<string, unknown>) => ({
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
    // Mock data function
    data: vi.fn(
      (data: unknown, init: { status?: number; headers?: HeadersInit }) => {
        return new Response(JSON.stringify(data), {
          status: init?.status || 200,
          headers: init?.headers || {},
        });
      },
    ),
  };
});

// Mock intl-parse-accept-language
vi.mock("intl-parse-accept-language", () => ({
  parseAcceptLanguage: vi.fn(
    (header: string, options?: { validate?: (locales: string[]) => void }) => {
      if (!header) return [];

      // Parse Accept-Language header format: "en-US,en;q=0.9,zh;q=0.8"
      const locales = header
        .split(",")
        .map((lang: string) => lang.trim().split(";")[0]?.trim() ?? "")
        .filter((lang: string) => lang !== "*" && lang !== "")
        .map((lang: string) => {
          // Normalize locale codes (en-US -> en)
          const base = lang.split("-")[0] ?? "";
          return base;
        });

      // Apply validation if provided
      if (options?.validate) {
        return locales.filter((locale: string) => {
          try {
            options!.validate!([locale]);
            return true;
          } catch {
            return false;
          }
        });
      }

      return locales;
    },
  ),
}));

// Mock Lingui i18n core
vi.mock("@lingui/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@lingui/core")>();
  return {
    ...actual,
    i18n: {
      ...actual.i18n,
      load: vi.fn(),
      activate: vi.fn(),
    },
    setupI18n: vi.fn(
      (config: { locale?: string; messages?: Record<string, string> }) => ({
        locale: config.locale,
        messages: config.messages,
        load: vi.fn(),
        activate: vi.fn(),
      }),
    ),
  };
});

// Mock dynamic imports for locale files
vi.mock("./app/locales/en.po", () => ({
  messages: {
    "Welcome to React Router": "Welcome to React Router",
    "A modern, production-ready framework for building full-stack React applications":
      "A modern, production-ready framework for building full-stack React applications",
  },
}));

vi.mock("./app/locales/zh.po", () => ({
  messages: {
    "Welcome to React Router": "欢迎使用 React Router",
    "A modern, production-ready framework for building full-stack React applications":
      "一个现代、生产就绪的全栈 React 应用框架",
  },
}));

// Mock process.env for tests
vi.stubGlobal("import.meta.env", {
  DEV: true,
  PROD: false,
  MODE: "test",
  NODE_ENV: "test",
});
