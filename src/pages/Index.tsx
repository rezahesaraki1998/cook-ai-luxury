import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RecipePreview from "@/components/RecipePreview";
import SmartSuggestions from "@/components/SmartSuggestions";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <RecipePreview />
        <SmartSuggestions />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
