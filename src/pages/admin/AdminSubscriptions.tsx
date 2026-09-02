import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, EmptyState } from "@/components/admin/AdminShared";
import { adminApi } from "@/hooks/useAdmin";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatDate, formatNumber } from "@/lib/adminUtils";
import { toast } from "sonner";

interface Sub {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  plan_name: string | null;
  plan_name_en: string | null;
  status: string;
  started_at: string;
  expires_at: string | null;
  days_left: number | null;
}

const AdminSubscriptions = () => {
  const { t, locale } = useLanguage();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    adminApi<{ subscriptions: Sub[] }>("subscriptions")
      .then((r) => setSubs(r.subscriptions))
      .catch(() => toast.error(t("admin.common.error")))
      .finally(() => setLoading(false));
  }, [t]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return subs.filter(
      (s) =>
        (status === "all" || s.status === status) &&
        (!term ||
          s.full_name?.toLowerCase().includes(term) ||
          s.email?.toLowerCase().includes(term) ||
          s.phone?.includes(term)),
    );
  }, [subs, q, status]);

  return (
    <AdminLayout>
      <PageHeader title={t("admin.subs.title")} subtitle={t("admin.subs.subtitle")} />
      <Card className="glass-card border border-black/15 p-4 md:p-6">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("admin.users.searchPlaceholder")}
              className="ps-9 border-black/15"
            />
          </div>
          <div className="w-[170px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border-black/15"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.common.all")}</SelectItem>
                <SelectItem value="active">{t("admin.subs.active")}</SelectItem>
                <SelectItem value="expired">{t("admin.subs.expired")}</SelectItem>
                <SelectItem value="canceled">{t("admin.subs.canceled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-6">{t("admin.common.loading")}</p>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.name")}</TableHead>
                  <TableHead>{t("admin.users.email")}</TableHead>
                  <TableHead>{t("admin.subs.plan")}</TableHead>
                  <TableHead>{t("admin.subs.status")}</TableHead>
                  <TableHead>{t("admin.subs.start")}</TableHead>
                  <TableHead>{t("admin.subs.end")}</TableHead>
                  <TableHead>{t("admin.subs.daysLeft")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name || t("admin.common.none")}</TableCell>
                    <TableCell className="text-xs">{s.email}</TableCell>
                    <TableCell>
                      {(locale === "en" ? s.plan_name_en || s.plan_name : s.plan_name) ?? t("admin.common.none")}
                    </TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-xs">{formatDate(s.started_at, locale)}</TableCell>
                    <TableCell className="text-xs">{formatDate(s.expires_at, locale)}</TableCell>
                    <TableCell className="text-xs">
                      {s.days_left === null
                        ? t("admin.common.none")
                        : `${formatNumber(s.days_left, locale)} ${t("admin.subs.days")}`}
                    </TableCell>
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

export default AdminSubscriptions;
