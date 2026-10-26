import type vi from "@/dictionaries/vi.json";

export const locales = ["vi", "en", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

export const localeNames: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
  ja: "日本語",
};

export const htmlLang: Record<Locale, string> = { vi: "vi", en: "en", ja: "ja" };

export type Dictionary = typeof vi;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  vi: () => import("@/dictionaries/vi.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ja: () => import("@/dictionaries/ja.json").then((m) => m.default),
};

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

export const getDictionary = (locale: Locale) => dictionaries[locale]();

/** Prefixes an app path with the locale, e.g. ("en", "/services") -> "/en/services". */
export const localePath = (locale: Locale, path = "") => `/${locale}${path === "/" ? "" : path}`;

export function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(htmlLang[locale], { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(value),
  );
}
