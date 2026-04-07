import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { vi, afterEach } from "vitest";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

// Mock navigator for tests
vi.stubGlobal("navigator", {
  language: "en-US",
  languages: ["en-US", "en"],
});

// Mock React Router hooks and utilities
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useRouteLoaderData: vi.fn((routeId: string) => {
      if (routeId === "root") {
        return { locale: "en" };
      }
      return null;
    }),
  };
});

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
