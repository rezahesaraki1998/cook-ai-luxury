import { useEffect, useMemo, useState } from "react";
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Crown,
  Gift,
  Eye,
  CalendarDays,
  CalendarClock,
  Search as SearchIcon,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { PageHeader, StatCard, RangeControls, EmptyState, type RangeState } from "@/components/admin/AdminShared";
import { adminApi, isAuthError } from "@/hooks/useAdmin";
import { useLanguage } from "@/i18n/LanguageContext";
import { resolveRange, formatNumber } from "@/lib/adminUtils";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  freeUsers: number;
  premiumUsers: number;
  totalVisits: number;
  visitsToday: number;
  visitsWeek: number;
  visitsMonth: number;
  uniqueTotal: number;
  uniqueToday: number;
  uniqueMonth: number;
  totalSearches: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  newUsersMonth: number;
}

const AdminDashboard = () => {
  const { t, locale } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [series, setSeries] = useState<{ label: string; value: number }[]>([]);
  const [searches, setSearches] = useState<{ term: string; count: number }[]>([]);
  const [range, setRange] = useState<RangeState>({ key: "last7" });
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");
  const [loading, setLoading] = useState(true);

  const resolved = useMemo(() => resolveRange(range.key, range), [range]);

  useEffect(() => {
    adminApi<Stats>("stats").then(setStats).catch((e) => { if (!isAuthError(e)) toast.error(t("admin.common.error")); });
  }, [t]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi<{ series: { label: string; value: number }[] }>("visits_series", { ...resolved, granularity }),
      adminApi<{ items: { term: string; count: number }[] }>("top_searches", { ...resolved, limit: 10 }),
    ])
      .then(([v, s]) => {
        setSeries(v.series);
        setSearches(s.items);
      })
      .catch((e) => { if (!isAuthError(e)) toast.error(t("admin.common.error")); })
      .finally(() => setLoading(false));
  }, [resolved, granularity, t]);

  return (
    <AdminLayout>
      <PageHeader title={t("admin.dashboard.title")} subtitle={t("admin.dashboard.subtitle")} />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        <StatCard label={t("admin.dashboard.totalUsers")} value={stats?.totalUsers ?? 0} icon={UsersIcon} />
        <StatCard label={t("admin.dashboard.activeUsers")} value={stats?.activeUsers ?? 0} icon={UserCheck} />
        <StatCard label={t("admin.dashboard.inactiveUsers")} value={stats?.inactiveUsers ?? 0} icon={UserX} />
        <StatCard label={t("admin.dashboard.premiumUsers")} value={stats?.premiumUsers ?? 0} icon={Crown} />
        <StatCard label={t("admin.dashboard.freeUsers")} value={stats?.freeUsers ?? 0} icon={Gift} />
        <StatCard label={t("admin.dashboard.uniqueTotal")} value={stats?.uniqueTotal ?? 0} icon={UsersIcon} />
        <StatCard label={t("admin.dashboard.uniqueToday")} value={stats?.uniqueToday ?? 0} icon={UserCheck} />
        <StatCard label={t("admin.dashboard.uniqueMonth")} value={stats?.uniqueMonth ?? 0} icon={TrendingUp} />
        <StatCard label={t("admin.dashboard.totalVisits")} value={stats?.totalVisits ?? 0} icon={Eye} />
        <StatCard label={t("admin.dashboard.visitsToday")} value={stats?.visitsToday ?? 0} icon={CalendarDays} />
        <StatCard label={t("admin.dashboard.visitsMonth")} value={stats?.visitsMonth ?? 0} icon={CalendarClock} />
        <StatCard label={t("admin.dashboard.activeSubs")} value={stats?.activeSubscriptions ?? 0} icon={Crown} />
        <StatCard label={t("admin.dashboard.expiredSubs")} value={stats?.expiredSubscriptions ?? 0} icon={CalendarClock} />
        <StatCard label={t("admin.dashboard.totalSearches")} value={stats?.totalSearches ?? 0} icon={SearchIcon} />
        <StatCard label={t("admin.dashboard.newUsers")} value={stats?.newUsersMonth ?? 0} icon={TrendingUp} />
      </div>

      <Card className="glass-card border border-black/15 p-4 md:p-6 mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">{t("admin.dashboard.visitsChart")}</h2>
          <RangeControls
            value={range}
            onChange={setRange}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
        </div>
        <div className="h-[280px]" dir="ltr">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("admin.common.loading")}</p>
          ) : series.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#visitFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="glass-card border border-black/15 p-4 md:p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">{t("admin.dashboard.topSearches")}</h2>
        {searches.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.dashboard.searchTerm")}</TableHead>
                  <TableHead>{t("admin.dashboard.searchCount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searches.map((s) => (
                  <TableRow key={s.term}>
                    <TableCell className="font-medium">{s.term}</TableCell>
                    <TableCell>{formatNumber(s.count, locale)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
