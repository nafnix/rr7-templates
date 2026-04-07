import { Trans } from "@lingui/react/macro";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";

export function meta() {
  return [
    { title: "React Router i18n" },
    {
      name: "description",
      content: "Modern React Router application with internationalization",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <header className="fixed top-0 right-0 z-50 p-4">
        <LanguageSwitcher />
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 blur-lg dark:opacity-50" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  RR
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-gray-100">
              <Trans>Welcome to React Router</Trans>
            </h1>
            <p className="text-lg text-gray-600 sm:text-xl dark:text-gray-400">
              <Trans>
                A modern, production-ready framework for building full-stack
                React applications
              </Trans>
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30" />
            <div className="relative p-8 sm:p-10">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    <Trans>Internationalization Ready</Trans>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    <Trans>
                      Seamlessly switch between languages with built-in i18n
                      support
                    </Trans>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <div className="h-3 w-3 rounded-full bg-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-xl bg-white/60 p-4 shadow-sm transition-all duration-300 hover:bg-white/80 hover:shadow-md dark:bg-gray-800/60 dark:hover:bg-gray-800/80">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    <Trans>Fast</Trans>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <Trans>Optimized for performance</Trans>
                  </p>
                </div>
              </div>
            </div>
            <div className="group rounded-xl bg-white/60 p-4 shadow-sm transition-all duration-300 hover:bg-white/80 hover:shadow-md dark:bg-gray-800/60 dark:hover:bg-gray-800/80">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    <Trans>Secure</Trans>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <Trans>Production-ready security</Trans>
                  </p>
                </div>
              </div>
            </div>
            <div className="group rounded-xl bg-white/60 p-4 shadow-sm transition-all duration-300 hover:bg-white/80 hover:shadow-md dark:bg-gray-800/60 dark:hover:bg-gray-800/80">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    <Trans>Responsive</Trans>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <Trans>Works on all devices</Trans>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <Trans>Built with React Router 7, TailwindCSS, and Lingui</Trans>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
