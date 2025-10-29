import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RecipePreview from "@/components/RecipePreview";
import SmartSuggestions from "@/components/SmartSuggestions";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <RecipePreview />
        <SmartSuggestions />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
