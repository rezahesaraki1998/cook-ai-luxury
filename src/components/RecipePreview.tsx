import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Flame, Users, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { previewRecipes } from "@/data/previewRecipes";

const RecipePreview = () => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [recipeIndex, setRecipeIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, locale, n } = useLanguage();

  const localizedRecipes = previewRecipes[locale];
  const recipeData = localizedRecipes[recipeIndex] ?? localizedRecipes[0];
  const recipeRef = useRef(recipeData);
  recipeRef.current = recipeData;

  useEffect(() => {
    // Select random recipe on mount
    setRecipeIndex(Math.floor(Math.random() * previewRecipes.fa.length));

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkIfFavorite(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await checkIfFavorite(session.user.id);
    }
  };

  const checkIfFavorite = async (userId: string) => {
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("recipe_name", recipeRef.current.name)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: t("preview.toastLoginTitle"),
        description: t("preview.toastLoginDesc"),
      });
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_name", recipeData.name);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: t("preview.toastRemovedTitle"),
          description: t("preview.toastRemovedDesc"),
        });
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          recipe_name: recipeData.name,
          recipe_data: recipeData,
        });

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: t("preview.toastSavedTitle"),
          description: t("preview.toastSavedDesc"),
        });
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="recipes" className="py-12 md:py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="text-gradient-gold">{t("preview.title")}</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg px-4">
              {t("preview.subtitle")}
            </p>
          </div>

          {/* Recipe Card */}
          <Card className="glass-card p-4 md:p-6 lg:p-8 border border-primary/20 shadow-elevation overflow-hidden">
            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
              {/* Recipe Image */}
              <div
                role="img"
                aria-label={t("preview.sampleImageAlt", { name: recipeData.name })}
                className="relative rounded-xl md:rounded-2xl overflow-hidden aspect-video md:aspect-square bg-gradient-to-br from-primary/20 to-secondary/20"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2 md:space-y-4">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full gradient-gold mx-auto flex items-center justify-center animate-glow-pulse">
                      <Flame className="w-7 h-7 md:w-10 md:h-10 text-primary-foreground" />
                    </div>
                    <p className="text-xs md:text-base text-muted-foreground">{t("preview.aiImage")}</p>
                  </div>
                </div>
              </div>

              {/* Recipe Details */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">{recipeData.name}</h3>
                  <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      <span>{recipeData.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      <span>{recipeData.servings}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Flame className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      <span>{recipeData.difficulty}</span>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="glass-card p-3 md:p-4 rounded-lg md:rounded-xl border border-primary/10">
                  <h4 className="font-semibold text-primary mb-2 md:mb-3 text-sm md:text-base">
                    {t("preview.ingredientsFor", { servings: recipeData.servings })}
                  </h4>
                  <ul className="space-y-1.5 md:space-y-2.5 text-xs md:text-sm text-foreground/90">
                    {recipeData.ingredients.slice(0, 5).map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-1.5 md:gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          <strong>{ingredient.name}:</strong> {ingredient.amount}
                        </span>
                      </li>
                    ))}
                    {recipeData.ingredients.length > 5 && (
                      <li className="text-primary text-xs md:text-sm">
                        {t("preview.moreIngredients", { count: n(recipeData.ingredients.length - 5) })}
                      </li>
                    )}
                  </ul>
                </div>

                {/* Nutrition Info */}
                <div className="flex gap-2 md:gap-4">
                  <div className="flex-1 glass-card p-2 md:p-3 rounded-lg md:rounded-xl text-center border border-border/50">
                    <div className="text-lg md:text-2xl font-bold text-primary">{recipeData.nutrition.calories}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{t("preview.calories")}</div>
                  </div>
                  <div className="flex-1 glass-card p-2 md:p-3 rounded-lg md:rounded-xl text-center border border-border/50">
                    <div className="text-lg md:text-2xl font-bold text-primary">{recipeData.nutrition.protein}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{t("preview.protein")}</div>
                  </div>
                  <div className="flex-1 glass-card p-2 md:p-3 rounded-lg md:rounded-xl text-center border border-border/50">
                    <div className="text-lg md:text-2xl font-bold text-primary">{recipeData.nutrition.carbs}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{t("preview.carbs")}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleToggleFavorite}
                    disabled={loading}
                    variant="outline"
                    aria-label={isFavorite ? t("preview.removeFavorite") : t("preview.addFavorite")}
                    aria-pressed={isFavorite}
                    className={`border-primary/30 hover:bg-primary/10 smooth-transition ${
                      isFavorite ? "bg-primary/10 border-primary" : ""
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 smooth-transition ${
                        isFavorite ? "fill-primary text-primary" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </div>

            {/* Steps Preview */}
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border/50">
              <h4 className="font-semibold text-base md:text-lg mb-3 md:mb-4">{t("preview.steps")}</h4>
              <div className="space-y-2 md:space-y-3">
                {recipeData.steps.map((step, index) => (
                  <div key={index} className="flex gap-2 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                      <span className="text-xs md:text-sm font-bold text-primary-foreground">{n(index + 1)}</span>
                    </div>
                    <p className="text-foreground/90 pt-0.5 md:pt-1 text-xs md:text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RecipePreview;
