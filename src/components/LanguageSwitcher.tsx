import { Languages } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { LOCALES } from "@/i18n/translations";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("nav.changeLanguage")}
      dir="ltr"
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-md border border-border bg-background p-0.5 ${className}`}
    >
      <Languages className="w-3.5 h-3.5 text-muted-foreground mx-1 hidden 2xl:block" aria-hidden="true" />
      {LOCALES.map((item) => (
        <Button variant="ghost" size="sm"
          key={item.code}
          type="button"
          onClick={() => setLocale(item.code)}
          aria-pressed={locale === item.code}
          className={`h-8 w-9 p-0 text-xs font-semibold smooth-transition ${
            locale === item.code
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
