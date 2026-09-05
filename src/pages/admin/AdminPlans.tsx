import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { adminApi, isAuthError } from "@/hooks/useAdmin";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatMoney, formatNumber } from "@/lib/adminUtils";
import { toast } from "sonner";

interface Plan {
  id?: string;
  name: string;
  name_en: string | null;
  price: number | string;
  duration_days: number;
  description: string | null;
  description_en: string | null;
  features: string[];
  ai_limit: number | null;
  request_limit: number | null;
  is_active: boolean;
  payment_link: string | null;
  user_count?: number;
}

const blank: Plan = {
  name: "",
  name_en: "",
  price: 0,
  duration_days: 30,
  description: "",
  description_en: "",
  features: [],
  ai_limit: null,
  request_limit: null,
  is_active: true,
  payment_link: "",
};

const AdminPlans = () => {
  const { t, locale } = useLanguage();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi<{ plans: Plan[] }>("plans")
      .then((r) => setPlans(r.plans))
      .catch((e) => { if (!isAuthError(e)) toast.error(t("admin.common.error")); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    if (!editing?.name.trim()) return toast.error(t("admin.plans.name"));
    setSaving(true);
    try {
      await adminApi("plan_save", {
        row: {
          ...(editing.id ? { id: editing.id } : {}),
          name: editing.name.trim(),
          name_en: editing.name_en || null,
          price: Number(editing.price) || 0,
          duration_days: Number(editing.duration_days) || 30,
          description: editing.description || null,
          description_en: editing.description_en || null,
          features: editing.features,
          ai_limit: editing.ai_limit === null ? null : Number(editing.ai_limit),
          request_limit: editing.request_limit === null ? null : Number(editing.request_limit),
          is_active: editing.is_active,
          payment_link: editing.payment_link?.trim() || null,
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
      await adminApi("plan_delete", { id: deleteId });
      toast.success(t("admin.common.deleted"));
      load();
    } catch {
      toast.error(t("admin.common.error"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title={t("admin.plans.title")}
        subtitle={t("admin.plans.subtitle")}
        actions={
          <Button className="gap-2 gradient-gold text-primary-foreground" onClick={() => setEditing({ ...blank })}>
            <Plus className="w-4 h-4" />
            {t("admin.plans.newPlan")}
          </Button>
        }
      />

      <Card className="glass-card border border-black/15 p-4 md:p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground py-6">{t("admin.common.loading")}</p>
        ) : plans.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.plans.name")}</TableHead>
                  <TableHead>{t("admin.plans.price")}</TableHead>
                  <TableHead>{t("admin.plans.duration")}</TableHead>
                  <TableHead>{t("admin.plans.aiLimit")}</TableHead>
                  <TableHead>{t("admin.plans.users")}</TableHead>
                  <TableHead>{t("admin.common.status")}</TableHead>
                  <TableHead>{t("admin.common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {locale === "en" ? p.name_en || p.name : p.name}
                    </TableCell>
                    <TableCell>{formatMoney(p.price, locale)}</TableCell>
                    <TableCell>{formatNumber(p.duration_days, locale)}</TableCell>
                    <TableCell>{p.ai_limit === null ? "∞" : formatNumber(p.ai_limit, locale)}</TableCell>
                    <TableCell>{formatNumber(p.user_count ?? 0, locale)}</TableCell>
                    <TableCell><StatusBadge status={p.is_active ? "active" : "inactive"} /></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => setEditing({ ...p, features: p.features ?? [] })}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setDeleteId(p.id!)}>
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
            <DialogTitle>{editing?.id ? t("admin.plans.editPlan") : t("admin.plans.newPlan")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t("admin.plans.name")}</Label>
                  <Input className="border-black/15" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <Label>{t("admin.plans.nameEn")}</Label>
                  <Input dir="ltr" className="border-black/15" value={editing.name_en ?? ""} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} />
                </div>
                <div>
                  <Label>{t("admin.plans.price")}</Label>
                  <Input type="number" className="border-black/15" value={String(editing.price)} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
                </div>
                <div>
                  <Label>{t("admin.plans.duration")}</Label>
                  <Input type="number" className="border-black/15" value={String(editing.duration_days)} onChange={(e) => setEditing({ ...editing, duration_days: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>{t("admin.plans.aiLimit")}</Label>
                  <Input
                    type="number"
                    className="border-black/15"
                    value={editing.ai_limit ?? ""}
                    onChange={(e) => setEditing({ ...editing, ai_limit: e.target.value === "" ? null : Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>{t("admin.plans.requestLimit")}</Label>
                  <Input
                    type="number"
                    className="border-black/15"
                    value={editing.request_limit ?? ""}
                    onChange={(e) => setEditing({ ...editing, request_limit: e.target.value === "" ? null : Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>{t("admin.plans.description")}</Label>
                <Textarea className="border-black/15" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <Label>{t("admin.plans.descriptionEn")}</Label>
                <Textarea dir="ltr" className="border-black/15" value={editing.description_en ?? ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
              </div>
              <div>
                <Label>{t("admin.plans.features")}</Label>
                <Textarea
                  className="border-black/15"
                  rows={4}
                  value={(editing.features ?? []).join("\n")}
                  onChange={(e) => setEditing({ ...editing, features: e.target.value.split("\n").filter(Boolean) })}
                />
              </div>
              <div>
                <Label>{t("admin.plans.paymentLink")}</Label>
                <Input
                  dir="ltr"
                  type="url"
                  placeholder={t("admin.plans.paymentLinkPlaceholder")}
                  className="border-black/15"
                  value={editing.payment_link ?? ""}
                  onChange={(e) => setEditing({ ...editing, payment_link: e.target.value })}
                />
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

export default AdminPlans;
