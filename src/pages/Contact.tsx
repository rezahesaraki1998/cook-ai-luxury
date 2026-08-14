import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useLanguage } from "@/i18n/LanguageContext";

const Contact = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <>
      <SEO title={t("contact.seoTitle")} description={t("contact.seoDesc")} path="/contact" />
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
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">{t("contact.title")}</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">{t("contact.aboutTitle")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("contact.aboutBody")}
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">{t("contact.channels")}</h2>
              <a
                href="https://wa.me/989101563977"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-black/15 hover:border-black/30 hover:bg-primary/5 smooth-transition"
              >
                <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t("contact.whatsapp")}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">+98 910 156 3977</p>
                </div>
              </a>

              <a
                href="mailto:rezahesaraki1998@gmail.com"
                className="flex items-center gap-4 p-4 rounded-xl border border-black/15 hover:border-black/30 hover:bg-primary/5 smooth-transition"
              >
                <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t("contact.email")}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">rezahesaraki1998@gmail.com</p>
                </div>
              </a>
            </section>

            <section className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t("contact.note")}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Contact;
