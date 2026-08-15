import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, Menu, Search, User, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();
  const { t, tr, isRTL } = useLanguage();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setIsAuthed(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };


  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group cursor-pointer">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl gradient-gold flex items-center justify-center shadow-gold smooth-transition group-hover:scale-110">
              <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-gradient-gold">{t("common.brandName")}</span>
              <span className="text-[10px] md:text-xs text-muted-foreground">{t("common.brandSub")}</span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-foreground hover:text-primary smooth-transition">{t("nav.home")}</a>
            <a href="/#recipes" className="text-foreground hover:text-primary smooth-transition">{t("nav.recipes")}</a>
            <a href="/why-us" className="text-foreground hover:text-primary smooth-transition">{t("nav.whyUs")}</a>
          </nav>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenSearch(true)}
              className="w-10 h-10 hover:bg-primary/10 smooth-transition"
              aria-label={t("nav.search")}
            >
              <Search className="h-5 w-5 text-foreground hover:text-primary smooth-transition" />
            </Button>

            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthed ? (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/profile")}
                aria-label={t("profile.title")}
              >
                <User className="w-4 h-4" />
                {t("profile.title")}
              </Button>
            ) : (
              <Button
                className="gap-2 gradient-gold text-primary-foreground shadow-gold hover:shadow-warm smooth-transition"
                onClick={() => navigate("/auth")}
                aria-label={t("auth.login")}
              >
                <LogIn className="w-4 h-4" />
                {t("auth.login")}
              </Button>
            )}
          </div>


          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenSearch(true)}
              className="w-9 h-9 hover:bg-primary/10"
              aria-label={t("nav.search")}
            >
              <Search className="w-5 h-5" />
            </Button>

            <LanguageSwitcher />
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9" aria-label={t("nav.menu")}>
                  <Menu className="w-5 h-5" />
                </Button>

              </SheetTrigger>
              <SheetContent
                side={isRTL ? "right" : "left"}
                className="w-[280px] glass-card border-primary/20"
              >
                <SheetHeader className="text-start mb-6">
                  <SheetTitle className="text-gradient-gold text-xl">{t("nav.menu")}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                  <button
                    onClick={() => handleNavigation("/")}
                    className="text-start text-foreground hover:text-primary smooth-transition py-2 border-b border-border/30"
                  >
                    {t("nav.home")}
                  </button>
                  <button
                    onClick={() => handleNavigation("/#recipes")}
                    className="text-start text-foreground hover:text-primary smooth-transition py-2 border-b border-border/30"
                  >
                    {t("nav.recipes")}
                  </button>
                  <button
                    onClick={() => handleNavigation("/why-us")}
                    className="text-start text-foreground hover:text-primary smooth-transition py-2 border-b border-border/30"
                  >
                    {t("nav.whyUs")}
                  </button>

                  <div className="pt-4 space-y-3">
                    {isAuthed ? (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => handleNavigation("/profile")}
                      >
                        <User className="w-4 h-4" />
                        {t("profile.title")}
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full gap-2 gradient-gold text-primary-foreground shadow-gold"
                          onClick={() => handleNavigation("/auth")}
                        >
                          <LogIn className="w-4 h-4" />
                          {t("auth.login")}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleNavigation("/auth")}
                        >
                          {t("auth.signup")}
                        </Button>
                      </>
                    )}
                  </div>
                </nav>

              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
        <CommandInput placeholder={t("nav.searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("nav.noResults")}</CommandEmpty>
          <CommandGroup heading={t("nav.suggestions")}>
            {tr.suggestions.items.map((item) => (
              <CommandItem
                key={item.title}
                onSelect={() => { setOpenSearch(false); navigate('/#recipes'); }}
              >
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};

export default Header;
