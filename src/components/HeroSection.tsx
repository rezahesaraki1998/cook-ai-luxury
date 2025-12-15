import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Sparkles, ChefHat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const FREE_RECIPE_LIMIT = 7;
const STORAGE_KEY = 'free_recipe_count';

const HeroSection = () => {
  const [prompt, setPrompt] = useState("");
  const [recipe, setRecipe] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [freeRecipesUsed, setFreeRecipesUsed] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load free recipe count from localStorage
    const storedCount = localStorage.getItem(STORAGE_KEY);
    if (storedCount) {
      setFreeRecipesUsed(parseInt(storedCount, 10));
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const remainingFreeRecipes = FREE_RECIPE_LIMIT - freeRecipesUsed;

  const handleGenerateRecipe = async () => {
    // Check if user has free recipes left or is logged in
    if (!user && freeRecipesUsed >= FREE_RECIPE_LIMIT) {
      toast({
        title: "محدودیت رایگان",
        description: "شما ۷ دستور پخت رایگان خود را استفاده کرده‌اید. برای ادامه وارد شوید یا ثبت‌نام کنید.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً نام غذا یا مواد مورد نیاز را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recipe-ai', {
        body: { prompt }
      });

      if (error) throw error;

      setRecipe(data.recipe);
      
      // Increment free recipe count for non-logged-in users
      if (!user) {
        const newCount = freeRecipesUsed + 1;
        setFreeRecipesUsed(newCount);
        localStorage.setItem(STORAGE_KEY, newCount.toString());
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: "خطا",
        description: "مشکلی در ایجاد دستور پخت پیش آمد. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20 pb-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 md:right-20 w-40 md:w-64 h-40 md:h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 md:left-20 w-48 md:w-80 h-48 md:h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl animate-glow-pulse"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-8 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary animate-glow-pulse" />
            <span className="text-xs md:text-sm text-muted-foreground">دستیار هوشمند آشپزی با هوش مصنوعی</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
            <span className="text-foreground">فقط بگو</span>
            <br />
            <span className="text-gradient-gold">چی می‌خوای بپزی!</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
            هوش مصنوعی در لحظه دستور پخت، مواد لازم و مراحل دقیق آشپزی رو برات آماده می‌کنه
          </p>

          {/* Free Recipe Counter - Only show for non-logged-in users */}
          {!user && (
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
              <span className="text-sm text-muted-foreground">
                {remainingFreeRecipes > 0 ? (
                  <>
                    <span className="font-bold text-primary">{remainingFreeRecipes}</span> دستور پخت رایگان باقی‌مانده
                  </>
                ) : (
                  <span className="text-destructive">محدودیت رایگان تمام شد - برای ادامه وارد شوید</span>
                )}
              </span>
            </div>
          )}

          {/* Input Section */}
          <div className="max-w-2xl mx-auto space-y-3 md:space-y-4 px-2 md:px-0">
            <div className="relative glass-card p-1.5 md:p-2 rounded-xl md:rounded-2xl border-2 border-black/15 dark:border-primary/20 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-gold bg-card backdrop-blur-xl">
              <div className="flex items-center gap-2 md:gap-3">
                <Input
                  placeholder="مثلاً: قرمه سبزی می‌خوام درست کنم..."
                  className="flex-1 bg-transparent border-0 text-sm md:text-lg focus-visible:ring-0 placeholder:text-muted-foreground/60"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateRecipe()}
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl hover:bg-primary/10 smooth-transition"
                  disabled
                >
                  <Mic className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </Button>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full gradient-gold text-primary-foreground text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-gold hover:shadow-warm smooth-transition hover:scale-105 group"
              onClick={handleGenerateRecipe}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 ml-2 animate-spin" />
                  در حال ایجاد...
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:rotate-12 smooth-transition" />
                  دستور پخت منو بساز
                </>
              )}
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 pt-2 md:pt-4 px-2">
            <span className="text-xs md:text-sm text-muted-foreground w-full md:w-auto text-center mb-1 md:mb-0">پیشنهادات:</span>
            {["قرمه سبزی", "کباب کوبیده", "فسنجان", "کوکو سبزی"].map((item) => (
              <button
                key={item}
                className="px-3 md:px-4 py-1.5 md:py-2 rounded-full border-2 border-black/15 dark:border-border/50 text-xs md:text-sm hover:border-primary/50 hover:bg-primary/5 smooth-transition"
                onClick={() => {
                  setPrompt(item);
                  handleGenerateRecipe();
                }}
                disabled={isLoading}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Recipe Results */}
          {recipe && (
            <div className="mt-8 md:mt-12 animate-slide-up text-right">
              <div className="glass-card rounded-xl md:rounded-2xl border-2 border-primary/20 shadow-gold p-4 md:p-8">
                <div className="border-b border-primary/20 pb-4 md:pb-6 mb-6 md:mb-8">
                  <h2 className="text-xl md:text-3xl font-bold text-foreground flex items-center gap-2 md:gap-3">
                    <ChefHat className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    {recipe.split('## ')[1]?.split('\n')[0] || 'دستور پخت'}
                  </h2>
                </div>
                
                <div className="space-y-6 md:space-y-8">
                  {recipe.split('## ').slice(2).map((section, index) => {
                    if (!section.trim()) return null;
                    
                    const [title, ...content] = section.split('\n');
                    const sectionContent = content.filter(line => line.trim()).join('\n').trim();
                    
                    if (!sectionContent) return null;
                    
                    const sectionTitle = title.trim();
                    
                    return (
                      <div key={index} className="space-y-3 md:space-y-4">
                        <div className="flex items-center gap-2 border-b-2 border-primary/20 pb-2 md:pb-3">
                          <h3 className="text-lg md:text-2xl font-bold text-primary">{sectionTitle}</h3>
                        </div>
                        <div className="glass-card rounded-lg md:rounded-xl p-4 md:p-6 border border-primary/10">
                          {sectionTitle === 'مواد لازم' ? (
                            <ul className="space-y-2 md:space-y-3">
                              {sectionContent.split('\n').map((item, i) => (
                                <li key={i} className="flex items-start gap-2 md:gap-3 text-foreground">
                                  <span className="text-primary mt-0.5 md:mt-1 text-base md:text-lg">●</span>
                                  <span className="leading-relaxed text-sm md:text-lg">{item.replace(/^-\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          ) : sectionTitle === 'مراحل پخت' ? (
                            <ol className="space-y-3 md:space-y-4">
                              {sectionContent.split('\n').filter(line => line.match(/^\d+\./)).map((step, i) => (
                                <li key={i} className="flex items-start gap-3 md:gap-4">
                                  <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm font-bold">
                                    {i + 1}
                                  </span>
                                  <span className="leading-relaxed text-foreground pt-0.5 md:pt-1 text-sm md:text-lg">{step.replace(/^\d+\.\s*/, '')}</span>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <ul className="space-y-2 md:space-y-3">
                              {sectionContent.split('\n').map((item, i) => (
                                <li key={i} className="flex items-start gap-2 md:gap-3 text-foreground">
                                  <span className="text-primary mt-0.5 md:mt-1 text-base md:text-lg">✓</span>
                                  <span className="leading-relaxed text-sm md:text-lg">{item.replace(/^-\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
