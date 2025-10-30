import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Sparkles, ChefHat } from "lucide-react";

const HeroSection = () => {
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
            <div className="relative glass-card p-2 rounded-2xl border-2 border-border dark:border-primary/20 shadow-[0_12px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-gold bg-card backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="مثلاً: قرمه سبزی می‌خوام درست کنم..."
                  className="flex-1 bg-transparent border-0 text-lg focus-visible:ring-0 placeholder:text-muted-foreground/60"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-12 h-12 rounded-xl hover:bg-primary/10 smooth-transition"
                >
                  <Mic className="w-5 h-5 text-primary" />
                </Button>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full md:w-auto gradient-gold text-primary-foreground text-lg px-8 py-6 shadow-gold hover:shadow-warm smooth-transition hover:scale-105 group"
            >
              <ChefHat className="w-5 h-5 ml-2 group-hover:rotate-12 smooth-transition" />
              دستور پخت منو بساز
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <span className="text-sm text-muted-foreground">پیشنهادات:</span>
            {["قرمه سبزی", "کباب کوبیده", "فسنجان", "کوکو سبزی"].map((item) => (
              <button
                key={item}
                className="px-4 py-2 rounded-full border border-border/50 text-sm hover:border-primary/50 hover:bg-primary/5 smooth-transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
