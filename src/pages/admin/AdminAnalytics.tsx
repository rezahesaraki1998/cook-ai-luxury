import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { PageHeader, RangeControls, EmptyState, StatCard, type RangeState } from "@/components/admin/AdminShared";
import { adminApi } from "@/hooks/useAdmin";
import { useLanguage } from "@/i18n/LanguageContext";
import { resolveRange, formatNumber } from "@/lib/adminUtils";
import { Eye, Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";

const AdminAnalytics = () => {
  const { t, locale } = useLanguage();
  const [range, setRange] = useState<RangeState>({ key: "thisMonth" });
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");
  const [series, setSeries] = useState<{ label: string; value: number }[]>([]);
  const [searches, setSearches] = useState<{ term: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const resolved = useMemo(() => resolveRange(range.key, range), [range]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi<{ series: { label: string; value: number }[] }>("visits_series", { ...resolved, granularity }),
      adminApi<{ items: { term: string; count: number }[] }>("top_searches", { ...resolved, limit: 30 }),
    ])
      .then(([v, s]) => {
        setSeries(v.series);
        setSearches(s.items);
      })
      .catch(() => toast.error(t("admin.common.error")))
      .finally(() => setLoading(false));
  }, [resolved, granularity, t]);

  const totalVisits = series.reduce((a, b) => a + b.value, 0);
  const totalSearches = searches.reduce((a, b) => a + b.count, 0);

  return (
    <AdminLayout>
      <PageHeader
        title={t("admin.analytics.title")}
        subtitle={t("admin.analytics.subtitle")}
        actions={
          <RangeControls
            value={range}
            onChange={setRange}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label={t("admin.analytics.visits")} value={totalVisits} icon={Eye} />
        <StatCard label={t("admin.analytics.searches")} value={totalSearches} icon={SearchIcon} />
      </div>

      <Card className="glass-card border border-black/15 p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">{t("admin.dashboard.visitsChart")}</h2>
        <div className="h-[300px]" dir="ltr">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("admin.common.loading")}</p>
          ) : series.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
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
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
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

export default AdminAnalytics;
