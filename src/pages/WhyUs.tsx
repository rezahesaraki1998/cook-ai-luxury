import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import SEO from "@/components/SEO";
import { useLanguage } from "@/i18n/LanguageContext";

const WhyUs = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEO title={t("seo.whyUsTitle")} description={t("seo.whyUsDesc")} path="/why-us" />
      <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <AboutSection />
      </main>
      <Footer />
    </div>
    </>
  );
};

export default WhyUs;
