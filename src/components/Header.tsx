import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search, User, LogIn, Shield } from "lucide-react";
import logoAsset from "@/assets/cookluxury-logo.png.asset.json";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { t, tr, isRTL } = useLanguage();

  useEffect(() => {
    const checkAdmin = async (userId?: string) => {
      if (!userId) return setIsAdmin(false);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
      void checkAdmin(session?.user?.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
      void checkAdmin(session?.user?.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };


  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 xl:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5 group" aria-label={t("nav.home")}>
            <img
              src={logoAsset.url}
              alt={t("common.brandName")}
              onError={(event) => { if (!event.currentTarget.src.endsWith('/favicon.png')) event.currentTarget.src = '/favicon.png'; }}
              className="w-8 h-8 xl:w-10 xl:h-10 shrink-0 rounded-md object-contain"
            />
            <div className="flex flex-col gap-0.5">
              <span dir="ltr" className="text-base sm:text-lg xl:text-xl font-bold text-primary leading-tight whitespace-nowrap">{t("common.brandName")}</span>
              <span className="hidden sm:block text-xs text-muted-foreground leading-tight">{t("common.brandSub")}</span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden xl:flex items-center justify-center gap-1" aria-label={t("nav.menu")}>
            <Button asChild variant="ghost"><Link to="/">{t("nav.home")}</Link></Button>
            <Button asChild variant="ghost"><Link to="/popular-recipes">{t("nav.recipes")}</Link></Button>
            <Button asChild variant="ghost"><Link to="/why-us">{t("nav.whyUs")}</Link></Button>
          </nav>

          {/* CTA Buttons - Desktop */}
          <div className="hidden xl:flex shrink-0 items-center gap-1.5">

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
              <>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    title={t("admin.title")}
                    onClick={() => navigate("/admin")}
                    aria-label={t("admin.title")}
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  title={t("profile.title")}
                  onClick={() => navigate("/profile")}
                  aria-label={t("profile.title")}
                >
                  <User className="w-4 h-4" />
                </Button>
              </>
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
          <div className="flex xl:hidden shrink-0 items-center gap-0.5 sm:gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenSearch(true)}
              className="w-9 h-9 hover:bg-primary/10"
              aria-label={t("nav.search")}
            >
              <Search className="w-5 h-5" />
            </Button>

            <LanguageSwitcher className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10" aria-label={t("nav.menu")}>
                  <Menu className="w-5 h-5" />
                </Button>

              </SheetTrigger>
              <SheetContent
                side={isRTL ? "right" : "left"}
                className="w-[320px] max-w-[88vw] bg-background border-border px-5"
              >
                <SheetHeader className="text-start mb-6">
                  <SheetTitle className="text-gradient-gold text-xl">{t("nav.menu")}</SheetTitle>
                </SheetHeader>
                <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
                <nav className="flex flex-col gap-1">
                  <Button variant="ghost"
                    onClick={() => handleNavigation("/")}
                    className="justify-start h-12 text-foreground"
                  >
                    {t("nav.home")}
                  </Button>
                  <Button variant="ghost"
                    onClick={() => handleNavigation("/popular-recipes")}
                    className="justify-start h-12 text-foreground"
                  >
                    {t("nav.recipes")}
                  </Button>
                  <Button variant="ghost"
                    onClick={() => handleNavigation("/why-us")}
                    className="justify-start h-12 text-foreground"
                  >
                    {t("nav.whyUs")}
                  </Button>

                  <div className="mt-4 pt-5 border-t border-border space-y-3">

                    {isAuthed ? (
                      <>
                        {isAdmin && (
                          <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => handleNavigation("/admin")}
                          >
                            <Shield className="w-4 h-4" />
                            {t("admin.title")}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => handleNavigation("/profile")}
                        >
                          <User className="w-4 h-4" />
                          {t("profile.title")}
                        </Button>
                      </>
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
                onSelect={() => { setOpenSearch(false); navigate('/popular-recipes'); }}
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
