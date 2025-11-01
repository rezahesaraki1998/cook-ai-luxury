import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Sparkles, ChefHat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const HeroSection = () => {
  const [prompt, setPrompt] = useState("");
  const [recipe, setRecipe] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleGenerateRecipe = async () => {
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
      setShowDialog(true);
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-glow-pulse"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary animate-glow-pulse" />
            <span className="text-sm text-muted-foreground">دستیار هوشمند آشپزی با هوش مصنوعی</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-foreground">فقط بگو</span>
            <br />
            <span className="text-gradient-gold">چی می‌خوای بپزی!</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            هوش مصنوعی در لحظه دستور پخت، مواد لازم و مراحل دقیق آشپزی رو برات آماده می‌کنه
          </p>

          {/* Input Section */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative glass-card p-2 rounded-2xl border-2 border-black/15 dark:border-primary/20 shadow-[0_12px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-gold bg-card backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="مثلاً: قرمه سبزی می‌خوام درست کنم..."
                  className="flex-1 bg-transparent border-0 text-lg focus-visible:ring-0 placeholder:text-muted-foreground/60"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateRecipe()}
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12 rounded-xl hover:bg-primary/10 smooth-transition"
                  disabled
                >
                  <Mic className="w-5 h-5 text-primary" />
                </Button>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full md:w-auto gradient-gold text-primary-foreground text-lg px-8 py-6 shadow-gold hover:shadow-warm smooth-transition hover:scale-105 group"
              onClick={handleGenerateRecipe}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  در حال ایجاد...
                </>
              ) : (
                <>
                  <ChefHat className="w-5 h-5 ml-2 group-hover:rotate-12 smooth-transition" />
                  دستور پخت منو بساز
                </>
              )}
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <span className="text-sm text-muted-foreground">پیشنهادات:</span>
            {["قرمه سبزی", "کباب کوبیده", "فسنجان", "کوکو سبزی"].map((item) => (
              <button
                key={item}
                className="px-4 py-2 rounded-full border-2 border-black/15 dark:border-border/50 text-sm hover:border-primary/50 hover:bg-primary/5 smooth-transition"
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
        </div>
      </div>

      {/* Recipe Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-3xl font-bold text-gradient-gold flex items-center gap-2">
              <ChefHat className="w-8 h-8" />
              {recipe.split('## ')[1]?.split('\n')[0] || 'دستور پخت'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {recipe.split('## ').slice(2).map((section, index) => {
              if (!section.trim()) return null;
              
              const [title, ...content] = section.split('\n');
              const sectionContent = content.filter(line => line.trim()).join('\n').trim();
              
              if (!sectionContent) return null;
              
              const sectionTitle = title.trim();
              
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-2 border-b-2 border-primary/20 pb-2">
                    <h3 className="text-xl font-bold text-primary">{sectionTitle}</h3>
                  </div>
                  <div className="glass-card rounded-xl p-5 border border-primary/10">
                    {sectionTitle === 'مواد لازم' ? (
                      <ul className="space-y-2">
                        {sectionContent.split('\n').map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-foreground">
                            <span className="text-primary mt-1">●</span>
                            <span className="leading-relaxed">{item.replace(/^-\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    ) : sectionTitle === 'مراحل پخت' ? (
                      <ol className="space-y-3">
                        {sectionContent.split('\n').filter(line => line.match(/^\d+\./)).map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed text-foreground pt-1">{step.replace(/^\d+\.\s*/, '')}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <ul className="space-y-2">
                        {sectionContent.split('\n').map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-foreground">
                            <span className="text-primary mt-1">✓</span>
                            <span className="leading-relaxed">{item.replace(/^-\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
