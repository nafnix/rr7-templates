import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import { detectLocale } from "./lib/i18n/i18n.server";
import { localeCookieHeader } from "./lib/i18n/locale-cookie";
import "./app.css";
import { defaultLocale, type Locale } from "./lib/i18n/config";
import { Trans } from "@lingui/react/macro";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const locale = await detectLocale(request);

  return Response.json({ locale } as { locale: Locale }, {
    headers: await localeCookieHeader(locale),
  });
}

export type RootLoaderData = typeof loader;

export function Layout({ children }: { children: React.ReactNode }) {
  const { locale } = useRouteLoaderData<RootLoaderData>("root") ?? {
    locale: defaultLocale,
  };
  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="loading-spinner absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          <div className="loading-spinner absolute inset-0 rounded-full border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </div>
        <p className="loading-pulse text-sm text-gray-500 dark:text-gray-400">
          <Trans>Loading...</Trans>
        </p>
      </div>
    </div>
  );
}

export default function Root() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
