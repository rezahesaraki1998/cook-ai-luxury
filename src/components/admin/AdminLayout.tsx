import { ReactNode, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  CreditCard,
  Ticket,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useAdminAccess } from "@/hooks/useAdmin";
import logoAsset from "@/assets/cookluxury-logo.png.asset.json";

const NAV = [
  { to: "/admin", key: "dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", key: "users", icon: Users },
  { to: "/admin/subscriptions", key: "subscriptions", icon: CalendarClock },
  { to: "/admin/plans", key: "plans", icon: CreditCard },
  { to: "/admin/discounts", key: "discounts", icon: Ticket },
  { to: "/admin/analytics", key: "analytics", icon: BarChart3 },
  { to: "/admin/content", key: "content", icon: FileText },
  { to: "/admin/settings", key: "settings", icon: Settings },
] as const;

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { t, isRTL } = useLanguage();
  const { access, user } = useAdminAccess();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={"end" in item ? item.end : false}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm smooth-transition ${
              isActive
                ? "gradient-gold text-primary-foreground shadow-gold font-semibold"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`
          }
        >
          <item.icon className="w-4 h-4 shrink-0" />
          <span>{t(`admin.nav.${item.key}`)}</span>
        </NavLink>
      ))}
    </nav>
  );

  if (access === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {t("admin.access.checking")}
      </div>
    );
  }

  if (access !== "granted") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card border border-black/15 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-gradient-gold">{t("admin.access.deniedTitle")}</h1>
          <p className="text-muted-foreground text-sm">
            {access === "guest" ? t("admin.access.loginRequired") : t("admin.access.deniedDesc")}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            {access === "guest" && (
              <Button className="gradient-gold text-primary-foreground" onClick={() => navigate("/auth")}>
                {t("admin.access.login")}
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/")}>
              {t("admin.access.goHome")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("admin.nav.dashboard")}>
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-[270px] glass-card p-4">
                <div className="mb-6 flex items-center gap-2">
                  <img src={logoAsset.url} alt={t("admin.brand")} className="w-9 h-9 rounded-xl object-cover" />
                  <span className="font-bold text-gradient-gold">{t("admin.brand")}</span>
                </div>
                <NavItems onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <Link to="/admin" className="flex items-center gap-2">
              <img src={logoAsset.url} alt={t("admin.brand")} className="w-9 h-9 rounded-xl object-cover shadow-gold" />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-gradient-gold text-sm md:text-base">{t("admin.brand")}</span>
                <span className="text-[10px] text-muted-foreground hidden sm:block">{t("admin.title")}</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:block text-xs text-muted-foreground max-w-[180px] truncate">{user?.email}</span>
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild aria-label={t("admin.nav.backToSite")}>
              <Link to="/"><ExternalLink className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t("admin.nav.logout")}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-64 shrink-0 border-e border-border/50 p-4 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
          <NavItems />
        </aside>
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
