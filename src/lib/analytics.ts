import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "cl_visitor_id";

export const getVisitorId = (): string => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
};

const PRODUCTION_HOSTS = ["cookluxury.ir", "www.cookluxury.ir"];

/** Only real visitors on the live domain are counted (no preview/dev/test hosts). */
export const isProductionHost = (host: string) => PRODUCTION_HOSTS.includes(host.toLowerCase());

const adminCache = new Map<string, boolean>();
const isAdminUser = async (userId: string) => {
  if (adminCache.has(userId)) return adminCache.get(userId)!;
  const { data } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  const admin = !!data;
  adminCache.set(userId, admin);
  return admin;
};

/** Records a real page visit. Fails silently so the UX is never affected. */
export const trackVisit = async (path: string, locale?: string) => {
  try {
    if (typeof window === "undefined" || !isProductionHost(window.location.hostname)) return;
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (uid && (await isAdminUser(uid))) return;
    await supabase.from("site_visits").insert({
      path,
      visitor_id: getVisitorId(),
      user_id: data.session?.user?.id ?? null,
      locale: locale ?? null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    });
  } catch {
    /* analytics must never break the app */
  }
};

const normalize = (q: string) =>
  q.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.،,!?؟]+$/g, "");

/** Logs a real recipe search term for the admin analytics. */
export const logSearch = async (query: string, locale?: string) => {
  const clean = query.trim();
  if (!clean) return;
  try {
    if (typeof window === "undefined" || !isProductionHost(window.location.hostname)) return;
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (uid && (await isAdminUser(uid))) return;
    await supabase.from("search_logs").insert({
      query: clean.slice(0, 300),
      normalized_query: normalize(clean).slice(0, 300),
      user_id: data.session?.user?.id ?? null,
      visitor_id: getVisitorId(),
      locale: locale ?? null,
    });
  } catch {
    /* ignore */
  }
};
