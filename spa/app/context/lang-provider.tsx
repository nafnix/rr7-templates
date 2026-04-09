import { I18nProvider } from "@lingui/react";
import { i18nInstance } from "~/lib/i18n/i18n-instance";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { detectLocaleClient } from "~/lib";

type LangContextValue = {
  lang: string | undefined;
  setLang: (newLang: string) => void;
};
const LangContext = createContext<LangContextValue | null>(null);

export function useLang() {
  const result = useContext(LangContext);
  if (!result) throw new Error("useLanguage must be used within LangProvider");
  return result;
}

type LangProviderProps = {
  lang?: string;
  onLangChange: (newLang: string) => void;
  children: ReactNode;
};

export function LangProvider({
  lang,
  onLangChange,
  children,
}: LangProviderProps) {
  const setLang = useCallback(
    (newLang: string) => onLangChange(newLang),
    [onLangChange],
  );

  useEffect(() => {
    if (i18nInstance.locale) setLang(i18nInstance.locale);
    else setLang(detectLocaleClient());
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, []);

  if (i18nInstance.locale)
    return (
      <LangContext.Provider value={{ lang, setLang }}>
        <I18nProvider i18n={i18nInstance}>{children}</I18nProvider>
      </LangContext.Provider>
    );

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}
