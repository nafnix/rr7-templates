import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { I18nProvider } from "@lingui/react";
import { initI18n, i18nInstance } from "./lib/i18n/i18n-instance";
import { defaultLocale, isSupportedLocale, type Locale } from "./lib/i18n/config";

function renderErrorOverlay(error: Error) {
  const errorOverlay = document.createElement("div");
  errorOverlay.id = "i18n-error-overlay";

  const outerContainer = document.createElement("div");
  outerContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(239, 68, 68, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  const innerContainer = document.createElement("div");
  innerContainer.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    max-width: 500px;
    text-align: center;
  `;

  const heading = document.createElement("h2");
  heading.style.cssText = "margin: 0 0 1rem 0; color: #dc2626; font-size: 1.5rem;";
  heading.textContent = "Language Initialization Failed";

  const paragraph1 = document.createElement("p");
  paragraph1.style.cssText = "margin: 0 0 0.5rem 0; color: #4b5563;";
  paragraph1.textContent =
    "The application could not load language resources. Please refresh the page or check your internet connection.";

  // Safe textContent prevents XSS from malicious error messages
  const paragraph2 = document.createElement("p");
  paragraph2.style.cssText = "margin: 0 0 1.5rem 0; color: #6b7280; font-size: 0.875rem;";
  paragraph2.textContent = `Error: ${error.message}`;

  const button = document.createElement("button");
  button.style.cssText = `
    background: #dc2626;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 1rem;
  `;
  button.textContent = "Refresh Page";
  button.onclick = () => window.location.reload();

  innerContainer.appendChild(heading);
  innerContainer.appendChild(paragraph1);
  innerContainer.appendChild(paragraph2);
  innerContainer.appendChild(button);
  outerContainer.appendChild(innerContainer);
  errorOverlay.appendChild(outerContainer);
  document.body.appendChild(errorOverlay);
}

const docLang = document.documentElement.lang;
const locale: Locale = isSupportedLocale(docLang) ? docLang : defaultLocale;
initI18n(locale)
  .then(() => {
    startTransition(() => {
      hydrateRoot(
        document,
        <StrictMode>
          <I18nProvider i18n={i18nInstance}>
            <HydratedRouter />
          </I18nProvider>
        </StrictMode>
      );
    });
  })
  .catch((error) => {
    console.error("Failed to initialize i18n:", error);
    renderErrorOverlay(error);
  });
