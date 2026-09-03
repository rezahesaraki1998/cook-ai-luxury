import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/AdminShared";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAdminAccess } from "@/hooks/useAdmin";

const AdminSettings = () => {
  const { t } = useLanguage();
  const { user } = useAdminAccess();

  return (
    <AdminLayout>
      <PageHeader title={t("admin.settings.title")} subtitle={t("admin.settings.subtitle")} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card border border-black/15 p-6 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">{t("admin.settings.language")}</Label>
            <div className="mt-2"><LanguageSwitcher /></div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t("admin.settings.theme")}</Label>
            <div className="mt-2"><ThemeToggle /></div>
          </div>
        </Card>

        <Card className="glass-card border border-black/15 p-6 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">{t("admin.settings.account")}</Label>
            <p className="font-medium mt-1" dir="ltr">{user?.email}</p>
          </div>
          <div className="flex items-start gap-3 pt-2 border-t border-border/40">
            <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">{t("admin.settings.security")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("admin.settings.securityNote")}</p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
