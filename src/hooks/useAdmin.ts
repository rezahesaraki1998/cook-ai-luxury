import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

/** Calls the server-side admin API. All authorisation happens on the server. */
export async function adminApi<T = unknown>(action: string, payload: Record<string, unknown> = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("unauthorized");

  const { data, error } = await supabase.functions.invoke("admin-api", {
    body: { action, payload },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error: string }).error));
  }
  return data as T;
}

export type AdminAccess = "loading" | "guest" | "denied" | "granted";

/** Verifies admin access; the authoritative check is also enforced server-side. */
export const useAdminAccess = () => {
  const [access, setAccess] = useState<AdminAccess>("loading");
  const [user, setUser] = useState<User | null>(null);

  const check = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setUser(null);
      setAccess("guest");
      return;
    }
    setUser(data.user);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setAccess(roles ? "granted" : "denied");
  }, []);

  useEffect(() => {
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub.subscription.unsubscribe();
  }, [check]);

  return { access, user, recheck: check };
};

/** True when the failure is just a missing/insufficient session (no toast needed). */
export const isAuthError = (e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  return /unauthorized|forbidden/i.test(msg);
};
