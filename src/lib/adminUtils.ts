import type { Locale } from "@/i18n/translations";

export type RangeKey =
  | "today"
  | "yesterday"
  | "last7"
  | "thisWeek"
  | "thisMonth"
  | "lastMonth"
  | "last3Months"
  | "custom";

export const RANGE_KEYS: RangeKey[] = [
  "today",
  "yesterday",
  "last7",
  "thisWeek",
  "thisMonth",
  "lastMonth",
  "last3Months",
  "custom",
];

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const resolveRange = (
  key: RangeKey,
  custom?: { from?: string; to?: string },
): { from: string; to: string } => {
  const now = new Date();
  const today = startOfDay(now);
  switch (key) {
    case "today":
      return { from: today.toISOString(), to: endOfDay(now).toISOString() };
    case "yesterday": {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      return { from: y.toISOString(), to: endOfDay(y).toISOString() };
    }
    case "last7": {
      const f = new Date(today);
      f.setDate(today.getDate() - 6);
      return { from: f.toISOString(), to: endOfDay(now).toISOString() };
    }
    case "thisWeek": {
      const f = new Date(today);
      f.setDate(today.getDate() - today.getDay());
      return { from: f.toISOString(), to: endOfDay(now).toISOString() };
    }
    case "thisMonth": {
      const f = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: f.toISOString(), to: endOfDay(now).toISOString() };
    }
    case "lastMonth": {
      const f = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const t = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: f.toISOString(), to: endOfDay(t).toISOString() };
    }
    case "last3Months": {
      const f = new Date(today);
      f.setMonth(today.getMonth() - 3);
      return { from: f.toISOString(), to: endOfDay(now).toISOString() };
    }
    case "custom": {
      const f = custom?.from ? startOfDay(new Date(custom.from)) : new Date(today.getTime() - 29 * 864e5);
      const t = custom?.to ? endOfDay(new Date(custom.to)) : endOfDay(now);
      return { from: f.toISOString(), to: t.toISOString() };
    }
  }
};

export const formatDate = (value?: string | null, locale: Locale = "fa") => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
};

/** ISO date (yyyy-mm-dd) — stable for exports regardless of locale. */
export const isoDate = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export const formatNumber = (value: number, locale: Locale = "fa") =>
  new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(value);

export const formatMoney = (value: number | string, locale: Locale = "fa") =>
  new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(Number(value ?? 0));
