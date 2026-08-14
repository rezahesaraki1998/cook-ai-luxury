import { Card } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";

const AboutSection = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Title */}
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-gold">
              {t("about.title")}
            </h1>

          </div>

          {/* Questions Section */}
          <Card className="glass-card p-8 border border-primary/20">
            <div className="space-y-6 text-start">
              <h2 className="text-2xl font-bold text-foreground">{t("about.questionsTitle")}</h2>
              <p className="text-lg text-foreground leading-relaxed">
                {t("about.questionsLead")}
              </p>
              <div className="space-y-4 ps-4">
                <p className="text-base text-foreground/90 leading-relaxed">{t("about.q1")}</p>
                <p className="text-base text-foreground/90 leading-relaxed">{t("about.q2")}</p>
                <p className="text-base text-foreground/90 leading-relaxed">{t("about.q3")}</p>
                <p className="text-base text-foreground/90 leading-relaxed">{t("about.q4")}</p>
              </div>
            </div>
          </Card>

          {/* Main Content */}
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-foreground">{t("about.howTitle")}</h2>
            <p className="text-xl text-foreground font-semibold leading-relaxed">
              {t("about.howLead")}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {t("about.howBody")}
            </p>
          </div>

          {/* Highlight Card */}
          <Card className="glass-card p-8 border border-primary/20 bg-primary/5 max-w-3xl mx-auto">
            <div className="space-y-4 text-center">
              <p className="text-2xl font-bold text-gradient-gold leading-relaxed">
                {t("about.highlightTitle")}
              </p>
              <p className="text-lg text-foreground/90 leading-relaxed">
                {t("about.highlightBody")}
              </p>
            </div>
          </Card>

          {/* Closing Statement */}
          <div className="text-center space-y-4 pt-6">
            <p className="text-lg text-foreground/90 leading-relaxed italic max-w-3xl mx-auto">
              {t("about.closing1")}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t("about.closing2")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
