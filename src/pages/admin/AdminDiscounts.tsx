import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { PageHeader, StatusBadge, EmptyState } from "@/components/admin/AdminShared";
import { adminApi } from "@/hooks/useAdmin";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatDate, formatNumber, isoDate } from "@/lib/adminUtils";
import { toast } from "sonner";

interface Discount {
  id?: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number | string;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  used_count?: number;
  plan_ids: string[];
  is_active: boolean;
}

const blank: Discount = {
  code: "",
  discount_type: "percent",
  discount_value: 0,
  starts_at: null,
  ends_at: null,
  max_uses: null,
  plan_ids: [],
  is_active: true,
};

const AdminDiscounts = () => {
  const { t, locale } = useLanguage();
  const [items, setItems] = useState<Discount[]>([]);
  const [plans, setPlans] = useState<{ id: string; name: string; name_en: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi<{ discounts: Discount[] }>("discounts"),
      adminApi<{ plans: { id: string; name: string; name_en: string | null }[] }>("plans"),
    ])
      .then(([d, p]) => {
        setItems(d.discounts);
        setPlans(p.plans);
      })
      .catch(() => toast.error(t("admin.common.error")))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    if (!editing?.code.trim()) return toast.error(t("admin.discounts.code"));
    setSaving(true);
    try {
      await adminApi("discount_save", {
        row: {
          ...(editing.id ? { id: editing.id } : {}),
          code: editing.code.trim().toUpperCase(),
          discount_type: editing.discount_type,
          discount_value: Number(editing.discount_value) || 0,
          starts_at: editing.starts_at ? new Date(editing.starts_at).toISOString() : null,
          ends_at: editing.ends_at ? new Date(editing.ends_at).toISOString() : null,
          max_uses: editing.max_uses === null ? null : Number(editing.max_uses),
          plan_ids: editing.plan_ids,
          is_active: editing.is_active,
        },
      });
      toast.success(t("admin.common.saved"));
      setEditing(null);
      load();
    } catch {
      toast.error(t("admin.common.error"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await adminApi("discount_delete", { id: deleteId });
      toast.success(t("admin.common.deleted"));
      load();
    } catch {
      toast.error(t("admin.common.error"));
    } finally {
      setDeleteId(null);
    }
  };

  const planLabel = (p: { name: string; name_en: string | null }) =>
    locale === "en" ? p.name_en || p.name : p.name;

  return (
    <AdminLayout>
      <PageHeader
        title={t("admin.discounts.title")}
        subtitle={t("admin.discounts.subtitle")}
        actions={
          <Button className="gap-2 gradient-gold text-primary-foreground" onClick={() => setEditing({ ...blank })}>
            <Plus className="w-4 h-4" />
            {t("admin.discounts.newCode")}
          </Button>
        }
      />

      <Card className="glass-card border border-black/15 p-4 md:p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground py-6">{t("admin.common.loading")}</p>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.discounts.code")}</TableHead>
                  <TableHead>{t("admin.discounts.type")}</TableHead>
                  <TableHead>{t("admin.discounts.value")}</TableHead>
                  <TableHead>{t("admin.discounts.start")}</TableHead>
                  <TableHead>{t("admin.discounts.end")}</TableHead>
                  <TableHead>{t("admin.discounts.usedCount")}</TableHead>
                  <TableHead>{t("admin.common.status")}</TableHead>
                  <TableHead>{t("admin.common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-medium" dir="ltr">{d.code}</TableCell>
                    <TableCell>
                      {d.discount_type === "percent" ? t("admin.discounts.percent") : t("admin.discounts.fixed")}
                    </TableCell>
                    <TableCell>{formatNumber(Number(d.discount_value), locale)}</TableCell>
                    <TableCell className="text-xs">{formatDate(d.starts_at, locale)}</TableCell>
                    <TableCell className="text-xs">{formatDate(d.ends_at, locale)}</TableCell>
                    <TableCell className="text-xs">
                      {formatNumber(d.used_count ?? 0, locale)}
                      {d.max_uses ? ` / ${formatNumber(d.max_uses, locale)}` : ""}
                    </TableCell>
                    <TableCell><StatusBadge status={d.is_active ? "active" : "inactive"} /></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setEditing({
                              ...d,
                              plan_ids: d.plan_ids ?? [],
                              starts_at: isoDate(d.starts_at) || null,
                              ends_at: isoDate(d.ends_at) || null,
                            })
                          }
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setDeleteId(d.id!)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="glass-card max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? t("admin.discounts.editCode") : t("admin.discounts.newCode")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t("admin.discounts.code")}</Label>
                  <Input dir="ltr" className="border-black/15 font-mono" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
                </div>
                <div>
                  <Label>{t("admin.discounts.type")}</Label>
                  <Select
                    value={editing.discount_type}
                    onValueChange={(v) => setEditing({ ...editing, discount_type: v as "percent" | "fixed" })}
                  >
                    <SelectTrigger className="border-black/15"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">{t("admin.discounts.percent")}</SelectItem>
                      <SelectItem value="fixed">{t("admin.discounts.fixed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("admin.discounts.value")}</Label>
                  <Input type="number" className="border-black/15" value={String(editing.discount_value)} onChange={(e) => setEditing({ ...editing, discount_value: e.target.value })} />
                </div>
                <div>
                  <Label>{t("admin.discounts.maxUses")}</Label>
                  <Input
                    type="number"
                    className="border-black/15"
                    value={editing.max_uses ?? ""}
                    onChange={(e) => setEditing({ ...editing, max_uses: e.target.value === "" ? null : Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>{t("admin.discounts.start")}</Label>
                  <Input type="date" className="border-black/15" value={editing.starts_at ?? ""} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value || null })} />
                </div>
                <div>
                  <Label>{t("admin.discounts.end")}</Label>
                  <Input type="date" className="border-black/15" value={editing.ends_at ?? ""} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value || null })} />
                </div>
              </div>

              <div>
                <Label>{t("admin.discounts.plans")}</Label>
                <p className="text-xs text-muted-foreground mb-2">{t("admin.discounts.allPlans")}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {plans.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={editing.plan_ids.includes(p.id)}
                        onCheckedChange={(v) =>
                          setEditing({
                            ...editing,
                            plan_ids: v
                              ? [...editing.plan_ids, p.id]
                              : editing.plan_ids.filter((x) => x !== p.id),
                          })
                        }
                      />
                      {planLabel(p)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                <span className="text-sm">{t("admin.common.active")}</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>{t("admin.common.cancel")}</Button>
            <Button className="gradient-gold text-primary-foreground" disabled={saving} onClick={save}>
              {t("admin.common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.common.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.common.confirmDelete")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>{t("admin.common.confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDiscounts;
