import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, Menu, User, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "./ThemeToggle";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [openSearch, setOpenSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-gold smooth-transition group-hover:scale-110">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient-gold">CookAI</span>
              <span className="text-xs text-muted-foreground">کوک‌اِی‌آی</span>
            </div>
          </a>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-foreground hover:text-primary smooth-transition">خانه</a>
            <a href="/#recipes" className="text-foreground hover:text-primary smooth-transition">محبوب‌ترین دستورها</a>
            <a href="/why-us" className="text-foreground hover:text-primary smooth-transition">چرا ما</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenSearch(true)}
              className="w-10 h-10 hover:bg-primary/10 smooth-transition"
            >
              <Search className="h-5 w-5 text-foreground hover:text-primary smooth-transition" />
            </Button>
            <ThemeToggle />
            {user ? (
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
              >
                <User className="w-4 h-4 ml-2" />
                پروفایل من
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="gradient-gold text-primary-foreground shadow-gold hover:shadow-warm smooth-transition hover:scale-105"
              >
                ورود / ثبت‌نام
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Search Dialog */}
      <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
        <CommandInput placeholder="جستجوی دستور غذا..." />
        <CommandList>
          <CommandEmpty>نتیجه‌ای یافت نشد.</CommandEmpty>
          <CommandGroup heading="پیشنهادات">
            <CommandItem onSelect={() => { setOpenSearch(false); navigate('/#recipes'); }}>
              غذای سریع برای دو نفر
            </CommandItem>
            <CommandItem onSelect={() => { setOpenSearch(false); navigate('/#recipes'); }}>
              خوراک رژیمی ایرانی
            </CommandItem>
            <CommandItem onSelect={() => { setOpenSearch(false); navigate('/#recipes'); }}>
              غذای مخصوص مهمان
            </CommandItem>
            <CommandItem onSelect={() => { setOpenSearch(false); navigate('/#recipes'); }}>
              دسر ساده با میوه
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};

export default Header;