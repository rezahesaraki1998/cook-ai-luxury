import { Languages } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { LOCALES } from "@/i18n/translations";

const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("nav.changeLanguage")}
      dir="ltr"
      className={`inline-flex items-center gap-1 rounded-full border border-primary/20 bg-background/60 p-1 ${className}`}
    >
      <Languages className="w-3.5 h-3.5 text-muted-foreground mx-1 hidden sm:block" aria-hidden="true" />
      {LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLocale(item.code)}
          aria-pressed={locale === item.code}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold smooth-transition ${
            locale === item.code
              ? "gradient-gold text-primary-foreground shadow-gold"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
