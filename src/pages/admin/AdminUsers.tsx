import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, EmptyState } from "@/components/admin/AdminShared";
import { adminApi, isAuthError } from "@/hooks/useAdmin";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatDate, formatNumber } from "@/lib/adminUtils";
import {
  EXPORT_COLUMNS,
  exportUsersCsv,
  exportUsersXlsx,
  type ExportColumn,
  type ExportableUser,
} from "@/lib/exportUsers";
import { toast } from "sonner";

interface AdminUser extends ExportableUser {
  id: string;
  subscription_status: string | null;
  last_sign_in_at: string | null;
}

type Scope = "all" | "premium" | "free" | "active" | "inactive";

const AdminUsers = () => {
  const { t, locale } = useLanguage();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [detail, setDetail] = useState<AdminUser | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportScope, setExportScope] = useState<Scope>("all");
  const [columns, setColumns] = useState<ExportColumn[]>([...EXPORT_COLUMNS]);

  const load = () => {
    setLoading(true);
    adminApi<{ users: AdminUser[] }>("users")
      .then((r) => setUsers(r.users))
      .catch((e) => { if (!isAuthError(e)) toast.error(t("admin.common.error")); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const applyScope = (list: AdminUser[], s: Scope) =>
    list.filter((u) => {
      if (s === "premium") return u.account_type === "premium";
      if (s === "free") return u.account_type === "free";
      if (s === "active") return u.is_active;
      if (s === "inactive") return !u.is_active;
      return true;
    });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return applyScope(users, scope).filter(
      (u) =>
        !term ||
        u.full_name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.includes(term),
    );
  }, [users, q, scope]);

  const toggleActive = async (u: AdminUser, next: boolean) => {
    try {
      await adminApi("set_user_active", { user_id: u.id, is_active: next });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: next } : x)));
      toast.success(t("admin.users.statusUpdated"));
    } catch {
      toast.error(t("admin.common.error"));
    }
  };

  const headers = Object.fromEntries(
    EXPORT_COLUMNS.map((c) => [c, t(`admin.users.${c}`)]),
  ) as Record<ExportColumn, string>;
  const labels = {
    active: t("admin.common.active"),
    inactive: t("admin.common.inactive"),
    premium: t("admin.users.premium"),
    free: t("admin.users.free"),
  };

  const doExport = (kind: "xlsx" | "csv") => {
    const rows = applyScope(users, exportScope);
    if (rows.length === 0 || columns.length === 0) return toast.error(t("admin.common.noData"));
    const ordered = EXPORT_COLUMNS.filter((c) => columns.includes(c));
    if (kind === "xlsx") exportUsersXlsx(rows, ordered, headers, labels);
    else exportUsersCsv(rows, ordered, headers, labels);
    toast.success(t("admin.users.exported"));
    setExportOpen(false);
  };

  return (
    <AdminLayout>
      <PageHeader
        title={t("admin.users.title")}
        subtitle={t("admin.users.subtitle")}
        actions={
          <Button className="gap-2 gradient-gold text-primary-foreground" onClick={() => setExportOpen(true)}>
            <Download className="w-4 h-4" />
            {t("admin.users.export")}
          </Button>
        }
      />

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
          <div className="w-[180px]">
            <Select value={scope} onValueChange={(v) => setScope(v as Scope)}>
              <SelectTrigger className="border-black/15"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.users.scopeAll")}</SelectItem>
                <SelectItem value="premium">{t("admin.users.scopePremium")}</SelectItem>
                <SelectItem value="free">{t("admin.users.scopeFree")}</SelectItem>
                <SelectItem value="active">{t("admin.users.scopeActive")}</SelectItem>
                <SelectItem value="inactive">{t("admin.users.scopeInactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground pb-2">
            {t("admin.users.count", { count: formatNumber(filtered.length, locale) })}
          </span>
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
                  <TableHead>{t("admin.users.phone")}</TableHead>
                  <TableHead>{t("admin.users.joined")}</TableHead>
                  <TableHead>{t("admin.users.accountType")}</TableHead>
                  <TableHead>{t("admin.users.accountStatus")}</TableHead>
                  <TableHead>{t("admin.common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || t("admin.common.none")}</TableCell>
                    <TableCell className="text-xs">{u.email}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{u.phone || t("admin.common.none")}</TableCell>
                    <TableCell className="text-xs">{formatDate(u.created_at, locale)}</TableCell>
                    <TableCell><StatusBadge status={u.account_type} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={u.is_active} onCheckedChange={(v) => toggleActive(u, v)} />
                        <StatusBadge status={u.is_active ? "active" : "inactive"} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setDetail(u)}>
                        {t("admin.common.preview")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* User details */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="glass-card">
          <DialogHeader><DialogTitle>{t("admin.users.details")}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              {([
                ["name", detail.full_name],
                ["email", detail.email],
                ["phone", detail.phone],
                ["joined", formatDate(detail.created_at, locale)],
                ["lastSignIn", formatDate(detail.last_sign_in_at, locale)],
                ["planName", detail.plan_name ?? t("admin.common.none")],
                ["subStart", formatDate(detail.subscription_start, locale)],
                ["subEnd", formatDate(detail.subscription_end, locale)],
              ] as const).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border/40 pb-1">
                  <span className="text-muted-foreground">{t(`admin.users.${k}`)}</span>
                  <span className="font-medium">{v || t("admin.common.none")}</span>
                </div>
              ))}
              <div className="flex justify-between gap-4 pt-1">
                <span className="text-muted-foreground">{t("admin.users.accountType")}</span>
                <StatusBadge status={detail.account_type} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="glass-card">
          <DialogHeader><DialogTitle>{t("admin.users.exportTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">{t("admin.users.exportScope")}</Label>
              <Select value={exportScope} onValueChange={(v) => setExportScope(v as Scope)}>
                <SelectTrigger className="border-black/15"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.users.scopeAll")}</SelectItem>
                  <SelectItem value="premium">{t("admin.users.scopePremium")}</SelectItem>
                  <SelectItem value="free">{t("admin.users.scopeFree")}</SelectItem>
                  <SelectItem value="active">{t("admin.users.scopeActive")}</SelectItem>
                  <SelectItem value="inactive">{t("admin.users.scopeInactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("admin.users.columns")}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {EXPORT_COLUMNS.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={columns.includes(c)}
                      onCheckedChange={(v) =>
                        setColumns((prev) => (v ? [...prev, c] : prev.filter((x) => x !== c)))
                      }
                    />
                    {t(`admin.users.${c}`)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setExportOpen(false)}>{t("admin.common.cancel")}</Button>
            <Button variant="outline" onClick={() => doExport("csv")}>{t("admin.users.exportCsv")}</Button>
            <Button className="gradient-gold text-primary-foreground" onClick={() => doExport("xlsx")}>
              {t("admin.users.exportExcel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
