import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/AdminShared";
import { adminApi } from "@/hooks/useAdmin";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";

interface ContentRow {
  page_key: string;
  title_fa: string | null;
  title_en: string | null;
  body_fa: string | null;
  body_en: string | null;
  image_url: string | null;
  extra: Record<string, unknown>;
}

const PAGES = ["about", "contact", "terms", "privacy"] as const;

const AdminContent = () => {
  const { t } = useLanguage();
  const [rows, setRows] = useState<Record<string, ContentRow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    adminApi<{ content: ContentRow[] }>("content")
      .then((r) => {
        const map: Record<string, ContentRow> = {};
        for (const key of PAGES) {
          map[key] =
            r.content.find((c) => c.page_key === key) ??
            { page_key: key, title_fa: "", title_en: "", body_fa: "", body_en: "", image_url: "", extra: {} };
        }
        setRows(map);
      })
      .catch(() => toast.error(t("admin.common.error")))
      .finally(() => setLoading(false));
  }, [t]);

  const update = (key: string, patch: Partial<ContentRow>) =>
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const save = async (key: string) => {
    setSaving(key);
    try {
      const row = rows[key];
      await adminApi("content_save", {
        row: {
          page_key: key,
          title_fa: row.title_fa || null,
          title_en: row.title_en || null,
          body_fa: row.body_fa || null,
          body_en: row.body_en || null,
          image_url: row.image_url || null,
          extra: row.extra ?? {},
        },
      });
      toast.success(t("admin.common.saved"));
    } catch {
      toast.error(t("admin.common.error"));
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader title={t("admin.content.title")} subtitle={t("admin.content.subtitle")} />

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("admin.common.loading")}</p>
      ) : (
        <Tabs defaultValue="about">
          <TabsList className="flex-wrap h-auto">
            {PAGES.map((p) => (
              <TabsTrigger key={p} value={p}>{t(`admin.content.${p}`)}</TabsTrigger>
            ))}
          </TabsList>

          {PAGES.map((p) => {
            const row = rows[p];
            const extra = (row?.extra ?? {}) as Record<string, string>;
            return (
              <TabsContent key={p} value={p}>
                <Card className="glass-card border border-black/15 p-4 md:p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>{t("admin.content.titleFa")}</Label>
                      <Input className="border-black/15" value={row?.title_fa ?? ""} onChange={(e) => update(p, { title_fa: e.target.value })} />
                    </div>
                    <div>
                      <Label>{t("admin.content.titleEn")}</Label>
                      <Input dir="ltr" className="border-black/15" value={row?.title_en ?? ""} onChange={(e) => update(p, { title_en: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>{t("admin.content.bodyFa")}</Label>
                    <Textarea rows={8} className="border-black/15" value={row?.body_fa ?? ""} onChange={(e) => update(p, { body_fa: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("admin.content.bodyEn")}</Label>
                    <Textarea dir="ltr" rows={8} className="border-black/15" value={row?.body_en ?? ""} onChange={(e) => update(p, { body_en: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("admin.content.image")}</Label>
                    <Input dir="ltr" className="border-black/15" value={row?.image_url ?? ""} onChange={(e) => update(p, { image_url: e.target.value })} />
                  </div>

                  {p === "contact" && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label>{t("admin.content.contactEmail")}</Label>
                        <Input
                          dir="ltr"
                          className="border-black/15"
                          value={extra.email ?? ""}
                          onChange={(e) => update(p, { extra: { ...extra, email: e.target.value } })}
                        />
                      </div>
                      <div>
                        <Label>{t("admin.content.contactPhone")}</Label>
                        <Input
                          dir="ltr"
                          className="border-black/15"
                          value={extra.phone ?? ""}
                          onChange={(e) => update(p, { extra: { ...extra, phone: e.target.value } })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>{t("admin.content.contactExtra")}</Label>
                        <Textarea
                          className="border-black/15"
                          value={extra.note ?? ""}
                          onChange={(e) => update(p, { extra: { ...extra, note: e.target.value } })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      className="gradient-gold text-primary-foreground"
                      disabled={saving === p}
                      onClick={() => save(p)}
                    >
                      {t("admin.common.save")}
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </AdminLayout>
  );
};

export default AdminContent;
