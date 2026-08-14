import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10" aria-label={t("nav.lightTheme")}>
        <Sun className="h-5 w-5" />
      </Button>

    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 hover:bg-primary/10 smooth-transition"
      aria-label={theme === "dark" ? t("nav.lightTheme") : t("nav.darkTheme")}
    >

      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-foreground hover:text-primary smooth-transition" />
      ) : (
        <Moon className="h-5 w-5 text-foreground hover:text-primary smooth-transition" />
      )}
    </Button>
  );
};

export default ThemeToggle;
