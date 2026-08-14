import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { translations, LOCALES, type Locale, type Translation } from "./translations";

const STORAGE_KEY = "app_language";
export const DEFAULT_LOCALE: Locale = "fa";

const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && LOCALES.some((l) => l.code === value);

const readStoredLocale = (): Locale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
};

type Vars = Record<string, string | number>;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "rtl" | "ltr";
  isRTL: boolean;
  /** Translated string by dot path, e.g. t("hero.title") */
  t: (path: string, vars?: Vars) => string;
  /** Raw (possibly non-string) translation value, e.g. arrays */
  tr: Translation;
  /** Formats a number using the active locale digits */
  n: (value: number | string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

const resolve = (dict: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

  const meta = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    const root = document.documentElement;
    root.lang = meta.htmlLang;
    root.dir = meta.dir;
  }, [meta.dir, meta.htmlLang]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const n = useCallback(
    (value: number | string) => {
      const str = String(value);
      if (locale !== "fa") return str;
      return str.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
    },
    [locale],
  );

  const t = useCallback(
    (path: string, vars?: Vars) => {
      const value = resolve(translations[locale], path) ?? resolve(translations[DEFAULT_LOCALE], path);
      if (typeof value !== "string") return path;
      if (!vars) return value;
      return Object.entries(vars).reduce(
        (acc, [key, val]) => acc.split(`{${key}}`).join(String(val)),
        value,
      );
    },
    [locale],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      dir: meta.dir,
      isRTL: meta.dir === "rtl",
      t,
      tr: translations[locale],
      n,
    }),
    [locale, setLocale, meta.dir, t, n],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};
