import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import type { User } from "@supabase/supabase-js";

interface Plan {
  id: string;
  name: string;
  name_en: string | null;
  price: number;
  duration_days: number;
  description: string | null;
  description_en: string | null;
  features: unknown;
  payment_link: string | null;
}

const PricingPlans = ({ compact = false }: { compact?: boolean }) => {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { t, locale, n } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null),
    );

    supabase
      .from("plans")
      .select("id,name,name_en,price,duration_days,description,description_en,features,payment_link")
      .eq("is_active", true)
      .order("price", { ascending: true })
      .then(({ data }) => setPlans((data as Plan[]) ?? []));

    return () => subscription.unsubscribe();
  }, []);

  const planName = (plan: Plan) => (locale === "en" ? plan.name_en || plan.name : plan.name);
  const planDesc = (plan: Plan) =>
    locale === "en" ? plan.description_en || plan.description : plan.description;

  const planFeatures = (plan: Plan): string[] => {
    const raw = plan.features;
    if (Array.isArray(raw)) return raw.map((f) => String(f)).filter(Boolean);
    return [];
  };

  const handleBuy = (plan: Plan) => {
    if (!user) {
      toast({
        title: t("pricing.loginRequiredTitle"),
        description: t("pricing.loginRequiredDesc"),
      });
      navigate("/auth");
      return;
    }
    if (!plan.payment_link) {
      toast({
        title: t("pricing.noLinkTitle"),
        description: t("pricing.noLinkDesc"),
        variant: "destructive",
      });
      return;
    }
    window.open(plan.payment_link, "_blank", "noopener,noreferrer");
  };

  return (
    <div id="plans" className={compact ? "space-y-6" : "container mx-auto px-4"}>
      <div className={`mx-auto ${compact ? "" : "max-w-6xl"}`}>
        {!compact && (
          <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="text-gradient-gold">{t("pricing.title")}</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg px-4 max-w-2xl mx-auto">
              {t("pricing.subtitle")}
            </p>
          </div>
        )}

        {plans === null ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{t("pricing.loading")}</span>
          </div>
        ) : plans.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t("pricing.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {plans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`glass-card p-5 md:p-6 flex flex-col text-start border-2 smooth-transition hover:shadow-gold ${
                  index === 1 ? "border-primary/60" : "border-black/25 dark:border-border/60"
                }`}
              >
                {index === 1 && (
                  <span className="self-start mb-3 inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs text-primary">
                    <Sparkles className="w-3 h-3" />
                    {t("pricing.popular")}
                  </span>
                )}
                <h3 className="text-lg md:text-xl font-bold text-foreground">{planName(plan)}</h3>
                {planDesc(plan) && (
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{planDesc(plan)}</p>
                )}
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-gradient-gold">
                    {Number(plan.price) > 0 ? n(Number(plan.price)) : t("pricing.free")}
                  </span>
                  {Number(plan.price) > 0 && (
                    <span className="text-xs md:text-sm text-muted-foreground pb-1">
                      {t("pricing.currency")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("pricing.durationDays", { days: n(plan.duration_days) })}
                </p>

                {planFeatures(plan).length > 0 && (
                  <ul className="mt-4 space-y-2 flex-1">
                    {planFeatures(plan).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  className="w-full mt-5 gradient-gold text-primary-foreground shadow-gold hover:shadow-warm smooth-transition"
                  onClick={() => handleBuy(plan)}
                >
                  {user ? t("pricing.buy") : t("pricing.loginToBuy")}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingPlans;
