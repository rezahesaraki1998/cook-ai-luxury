import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RecipePreview from "@/components/RecipePreview";
import SmartSuggestions from "@/components/SmartSuggestions";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useLanguage } from "@/i18n/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <section aria-label={t("seo.samplePreview")}>
            <RecipePreview />
          </section>
          <section aria-label={t("seo.smartSuggestions")}>
            <SmartSuggestions />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
