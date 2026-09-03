import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/i18n/LanguageContext";
import { RANGE_KEYS, type RangeKey, formatNumber } from "@/lib/adminUtils";

export const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gradient-gold">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon?: LucideIcon;
}) => {
  const { locale } = useLanguage();
  return (
    <Card className="glass-card border border-black/15 p-4 flex items-center gap-3 smooth-transition hover:shadow-gold">
      {Icon && (
        <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-bold">
          {typeof value === "number" ? formatNumber(value, locale) : value}
        </p>
      </div>
    </Card>
  );
};

export const StatusBadge = ({ status }: { status: string | null }) => {
  const { t } = useLanguage();
  if (!status) return <span className="text-muted-foreground">{t("admin.common.none")}</span>;
  const map: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    expired: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    canceled: "bg-destructive/15 text-destructive border-destructive/30",
    inactive: "bg-muted text-muted-foreground border-border",
    premium: "gradient-gold text-primary-foreground border-transparent",
    free: "bg-muted text-muted-foreground border-border",
  };
  const labels: Record<string, string> = {
    active: t("admin.common.active"),
    inactive: t("admin.common.inactive"),
    expired: t("admin.subs.expired"),
    canceled: t("admin.subs.canceled"),
    premium: t("admin.users.premium"),
    free: t("admin.users.free"),
  };
  return (
    <Badge variant="outline" className={`border ${map[status] ?? ""}`}>
      {labels[status] ?? status}
    </Badge>
  );
};

export interface RangeState {
  key: RangeKey;
  from?: string;
  to?: string;
}

export const RangeControls = ({
  value,
  onChange,
  granularity,
  onGranularityChange,
}: {
  value: RangeState;
  onChange: (next: RangeState) => void;
  granularity?: "day" | "week" | "month";
  onGranularityChange?: (g: "day" | "week" | "month") => void;
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-[170px]">
        <Label className="text-xs text-muted-foreground">{t("admin.common.filter")}</Label>
        <Select value={value.key} onValueChange={(k) => onChange({ ...value, key: k as RangeKey })}>
          <SelectTrigger className="border-black/15"><SelectValue /></SelectTrigger>
          <SelectContent>
            {RANGE_KEYS.map((k) => (
              <SelectItem key={k} value={k}>{t(`admin.ranges.${k}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.key === "custom" && (
        <>
          <div>
            <Label className="text-xs text-muted-foreground">{t("admin.common.from")}</Label>
            <Input
              type="date"
              className="border-black/15"
              value={value.from ?? ""}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t("admin.common.to")}</Label>
            <Input
              type="date"
              className="border-black/15"
              value={value.to ?? ""}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
            />
          </div>
        </>
      )}

      {granularity && onGranularityChange && (
        <div className="w-[140px]">
          <Label className="text-xs text-muted-foreground">{t("admin.granularity.label")}</Label>
          <Select value={granularity} onValueChange={(g) => onGranularityChange(g as "day" | "week" | "month")}>
            <SelectTrigger className="border-black/15"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t("admin.granularity.daily")}</SelectItem>
              <SelectItem value="week">{t("admin.granularity.weekly")}</SelectItem>
              <SelectItem value="month">{t("admin.granularity.monthly")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export const EmptyState = () => {
  const { t } = useLanguage();
  return <p className="text-sm text-muted-foreground py-8 text-center">{t("admin.common.noData")}</p>;
};
