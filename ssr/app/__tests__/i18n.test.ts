/**
 * @vitest-environment node
 */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { loadMessages, createI18nInstance } from "~/lib/i18n/i18n";
import {
  defaultLocale,
  supportedLocales,
  type Locale,
} from "~/lib/i18n/config";

// Note: .po files are handled by Lingui plugin, no need to mock them

describe("i18n utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadMessages", () => {
    test("should load messages for en locale", async () => {
      const messages = await loadMessages("en");
      expect(messages).toBeDefined();
      expect(Object.keys(messages).length).toBeGreaterThan(0);
    });

    test("should load messages for zh locale", async () => {
      const messages = await loadMessages("zh");
      expect(messages).toBeDefined();
      expect(Object.keys(messages).length).toBeGreaterThan(0);
    });

    test("should work with defaultLocale", async () => {
      const messages = await loadMessages(defaultLocale);
      expect(messages).toBeDefined();
    });

    test("should work with all supported locales", async () => {
      for (const locale of supportedLocales) {
        const messages = await loadMessages(locale);
        expect(messages).toBeDefined();
      }
    });

    test("should fallback to defaultLocale for unsupported locale", async () => {
      const messages = await loadMessages("fr" as Locale);
      expect(messages).toBeDefined();
      expect(Object.keys(messages).length).toBeGreaterThan(0);
    });

    test("should return messages object", async () => {
      const messages = await loadMessages("en");
      expect(typeof messages).toBe("object");
    });

    test("should return non-empty messages for supported locales", async () => {
      for (const locale of supportedLocales) {
        const messages = await loadMessages(locale);
        expect(Object.keys(messages).length).toBeGreaterThan(0);
      }
    });
  });

  describe("createI18nInstance", () => {
    test("should create i18n instance with locale", () => {
      const messages = { test: "message" };
      const i18n = createI18nInstance("en", messages);
      expect(i18n.locale).toBe("en");
    });

    test("should create i18n instance with messages", () => {
      const messages = { test: "value" };
      const i18n = createI18nInstance("en", messages);
      expect(i18n.messages).toEqual({ en: messages });
    });

    test("should work with zh locale", () => {
      const messages = { greeting: "你好" };
      const i18n = createI18nInstance("zh", messages);
      expect(i18n.locale).toBe("zh");
      expect(i18n.messages).toEqual({ zh: messages });
    });

    test("should create separate instances for different locales", () => {
      const enMessages = { msg: "English" };
      const zhMessages = { msg: "中文" };

      const enInstance = createI18nInstance("en", enMessages);
      const zhInstance = createI18nInstance("zh", zhMessages);

      expect(enInstance.locale).toBe("en");
      expect(zhInstance.locale).toBe("zh");
      expect(enInstance.messages).not.toEqual(zhInstance.messages);
    });

    test("should work with empty messages", () => {
      const i18n = createI18nInstance("en", {});
      expect(i18n.locale).toBe("en");
      expect(i18n.messages).toEqual({ en: {} });
    });

    test("should work with defaultLocale", () => {
      const messages = { test: "test" };
      const i18n = createI18nInstance(defaultLocale, messages);
      expect(i18n.locale).toBe(defaultLocale);
    });
  });

  describe("edge cases", () => {
    test("loadMessages should handle concurrent calls", async () => {
      const [enMessages, zhMessages] = await Promise.all([
        loadMessages("en"),
        loadMessages("zh"),
      ]);

      expect(enMessages).toBeDefined();
      expect(zhMessages).toBeDefined();
    });

    test("createI18nInstance should handle different message structures", () => {
      const messages = {
        simple: "value",
        complex: "complex value",
      };

      const i18n = createI18nInstance("en", messages);
      expect(i18n.messages).toEqual({ en: messages });
    });

    test("loadMessages fallback should load default locale messages", async () => {
      const messages = await loadMessages("invalid" as Locale);
      const defaultMessages = await loadMessages(defaultLocale);
      expect(messages).toEqual(defaultMessages);
    });
  });
});
