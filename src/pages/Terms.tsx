import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useLanguage } from "@/i18n/LanguageContext";

const Terms = () => {
  const navigate = useNavigate();
  const { t, tr, isRTL } = useLanguage();
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;
  const terms = tr.terms;

  const numberedSections = [
    { title: terms.s2t, items: terms.s2items },
    { title: terms.s3t, items: terms.s3items },
    { title: terms.s4t, items: terms.s4items },
    { title: terms.s5t, items: terms.s5items },
    { title: terms.s6t, items: terms.s6items },
    { title: terms.s7t, items: terms.s7items },
    { title: terms.s8t, items: terms.s8items },
  ];

  return (
    <>
      <SEO title={t("terms.seoTitle")} description={t("terms.seoDesc")} path="/terms" />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 group"
        >
          <BackIcon className="w-4 h-4 me-2" />
          {t("common.back")}
        </Button>

        <div className="glass-card rounded-2xl p-8 md:p-12 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">{terms.title}</h1>
            <p className="text-muted-foreground">{terms.intro}</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">{terms.s1t}</h2>
              <p className="text-muted-foreground leading-relaxed">{terms.s1lead}</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                {terms.s1items.map((item) => (
                  <li key={item.label}>
                    <strong className="text-foreground">{item.label}</strong> {item.text}
                  </li>
                ))}
              </ul>
            </section>

            {numberedSections.map((section) => (
              <section className="space-y-4" key={section.title}>
                <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground ms-4">
                  {section.items.map((item, index) => (
                    <li className="leading-relaxed" key={index}>{item}</li>
                  ))}
                </ol>
              </section>
            ))}

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">{terms.s9t}</h2>
              <p className="text-muted-foreground leading-relaxed">{terms.s9b}</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">{terms.s10t}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {terms.s10b_before}
                <a href="mailto:rezahesaraki1998@gmail.com" className="text-primary hover:underline" dir="ltr">
                  rezahesaraki1998@gmail.com
                </a>
                {terms.s10b_after}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Terms;
