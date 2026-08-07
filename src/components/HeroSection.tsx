import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Sparkles, ChefHat, Loader2, Heart, LogIn, ImageIcon, Flame, Beef, Wheat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const FREE_RECIPE_LIMIT = 2;
const STORAGE_KEY = 'free_recipe_count';

const HeroSection = () => {
  const [prompt, setPrompt] = useState("");
  const [recipe, setRecipe] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [freeRecipesUsed, setFreeRecipesUsed] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [foodImage, setFoodImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [nutritionInfo, setNutritionInfo] = useState<{calories: number; protein: number; carbs: number} | null>(null);
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
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkAdminStatus(session.user.id), 0);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const remainingFreeRecipes = FREE_RECIPE_LIMIT - freeRecipesUsed;

  const hasUnlimitedAccess = user && isAdmin;

  const handleGenerateRecipe = async () => {
    if (!prompt.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً نام غذا یا مواد مورد نیاز را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    // Recipe generation requires an authenticated account
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      toast({
        title: "ورود لازم است",
        description: "برای دریافت دستور پخت ابتدا وارد حساب کاربری خود شوید",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }


    setIsLoading(true);
    setFoodImage(null);
    setIsImageLoading(true);
    setNutritionInfo(null);
    
    try {
      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders = session?.access_token 
        ? { Authorization: `Bearer ${session.access_token}` } 
        : {};

      // Start all requests in parallel
      const [recipeResponse, imageResponse, nutritionResponse] = await Promise.allSettled([
        supabase.functions.invoke('recipe-ai', { 
          body: { prompt },
          headers: authHeaders
        }),
        supabase.functions.invoke('generate-food-image', { body: { foodName: prompt }, headers: authHeaders }),
        supabase.functions.invoke('get-nutrition-info', { body: { foodName: prompt }, headers: authHeaders })

      ]);

      // Handle recipe response
      if (recipeResponse.status === 'fulfilled' && !recipeResponse.value.error) {
        setRecipe(recipeResponse.value.data.recipe);
        setIsSaved(false);
        
        // Increment free recipe count for non-logged-in users
        if (!user) {
          const newCount = freeRecipesUsed + 1;
          setFreeRecipesUsed(newCount);
          localStorage.setItem(STORAGE_KEY, newCount.toString());
        }
      } else {
        throw new Error('Failed to generate recipe');
      }

      // Handle image response
      if (imageResponse.status === 'fulfilled' && !imageResponse.value.error && imageResponse.value.data?.imageUrl) {
        setFoodImage(imageResponse.value.data.imageUrl);
      } else {
        console.log('Image generation failed or returned no image');
      }

      // Handle nutrition response
      if (nutritionResponse.status === 'fulfilled' && !nutritionResponse.value.error && nutritionResponse.value.data) {
        setNutritionInfo(nutritionResponse.value.data);
      } else {
        console.log('Nutrition info failed or returned no data');
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
      setIsImageLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!user) {
      toast({
        title: "غیرفعال",
        description: "ذخیره دستور پخت فعلاً غیرفعال است",
      });
      return;
    }

    setIsSaving(true);
    try {
      const recipeName = recipe.split('## ')[1]?.split('\n')[0] || prompt;
      
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        recipe_name: recipeName,
        recipe_data: { content: recipe, prompt }
      });

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: "ذخیره شد",
        description: "دستور پخت به علاقه‌مندی‌های شما اضافه شد",
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "خطا",
        description: "مشکلی در ذخیره دستور پخت پیش آمد",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

          {/* Free Recipe Counter - Only show for non-admin users */}
          {!hasUnlimitedAccess && !user && (
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

          {/* Unlimited Badge - Show for admin users */}
          {hasUnlimitedAccess && (
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                حساب نامحدود - دسترسی کامل
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
                  aria-label="جستجوی صوتی"
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
                {/* Header with Image */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-6 md:mb-8 border-b border-primary/20 pb-6 md:pb-8">
                  {/* Food Image with Nutrition Info */}
                  <div className="w-full md:w-80 flex-shrink-0 space-y-4">
                    <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-muted/30">
                      {isImageLoading ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <div className="text-center space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                            <p className="text-sm text-muted-foreground">در حال ساخت تصویر...</p>
                          </div>
                        </div>
                      ) : foodImage ? (
                        <img 
                          src={foodImage} 
                          alt={recipe.split('## ')[1]?.split('\n')[0] || 'تصویر غذا'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <div className="text-center space-y-2">
                            <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                            <p className="text-sm text-muted-foreground">تصویر موجود نیست</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Nutrition Info */}
                    {nutritionInfo && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="glass-card rounded-lg p-3 text-center border border-orange-500/20 bg-orange-500/5">
                          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                          <p className="text-lg font-bold text-foreground">{nutritionInfo.calories}</p>
                          <p className="text-xs text-muted-foreground">کالری</p>
                        </div>
                        <div className="glass-card rounded-lg p-3 text-center border border-red-500/20 bg-red-500/5">
                          <Beef className="w-5 h-5 text-red-500 mx-auto mb-1" />
                          <p className="text-lg font-bold text-foreground">{nutritionInfo.protein}g</p>
                          <p className="text-xs text-muted-foreground">پروتئین</p>
                        </div>
                        <div className="glass-card rounded-lg p-3 text-center border border-amber-500/20 bg-amber-500/5">
                          <Wheat className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                          <p className="text-lg font-bold text-foreground">{nutritionInfo.carbs}g</p>
                          <p className="text-xs text-muted-foreground">کربوهیدرات</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Title and Save Button */}
                  <div className="flex-1 flex flex-col justify-between">
                    <h2 className="text-xl md:text-3xl font-bold text-foreground flex items-center gap-2 md:gap-3">
                      <ChefHat className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                      {recipe.split('## ')[1]?.split('\n')[0] || 'دستور پخت'}
                    </h2>
                    <Button
                      variant={isSaved ? "default" : "outline"}
                      size="lg"
                      onClick={handleSaveRecipe}
                      disabled={isSaving || isSaved}
                      className={`gap-2 mt-4 w-full md:w-auto ${isSaved ? 'gradient-gold text-primary-foreground' : 'border-primary/30 hover:bg-primary/10'}`}
                    >
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isSaved ? (
                        <Heart className="w-5 h-5 fill-current" />
                      ) : user ? (
                        <Heart className="w-5 h-5" />
                      ) : (
                        <LogIn className="w-5 h-5" />
                      )}
                      {isSaving ? 'در حال ذخیره...' : isSaved ? 'ذخیره شد' : user ? 'ذخیره در علاقه‌مندی‌ها' : 'ورود و ذخیره'}
                    </Button>
                  </div>
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
