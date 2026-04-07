import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  clientLoader,
  links,
  Layout,
  HydrateFallback,
  ErrorBoundary,
} from "~/root";
import { defaultLocale, supportedLocales } from "~/lib/i18n/config";
import type { Locale } from "~/lib/i18n/config";

const mockUseRouteLoaderData = vi.hoisted(() => vi.fn());
const mockIsRouteErrorResponse = vi.hoisted(() => vi.fn());

vi.mock("~/lib/i18n/i18n.client", () => ({
  detectLocaleClient: vi.fn(() => defaultLocale),
}));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useRouteLoaderData: mockUseRouteLoaderData,
    Links: () => null,
    Meta: () => null,
    Scripts: () => null,
    ScrollRestoration: () => null,
    Outlet: () => null,
    isRouteErrorResponse: mockIsRouteErrorResponse,
  };
});

describe("clientLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return locale from detectLocaleClient", async () => {
    const result = await clientLoader();

    expect(result).toHaveProperty("locale");
    expect(typeof result.locale).toBe("string");
  });

  test("should return supported locale", async () => {
    const result = await clientLoader();

    expect(supportedLocales.includes(result.locale as Locale)).toBe(true);
  });

  test("should return default locale by default", async () => {
    const result = await clientLoader();

    expect(result.locale).toBe(defaultLocale);
  });

  test("should return different locale when detectLocaleClient returns it", async () => {
    const { detectLocaleClient } = await import("~/lib/i18n/i18n.client");
    vi.mocked(detectLocaleClient).mockReturnValue("zh");

    const result = await clientLoader();

    expect(result.locale).toBe("zh");
  });

  test("should call detectLocaleClient once per loader call", async () => {
    const { detectLocaleClient } = await import("~/lib/i18n/i18n.client");

    await clientLoader();
    await clientLoader();
    await clientLoader();

    expect(detectLocaleClient).toHaveBeenCalledTimes(3);
  });
});

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouteLoaderData.mockReturnValue({ locale: "en" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should render children", () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("should render body element with children", () => {
    render(
      <Layout>
        <span data-testid="child">Child Element</span>
      </Layout>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

describe("HydrateFallback", () => {
  test("should render loading spinner", () => {
    render(<HydrateFallback />);

    const spinners = document.querySelectorAll(".loading-spinner");
    expect(spinners.length).toBeGreaterThan(0);
  });

  test("should render loading text", () => {
    render(<HydrateFallback />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("should have loading-pulse class on text", () => {
    render(<HydrateFallback />);

    const loadingText = screen.getByText("Loading...");
    expect(loadingText).toHaveClass("loading-pulse");
  });

  test("should render two spinner elements", () => {
    render(<HydrateFallback />);

    const spinners = document.querySelectorAll(".loading-spinner");
    expect(spinners.length).toBe(2);
  });
});

interface MockRouteErrorResponse {
  status: number;
  statusText: string;
  data: unknown;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsRouteErrorResponse.mockReturnValue(false);
  });

  test("should render Oops! header for any error", () => {
    render(<ErrorBoundary error={new Error("Test error")} />);

    expect(screen.getByText("Oops!")).toBeInTheDocument();
  });

  test("should render 404 message for 404 error response", () => {
    mockIsRouteErrorResponse.mockReturnValue(true);

    const errorResponse: MockRouteErrorResponse = {
      status: 404,
      statusText: "Not Found",
      data: null,
    };

    render(<ErrorBoundary error={errorResponse as unknown as Error} />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByText("The requested page could not be found."),
    ).toBeInTheDocument();
  });

  test("should render error status for other error responses", () => {
    mockIsRouteErrorResponse.mockReturnValue(true);

    const errorResponse: MockRouteErrorResponse = {
      status: 500,
      statusText: "Internal Server Error",
      data: null,
    };

    render(<ErrorBoundary error={errorResponse as unknown as Error} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Internal Server Error")).toBeInTheDocument();
  });

  test("should show error message in dev mode for Error instance", () => {
    vi.stubEnv("DEV", true);

    const error = new Error("Test error message");
    error.stack = "Error stack trace";

    render(<ErrorBoundary error={error} />);

    expect(screen.getByText("Test error message")).toBeInTheDocument();

    vi.stubEnv("DEV", false);
  });

  test("should show stack trace in dev mode", () => {
    vi.stubEnv("DEV", true);

    const error = new Error("Test error");
    error.stack = "Test stack trace";

    render(<ErrorBoundary error={error} />);

    expect(screen.getByText("Test stack trace")).toBeInTheDocument();

    vi.stubEnv("DEV", false);
  });
});

interface LinkDescriptor {
  rel: string;
  href?: string;
  crossOrigin?: string;
}

describe("links function", () => {
  test("should return array of link objects", () => {
    const result = links();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test("should include Google Fonts preconnect", () => {
    const result = links();

    const hasGoogleFonts = result.some(
      (link: LinkDescriptor) =>
        link.rel === "preconnect" &&
        link.href === "https://fonts.googleapis.com",
    );

    expect(hasGoogleFonts).toBe(true);
  });

  test("should include Google Fonts static preconnect", () => {
    const result = links();

    const hasGstatic = result.some(
      (link: LinkDescriptor) =>
        link.rel === "preconnect" && link.href === "https://fonts.gstatic.com",
    );

    expect(hasGstatic).toBe(true);
  });

  test("should include stylesheet link", () => {
    const result = links();

    const hasStylesheet = result.some(
      (link: LinkDescriptor) =>
        link.rel === "stylesheet" &&
        link.href &&
        link.href.includes("fonts.googleapis.com"),
    );

    expect(hasStylesheet).toBe(true);
  });

  test("should set crossOrigin for gstatic preconnect", () => {
    const result = links();

    const gstaticLink = result.find(
      (link: LinkDescriptor) => link.href === "https://fonts.gstatic.com",
    );

    expect(gstaticLink?.crossOrigin).toBe("anonymous");
  });
});
