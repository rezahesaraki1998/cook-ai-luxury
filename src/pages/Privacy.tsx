import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useLanguage } from "@/i18n/LanguageContext";

const Privacy = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <>
      <SEO title={t("privacy.seoTitle")} description={t("privacy.seoDesc")} path="/privacy" />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8 group"
        >
          <BackIcon className="w-4 h-4 me-2" />
          {t("common.back")}
        </Button>

        <div className="glass-card rounded-2xl p-8 md:p-12 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">{t("privacy.title")}</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {(["s1", "s2", "s3", "s4"] as const).map((key) => (
              <section className="space-y-4" key={key}>
                <h2 className="text-2xl font-bold text-foreground">{t(`privacy.${key}t`)}</h2>
                <p className="text-muted-foreground leading-relaxed">{t(`privacy.${key}b`)}</p>
              </section>
            ))}

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">{t("privacy.s5t")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy.s5b_before")}
                <a href="mailto:rezahesaraki1998@gmail.com" className="text-primary hover:underline" dir="ltr">
                  rezahesaraki1998@gmail.com
                </a>
                {t("privacy.s5b_after")}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Privacy;
