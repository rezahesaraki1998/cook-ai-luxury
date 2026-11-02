import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PopularFoods from "@/components/PopularFoods";
import SEO from "@/components/SEO";
import { useLanguage } from "@/i18n/LanguageContext";

const PopularRecipes = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEO
        title={t("seo.popularRecipesTitle")}
        description={t("seo.popularRecipesDesc")}
        path="/popular-recipes"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 md:pt-28">
          <PopularFoods />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PopularRecipes;
