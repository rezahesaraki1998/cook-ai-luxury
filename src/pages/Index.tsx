import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RecipePreview from "@/components/RecipePreview";
import SmartSuggestions from "@/components/SmartSuggestions";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <>
      <SEO />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <section aria-label="نمونه دستور پخت">
            <RecipePreview />
          </section>
          <section aria-label="پیشنهادات هوشمند">
            <SmartSuggestions />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
