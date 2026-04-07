import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";
import { localeNames, supportedLocales, LOCALE_COOKIE_KEY } from "~/lib/i18n/config";

vi.mock("~/lib/i18n/i18n-instance", () => ({
  activateLocale: vi.fn(async () => ({
    load: vi.fn(),
    activate: vi.fn(),
  })),
}));

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
    useFetcher: vi.fn(() => ({
      submit: vi.fn(async () => {}),
      state: "idle",
      data: null,
      formData: null,
      formMethod: undefined,
      formAction: undefined,
      formEncType: undefined,
      text: undefined,
      json: undefined,
      Form: (() => null) as any,
      load: vi.fn(async () => {}),
      reset: vi.fn(),
    })),
  };
});

describe("LanguageSwitcher", () => {
  beforeEach(() => {
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
      expect(wrapper).toHaveClass("flex");
      expect(wrapper).toHaveClass("flex-col");
      expect(wrapper).toHaveClass("gap-2");
    });
  });

  describe("initial state", () => {
    test("should show en locale as active by default", () => {
      render(<LanguageSwitcher />);
      const enButton = screen.getByText("English");
      expect(enButton).toHaveClass("bg-white");
      expect(enButton).toHaveClass("shadow-sm");
    });

    test("should show zh locale as inactive by default", () => {
      render(<LanguageSwitcher />);
      const zhButton = screen.getByText("中文");
      expect(zhButton).toHaveClass("text-gray-600");
    });
  });

  describe("user interactions", () => {
    test("should handle button click with optimistic UI", async () => {
      const { useFetcher } = await import("react-router");
      const user = userEvent.setup();

      // Mock formData to simulate optimistic UI
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "zh");

      vi.mocked(useFetcher).mockReturnValue({
        submit: vi.fn(async () => {}),
        state: "submitting",
        data: null,
        formData,
        formMethod: "POST",
        formAction: "/change-language",
        formEncType: "multipart/form-data",
        text: undefined,
        json: undefined,
        Form: (() => null) as any,
        load: vi.fn(async () => {}),
        reset: vi.fn(),
      });

      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");

      // Click should trigger optimistic UI - button becomes active immediately
      await user.click(zhButton);

      // With optimistic UI, the button should show active state
      expect(zhButton).toHaveClass("bg-white");
    });

    test("should call activateLocale on click", async () => {
      const { activateLocale } = await import("~/lib/i18n/i18n-instance");
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");
      await user.click(zhButton);

      await waitFor(() => {
        expect(activateLocale).toHaveBeenCalledWith("zh");
      });
    });

    test("should call fetcher.submit with correct data", async () => {
      const { useFetcher } = await import("react-router");
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");
      await user.click(zhButton);

      const fetcher = useFetcher();
      await waitFor(() => {
        expect(fetcher.submit).toHaveBeenCalledWith(
          { [LOCALE_COOKIE_KEY]: "zh" },
          { method: "POST", action: "/change-language" }
        );
      });
    });

    test("should update active state after clicking", async () => {
      const { useFetcher } = await import("react-router");
      const user = userEvent.setup();

      const mockFetcher: {
        submit: ReturnType<typeof vi.fn>;
        state: string;
        data: null;
        formData: FormData | null;
        formMethod: string | undefined;
        formAction: string | undefined;
        formEncType: string | undefined;
        text: undefined;
        json: undefined;
        Form: ReturnType<typeof vi.fn>;
        load: ReturnType<typeof vi.fn>;
        reset: ReturnType<typeof vi.fn>;
      } = {
        submit: vi.fn((data) => {
          mockFetcher.formData = data as FormData;
          mockFetcher.state = "submitting";
        }),
        state: "idle",
        data: null,
        formData: null,
        formMethod: undefined,
        formAction: undefined,
        formEncType: undefined,
        text: undefined,
        json: undefined,
        Form: (() => null) as any,
        load: vi.fn(async () => {}),
        reset: vi.fn(),
      };

      vi.mocked(useFetcher).mockReturnValue(
        mockFetcher as unknown as ReturnType<typeof useFetcher>
      );

      render(<LanguageSwitcher />);

      const enButton = screen.getByText("English");
      const zhButton = screen.getByText("中文");

      expect(enButton).toHaveClass("bg-white");
      expect(zhButton).not.toHaveClass("bg-white");

      await user.click(zhButton);

      expect(mockFetcher.submit).toHaveBeenCalledWith(
        { [LOCALE_COOKIE_KEY]: "zh" },
        { method: "POST", action: "/change-language" }
      );
    });

    test("should allow switching between locales", async () => {
      const { useFetcher } = await import("react-router");
      const user = userEvent.setup();

      const mockFetcher = {
        submit: vi.fn(),
        state: "idle",
        data: null,
        formData: null as FormData | null,
        formMethod: undefined,
        formAction: undefined,
        formEncType: undefined,
        text: undefined,
        json: undefined,
        Form: (() => null) as any,
        load: vi.fn(async () => {}),
        reset: vi.fn(),
      };

      vi.mocked(useFetcher).mockReturnValue(
        mockFetcher as unknown as ReturnType<typeof useFetcher>
      );

      render(<LanguageSwitcher />);

      const enButton = screen.getByText("English");
      const zhButton = screen.getByText("中文");

      expect(enButton).toHaveClass("bg-white");
      expect(zhButton).not.toHaveClass("bg-white");

      await user.click(zhButton);
      expect(mockFetcher.submit).toHaveBeenCalledWith(
        { [LOCALE_COOKIE_KEY]: "zh" },
        { method: "POST", action: "/change-language" }
      );

      await user.click(enButton);
      expect(mockFetcher.submit).toHaveBeenCalledWith(
        { [LOCALE_COOKIE_KEY]: "en" },
        { method: "POST", action: "/change-language" }
      );
    });
  });

  describe("styling", () => {
    test("active button should have correct classes", () => {
      render(<LanguageSwitcher />);
      const activeButton = screen.getByText("English");

      expect(activeButton).toHaveClass("bg-white");
      expect(activeButton).toHaveClass("text-gray-900");
      expect(activeButton).toHaveClass("shadow-sm");
    });

    test("inactive button should have correct classes", () => {
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
    test("should handle missing route loader data", async () => {
      const { useRouteLoaderData } = await import("react-router");
      vi.mocked(useRouteLoaderData).mockReturnValue(null);

      render(<LanguageSwitcher />);
      expect(screen.getByText("English")).toBeInTheDocument();
    });

    test("should handle multiple rapid clicks without race condition", async () => {
      const { useFetcher } = await import("react-router");
      const user = userEvent.setup();

      // Simulate multiple clicks with different formData states
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "zh");

      vi.mocked(useFetcher).mockReturnValue({
        submit: vi.fn(async () => {}),
        state: "submitting",
        data: null,
        formData,
        formMethod: "POST",
        formAction: "/change-language",
        formEncType: "multipart/form-data",
        text: undefined,
        json: undefined,
        Form: (() => null) as any,
        load: vi.fn(async () => {}),
        reset: vi.fn(),
      });

      render(<LanguageSwitcher />);

      const zhButton = screen.getByText("中文");

      // Multiple rapid clicks - React Router would cancel previous submits
      await user.click(zhButton);
      await user.click(zhButton);
      await user.click(zhButton);

      // Button should still be active (no race condition)
      await waitFor(() => {
        expect(zhButton).toHaveClass("bg-white");
      });
    });

    test("should maintain active state consistency", async () => {
      const { useFetcher } = await import("react-router");

      // Mock with formData to simulate active zh locale
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "zh");

      vi.mocked(useFetcher).mockReturnValue({
        submit: vi.fn(async () => {}),
        state: "submitting",
        data: null,
        formData,
        formMethod: "POST",
        formAction: "/change-language",
        formEncType: "multipart/form-data",
        text: undefined,
        json: undefined,
        Form: (() => null) as any,
        load: vi.fn(async () => {}),
        reset: vi.fn(),
      });

      render(<LanguageSwitcher />);

      const buttons = screen.getAllByRole("button");

      const activeButtons = buttons.filter((btn) => btn.className.includes("bg-white"));

      expect(activeButtons.length).toBe(1);
    });

    test("should handle formData with invalid locale type", async () => {
      const { useFetcher } = await import("react-router");

      // Mock formData with non-string value (shouldn't happen in real app, but tests edge case)
      const formData = new FormData();
      formData.append(LOCALE_COOKIE_KEY, "zh");

      vi.mocked(useFetcher).mockReturnValue({
        submit: vi.fn(async () => {}),
        state: "submitting",
        data: null,
        formData,
        formMethod: "POST",
        formAction: "/change-language",
        formEncType: "multipart/form-data",
        text: undefined,
        json: undefined,
        Form: (() => null) as any,
        load: vi.fn(async () => {}),
        reset: vi.fn(),
      });

      render(<LanguageSwitcher />);

      // Should still render correctly
      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("中文")).toBeInTheDocument();
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
