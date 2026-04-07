import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { I18nProvider } from "@lingui/react";
import { initI18n, i18nInstance } from "./lib/i18n/i18n-instance";
import { detectLocaleClient } from "./lib/i18n/i18n.client";

const locale = detectLocaleClient();

function renderApp() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <I18nProvider i18n={i18nInstance}>
          <HydratedRouter />
        </I18nProvider>
      </StrictMode>,
    );
  });
}

initI18n(locale)
  .then(renderApp)
  .catch((error) => {
    console.error("Failed to initialize i18n:", error);
    renderApp();
  });
