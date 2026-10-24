import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type Payload = Record<string, unknown>;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // ---- Server-side admin verification (mandatory) ----
    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) return json({ error: "unauthorized" }, 401);

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "forbidden" }, 403);

    const body = (await req.json().catch(() => ({}))) as Payload;
    const action = String(body.action ?? "");
    const p = (body.payload ?? {}) as Payload;

    // ---------- helpers ----------
    const authUsers = async () => {
      const map = new Map<string, { email: string; created_at: string; last_sign_in_at: string | null }>();
      for (let page = 1; page <= 20; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        for (const u of data.users) {
          map.set(u.id, {
            email: u.email ?? "",
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at ?? null,
          });
        }
        if (data.users.length < 1000) break;
      }
      return map;
    };

    const buildUsers = async () => {
      const emails = await authUsers();
      const [{ data: profiles }, { data: subs }, { data: plans }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("subscriptions").select("*").order("started_at", { ascending: false }),
        supabase.from("plans").select("id,name,name_en"),
      ]);
      const planMap = new Map((plans ?? []).map((pl) => [pl.id, pl]));
      const now = Date.now();
      const subByUser = new Map<string, Record<string, unknown>>();
      for (const s of subs ?? []) if (!subByUser.has(s.user_id)) subByUser.set(s.user_id, s);

      return (profiles ?? []).map((pr) => {
        const auth = emails.get(pr.id);
        const sub = subByUser.get(pr.id) as
          | { plan_id: string | null; status: string; started_at: string; expires_at: string | null }
          | undefined;
        const expired = !!sub?.expires_at && new Date(sub.expires_at).getTime() < now;
        const subStatus = sub ? (sub.status === "canceled" ? "canceled" : expired ? "expired" : "active") : null;
        const plan = sub?.plan_id ? planMap.get(sub.plan_id) : null;
        return {
          id: pr.id,
          first_name: pr.first_name,
          last_name: pr.last_name,
          full_name: [pr.first_name, pr.last_name].filter(Boolean).join(" "),
          email: auth?.email ?? "",
          phone: pr.phone ?? "",
          avatar_url: pr.avatar_url,
          created_at: pr.created_at ?? auth?.created_at,
          last_sign_in_at: auth?.last_sign_in_at ?? null,
          is_active: pr.is_active !== false,
          account_type: subStatus === "active" ? "premium" : "free",
          plan_id: sub?.plan_id ?? null,
          plan_name: plan?.name ?? null,
          plan_name_en: plan?.name_en ?? null,
          subscription_status: subStatus,
          subscription_start: sub?.started_at ?? null,
          subscription_end: sub?.expires_at ?? null,
          plan_payment_link: (plan as { payment_link?: string | null })?.payment_link ?? null,
        };
      });
    };

    const rangeFilter = (q: unknown) => {
      let query = q as { gte: (c: string, v: string) => unknown; lte: (c: string, v: string) => unknown };
      if (p.from) query = query.gte("created_at", String(p.from)) as typeof query;
      if (p.to) query = query.lte("created_at", String(p.to)) as typeof query;
      return query;
    };

    switch (action) {
      // ---------------- dashboard ----------------
      case "stats": {
        const users = await buildUsers();
        const now = new Date();
        const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(startOfDay); startOfWeek.setDate(startOfDay.getDate() - 7);
        const startOfMonth = new Date(startOfDay); startOfMonth.setDate(startOfDay.getDate() - 30);

        const countVisits = async (from?: Date) => {
          let q = supabase.from("site_visits").select("id", { count: "exact", head: true });
          if (from) q = q.gte("created_at", from.toISOString());
          const { count } = await q;
          return count ?? 0;
        };
        const countUnique = async (from?: Date) => {
          const ids = new Set<string>();
          for (let off = 0; off < 500000; off += 1000) {
            let q = supabase.from("site_visits").select("visitor_id").range(off, off + 999);
            if (from) q = q.gte("created_at", from.toISOString());
            const { data } = await q;
            for (const r of data ?? []) if (r.visitor_id) ids.add(r.visitor_id);
            if (!data || data.length < 1000) break;
          }
          return ids.size;
        };
        const { count: searchCount } = await supabase
          .from("search_logs").select("id", { count: "exact", head: true });
        const { data: subs } = await supabase.from("subscriptions").select("status,expires_at");
        const nowMs = now.getTime();
        const activeSubs = (subs ?? []).filter(
          (s) => s.status === "active" && (!s.expires_at || new Date(s.expires_at).getTime() >= nowMs),
        ).length;
        const expiredSubs = (subs ?? []).filter(
          (s) => s.status === "expired" || (!!s.expires_at && new Date(s.expires_at).getTime() < nowMs),
        ).length;

        return json({
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.is_active).length,
          inactiveUsers: users.filter((u) => !u.is_active).length,
          freeUsers: users.filter((u) => u.account_type === "free").length,
          premiumUsers: users.filter((u) => u.account_type === "premium").length,
          totalVisits: await countVisits(),
          visitsToday: await countVisits(startOfDay),
          visitsWeek: await countVisits(startOfWeek),
          visitsMonth: await countVisits(startOfMonth),
          totalSearches: searchCount ?? 0,
          activeSubscriptions: activeSubs,
          expiredSubscriptions: expiredSubs,
          newUsersMonth: users.filter((u) => u.created_at && new Date(u.created_at) >= startOfMonth).length,
        });
      }

      case "visits_series": {
        const from = String(p.from ?? new Date(Date.now() - 7 * 864e5).toISOString());
        const to = String(p.to ?? new Date().toISOString());
        const { data, error } = await supabase
          .from("site_visits")
          .select("created_at")
          .gte("created_at", from)
          .lte("created_at", to)
          .order("created_at", { ascending: true })
          .limit(100000);
        if (error) throw error;
        const granularity = String(p.granularity ?? "day");
        const bucket = (iso: string) => {
          const d = new Date(iso);
          if (granularity === "month") return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
          if (granularity === "week") {
            const wd = new Date(d); wd.setUTCDate(d.getUTCDate() - d.getUTCDay());
            return wd.toISOString().slice(0, 10);
          }
          return d.toISOString().slice(0, 10);
        };
        const counts = new Map<string, number>();
        for (const row of data ?? []) {
          const k = bucket(row.created_at);
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
        return json({
          series: [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([label, value]) => ({ label, value })),
        });
      }

      case "top_searches": {
        let q = supabase.from("search_logs").select("query,normalized_query").limit(100000);
        q = rangeFilter(q) as typeof q;
        const { data, error } = await q;
        if (error) throw error;
        const counts = new Map<string, { term: string; count: number }>();
        for (const row of data ?? []) {
          const key = row.normalized_query || row.query;
          const prev = counts.get(key);
          if (prev) prev.count += 1;
          else counts.set(key, { term: row.query, count: 1 });
        }
        return json({
          items: [...counts.values()].sort((a, b) => b.count - a.count).slice(0, Number(p.limit ?? 20)),
        });
      }

      // ---------------- users ----------------
      case "users":
        return json({ users: await buildUsers() });

      case "set_user_active": {
        const { error } = await supabase
          .from("profiles")
          .update({ is_active: !!p.is_active })
          .eq("id", String(p.user_id));
        if (error) throw error;
        return json({ ok: true });
      }

      // ---------------- plans ----------------
      case "plans": {
        const { data: plans, error } = await supabase.from("plans").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        const { data: subs } = await supabase.from("subscriptions").select("plan_id,status,expires_at");
        const nowMs = Date.now();
        return json({
          plans: (plans ?? []).map((pl) => ({
            ...pl,
            user_count: (subs ?? []).filter(
              (s) => s.plan_id === pl.id && s.status === "active" && (!s.expires_at || new Date(s.expires_at).getTime() >= nowMs),
            ).length,
          })),
        });
      }
      case "plan_save": {
        const row = p.row as Payload;
        const res = row.id
          ? await supabase.from("plans").update({ ...row, id: undefined }).eq("id", String(row.id))
          : await supabase.from("plans").insert(row);
        if (res.error) throw res.error;
        return json({ ok: true });
      }
      case "plan_delete": {
        const { error } = await supabase.from("plans").delete().eq("id", String(p.id));
        if (error) throw error;
        return json({ ok: true });
      }

      // ---------------- subscriptions ----------------
      case "subscriptions": {
        const users = await buildUsers();
        const byId = new Map(users.map((u) => [u.id, u]));
        const { data: subs, error } = await supabase
          .from("subscriptions").select("*").order("started_at", { ascending: false });
        if (error) throw error;
        const { data: plans } = await supabase.from("plans").select("id,name,name_en");
        const planMap = new Map((plans ?? []).map((pl) => [pl.id, pl]));
        const nowMs = Date.now();
        return json({
          subscriptions: (subs ?? []).map((s) => {
            const u = byId.get(s.user_id);
            const expired = !!s.expires_at && new Date(s.expires_at).getTime() < nowMs;
            return {
              ...s,
              status: s.status === "canceled" ? "canceled" : expired ? "expired" : s.status,
              plan_name: s.plan_id ? planMap.get(s.plan_id)?.name ?? null : null,
              plan_name_en: s.plan_id ? planMap.get(s.plan_id)?.name_en ?? null : null,
              full_name: u?.full_name ?? "",
              email: u?.email ?? "",
              phone: u?.phone ?? "",
              days_left: s.expires_at
                ? Math.max(0, Math.ceil((new Date(s.expires_at).getTime() - nowMs) / 864e5))
                : null,
            };
          }),
        });
      }
      case "subscription_save": {
        const row = p.row as Payload;
        const res = row.id
          ? await supabase.from("subscriptions").update({ ...row, id: undefined }).eq("id", String(row.id))
          : await supabase.from("subscriptions").insert(row);
        if (res.error) throw res.error;
        return json({ ok: true });
      }

      // ---------------- discount codes ----------------
      case "discounts": {
        const { data, error } = await supabase.from("discount_codes").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return json({ discounts: data ?? [] });
      }
      case "discount_save": {
        const row = p.row as Payload;
        const res = row.id
          ? await supabase.from("discount_codes").update({ ...row, id: undefined }).eq("id", String(row.id))
          : await supabase.from("discount_codes").insert(row);
        if (res.error) throw res.error;
        return json({ ok: true });
      }
      case "discount_delete": {
        const { error } = await supabase.from("discount_codes").delete().eq("id", String(p.id));
        if (error) throw error;
        return json({ ok: true });
      }

      // ---------------- site content ----------------
      case "content": {
        const { data, error } = await supabase.from("site_content").select("*").order("page_key");
        if (error) throw error;
        return json({ content: data ?? [] });
      }
      case "content_save": {
        const row = p.row as Payload;
        const { error } = await supabase
          .from("site_content")
          .update({ ...row, id: undefined, page_key: undefined })
          .eq("page_key", String(row.page_key));
        if (error) throw error;
        return json({ ok: true });
      }

      default:
        return json({ error: "unknown_action" }, 400);
    }
  } catch (e) {
    console.error("admin-api error", e);
    return json({ error: (e as Error).message ?? "internal_error" }, 500);
  }
});
