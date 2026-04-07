import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";
import { localeNames, supportedLocales } from "~/lib/i18n/config";

const mockDetectLocaleClient = vi.fn();
const mockSetStoredLocale = vi.fn();
const mockActivateLocale = vi.fn();

vi.mock("~/lib/i18n/i18n.client", () => ({
  detectLocaleClient: () => mockDetectLocaleClient(),
  setStoredLocale: (locale: string) => mockSetStoredLocale(locale),
  activateLocale: (locale: string) => mockActivateLocale(locale),
}));

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDetectLocaleClient.mockReturnValue("en");
    mockActivateLocale.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    test("should render all supported locales", () => {
      render(<LanguageSwitcher />);

      supportedLocales.forEach((locale) => {
        expect(screen.getByText(localeNames[locale])).toBeInTheDocument();
      });
    });

    test("should render English button", () => {
      render(<LanguageSwitcher />);
      expect(screen.getByText("English")).toBeInTheDocument();
    });

    test("should render Chinese button", () => {
      render(<LanguageSwitcher />);
      expect(screen.getByText("中文")).toBeInTheDocument();
    });

    test("should render correct number of buttons", () => {
      render(<LanguageSwitcher />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(supportedLocales.length);
    });

    test("should have proper container styling", () => {
      const { container } = render(<LanguageSwitcher />);
      const wrapper = container.firstChild as HTMLElement;
      const innerContainer = wrapper.firstChild as HTMLElement;
      expect(innerContainer).toHaveClass("flex");
      expect(innerContainer).toHaveClass("items-center");
      expect(innerContainer).toHaveClass("gap-1");
    });
  });

  describe("initial state", () => {
    test("should call detectLocaleClient on initial render", () => {
      render(<LanguageSwitcher />);

      expect(mockDetectLocaleClient).toHaveBeenCalled();
    });

    test("should set initial locale from detectLocaleClient", () => {
      mockDetectLocaleClient.mockReturnValue("zh");
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");
      expect(zhButton).toHaveClass("bg-white");
    });

    test("should show en locale as active when detectLocaleClient returns en", () => {
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);

      const enButton = screen.getByText("English");
      expect(enButton).toHaveClass("bg-white");
      expect(enButton).toHaveClass("shadow-sm");
    });

    test("should show zh locale as inactive when en is active", () => {
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");
      expect(zhButton).toHaveClass("text-gray-600");
    });
  });

  describe("user interactions", () => {
    test("should handle button click", async () => {
      const user = userEvent.setup();
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");
      await user.click(zhButton);

      await waitFor(() => {
        expect(zhButton).toHaveClass("bg-white");
      });
    });

    test("should call setStoredLocale on click", async () => {
      const user = userEvent.setup();
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");
      await user.click(zhButton);

      await waitFor(() => {
        expect(mockSetStoredLocale).toHaveBeenCalledWith("zh");
      });
    });

    test("should call activateLocale on click", async () => {
      const user = userEvent.setup();
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");
      await user.click(zhButton);

      await waitFor(() => {
        expect(mockActivateLocale).toHaveBeenCalledWith("zh");
      });
    });

    test("should update UI state after clicking", async () => {
      const user = userEvent.setup();
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);

      const enButton = screen.getByText("English");
      const zhButton = screen.getByText("中文");

      expect(enButton).toHaveClass("bg-white");
      expect(zhButton).not.toHaveClass("bg-white");

      await user.click(zhButton);

      await waitFor(() => {
        expect(zhButton).toHaveClass("bg-white");
        expect(enButton).not.toHaveClass("bg-white");
      });
    });

    test("should allow switching between locales", async () => {
      const user = userEvent.setup();
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);

      const enButton = screen.getByText("English");
      const zhButton = screen.getByText("中文");

      await user.click(zhButton);
      await waitFor(() => {
        expect(zhButton).toHaveClass("bg-white");
      });

      await user.click(enButton);
      await waitFor(() => {
        expect(enButton).toHaveClass("bg-white");
      });
    });
  });

  describe("styling", () => {
    test("active button should have correct classes", () => {
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);
      const activeButton = screen.getByText("English");

      expect(activeButton).toHaveClass("bg-white");
      expect(activeButton).toHaveClass("text-gray-900");
      expect(activeButton).toHaveClass("shadow-sm");
    });

    test("inactive button should have correct classes", () => {
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);
      const inactiveButton = screen.getByText("中文");

      expect(inactiveButton).toHaveClass("text-gray-600");
      expect(inactiveButton).toHaveClass("hover:text-gray-900");
    });

    test("buttons should be cursor-pointer", () => {
      render(<LanguageSwitcher />);
      const buttons = screen.getAllByRole("button");

      buttons.forEach((button) => {
        expect(button).toHaveClass("cursor-pointer");
      });
    });

    test("buttons should have transition classes", () => {
      render(<LanguageSwitcher />);
      const buttons = screen.getAllByRole("button");

      buttons.forEach((button) => {
        expect(button).toHaveClass("transition-all");
        expect(button).toHaveClass("duration-200");
      });
    });
  });

  describe("edge cases", () => {
    test("should handle multiple rapid clicks", async () => {
      const user = userEvent.setup();
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");
      await user.click(zhButton);
      await user.click(zhButton);
      await user.click(zhButton);

      await waitFor(() => {
        expect(zhButton).toHaveClass("bg-white");
        expect(mockSetStoredLocale).toHaveBeenCalledTimes(3);
      });
    });

    test("should maintain active state consistency", () => {
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);

      const buttons = screen.getAllByRole("button");

      const activeButtons = buttons.filter((btn) =>
        btn.className.includes("bg-white"),
      );

      expect(activeButtons.length).toBe(1);
    });

    test("should handle activateLocale errors gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockActivateLocale.mockRejectedValue(new Error("Failed to activate"));

      const user = userEvent.setup();
      mockDetectLocaleClient.mockReturnValue("en");
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");
      await user.click(zhButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to change language:",
          expect.any(Error),
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("accessibility", () => {
    test("all buttons should be accessible", () => {
      render(<LanguageSwitcher />);
      const buttons = screen.getAllByRole("button");

      buttons.forEach((button) => {
        expect(button).toBeVisible();
      });
    });

    test("should have readable button labels", () => {
      render(<LanguageSwitcher />);

      expect(screen.getByText("English")).toBeVisible();
      expect(screen.getByText("中文")).toBeVisible();
    });
  });
});
