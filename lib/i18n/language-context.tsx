"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, Lang } from "./translations";
import { legalTranslations } from "./legal-translations";

// Merge analyzer translations with legal translations
const mergedTranslations: Record<Lang, Record<string, any>> = {} as any;
for (const lang of Object.keys(translations) as Lang[]) {
  mergedTranslations[lang] = {
    ...translations[lang],
    ...(legalTranslations[lang] || {}),
  };
}

// Export for direct access in components that need arrays/objects
export { mergedTranslations };

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  tRaw: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "kk",
  setLang: () => {},
  t: (key: string) => key,
  tRaw: (key: string) => key,
});

function resolve(obj: any, keys: string[]): any {
  let value = obj;
  for (const k of keys) {
    value = value?.[k];
  }
  return value;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("kk");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang;
    if (saved && mergedTranslations[saved]) {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      const value = resolve(mergedTranslations[lang], keys);
      if (typeof value === "string") return value;
      // Fallback to English
      const fallback = resolve(mergedTranslations.en, keys);
      return typeof fallback === "string" ? fallback : key;
    },
    [lang]
  );

  const tRaw = useCallback(
    (key: string): any => {
      const keys = key.split(".");
      const value = resolve(mergedTranslations[lang], keys);
      if (value !== undefined && value !== null) return value;
      // Fallback to English
      return resolve(mergedTranslations.en, keys);
    },
    [lang]
  );

  // Prevent hydration mismatch by rendering with default lang until mounted
  if (!mounted) {
    return <LanguageContext.Provider value={{ lang: "kk", setLang, t, tRaw }}>{children}</LanguageContext.Provider>;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tRaw }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
