import { Button } from "@/components/ui/button";
import { ChefHat, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-gold smooth-transition group-hover:scale-110">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient-gold">CookAI</span>
              <span className="text-xs text-muted-foreground">کوک‌اِی‌آی</span>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-foreground hover:text-primary smooth-transition">خانه</a>
            <a href="#recipes" className="text-foreground hover:text-primary smooth-transition">محبوب‌ترین دستورها</a>
            <a href="#about" className="text-foreground hover:text-primary smooth-transition">درباره ما</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              ورود
            </Button>
            <Button className="gradient-gold text-primary-foreground shadow-gold hover:shadow-warm smooth-transition hover:scale-105">
              شروع آشپزی
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
