import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10" aria-label="تم روشن">
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
      aria-label={theme === "dark" ? "تم روشن" : "تم تاریک"}
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
