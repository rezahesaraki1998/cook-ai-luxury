import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ChefHat, Lock, Crown, Flame, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { popularFoods, type PopularFood } from "@/data/popularFoods";
import { Button } from "@/components/ui/button";

const fa = (n: number) => n.toLocaleString("fa-IR");

const usePremium = () => {
  const [state, setState] = useState<{ loggedIn: boolean; premium: boolean }>({ loggedIn: false, premium: false });
  useEffect(() => {
    const check = async (userId?: string) => {
      if (!userId) return setState({ loggedIn: false, premium: false });
      const [{ data: subs }, { data: roles }] = await Promise.all([
        supabase.from("subscriptions").select("id, expires_at").eq("user_id", userId).eq("status", "active"),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);
      const activeSub = (subs ?? []).some((s) => !s.expires_at || new Date(s.expires_at) > new Date());
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      setState({ loggedIn: true, premium: activeSub || isAdmin });
    };
    supabase.auth.getSession().then(({ data }) => check(data.session?.user.id));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => check(s?.user.id), 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  return state;
};

const PopularFoods = () => {
  const { locale } = useLanguage();
  const isFa = locale === "fa";
  const navigate = useNavigate();
  const { loggedIn, premium } = usePremium();
  const [tab, setTab] = useState<"iranian" | "foreign">("iranian");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = popularFoods.filter((f) => f.category === tab);
  const open = popularFoods.find((f) => f.id === openId) ?? null;

  const unlock = () => {
    if (!loggedIn) return navigate("/auth");
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: popularFoods.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Recipe",
        name: f.name,
        alternateName: f.nameEn,
        description: f.summary,
        recipeCuisine: f.category === "iranian" ? "Persian" : "International",
        recipeIngredient: f.ingredients.split("، "),
      },
    })),
  };

  return (
    <section id="popular-foods" className="py-12 md:py-20" aria-label={isFa ? "محبوب‌ترین غذاها" : "Most popular dishes"}>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{isFa ? "محبوب‌ترین غذاها" : "Most Popular Dishes"}</h2>
          <p className="text-muted-foreground">
            {isFa ? "۲۰ غذای اصیل ایرانی و ۲۰ غذای محبوب فرنگی" : "20 classic Persian and 20 international favorites"}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {(["iranian", "foreign"] as const).map((c) => (
            <Button key={c} variant={tab === c ? "default" : "outline"} className="rounded-full border-black/25"
              onClick={() => { setTab(c); setOpenId(null); }}>
              {c === "iranian" ? (isFa ? "غذاهای ایرانی" : "Persian") : (isFa ? "غذاهای فرنگی" : "International")}
            </Button>
          ))}
        </div>

        {open && <FoodDetail food={open} isFa={isFa} premium={premium} onUnlock={unlock} onClose={() => setOpenId(null)} />}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((f) => (
            <button key={f.id} onClick={() => { setOpenId(f.id); document.getElementById("popular-foods")?.scrollIntoView({ behavior: "smooth" }); }}
              className={`text-start rounded-2xl overflow-hidden bg-card border border-black/25 hover:shadow-lg transition-shadow ${openId === f.id ? "ring-2 ring-primary" : ""}`}>
              <img src={f.image} alt={f.name} loading="lazy" width={912} height={736} className="w-full aspect-[5/4] object-cover" />
              <div className="p-3">
                <h3 className="font-bold text-sm md:text-base">{isFa ? f.name : f.nameEn}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{f.time}</span>
                  <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" />{f.difficulty}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

const FoodDetail = ({ food, isFa, premium, onUnlock, onClose }: {
  food: PopularFood; isFa: boolean; premium: boolean; onUnlock: () => void; onClose: () => void;
}) => {
  const n = food.nutrition;
  const stats = [
    { label: "کالری", value: `${fa(n.calories)}`, unit: "kcal" },
    { label: "پروتئین", value: `${fa(n.protein)}`, unit: "گرم" },
    { label: "کربوهیدرات", value: `${fa(n.carbs)}`, unit: "گرم" },
    { label: "چربی", value: `${fa(n.fat)}`, unit: "گرم" },
  ];
  return (
    <article className="mb-8 rounded-2xl overflow-hidden bg-card border border-black/25 shadow-lg md:grid md:grid-cols-2">
      <img src={food.image} alt={food.name} width={912} height={736} className="w-full h-full object-cover max-h-96 md:max-h-none" />
      <div className="p-5 md:p-6 space-y-4 relative">
        <button onClick={onClose} aria-label={isFa ? "بستن" : "Close"} className="absolute top-3 end-3 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <div>
          <h3 className="text-2xl font-bold">{food.name}</h3>
          <p className="text-sm text-muted-foreground">{food.nameEn}</p>
        </div>
        <p>{food.summary}</p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{food.time}</span>
          <span className="flex items-center gap-1"><ChefHat className="w-4 h-4" />{food.difficulty}</span>
        </div>
        <div>
          <h4 className="font-semibold mb-1">مواد اصلی</h4>
          <p className="text-sm text-muted-foreground">{food.ingredients}</p>
        </div>

        <div className="relative rounded-xl border border-black/25 p-4">
          <div className={premium ? "" : "blur-sm select-none pointer-events-none"} aria-hidden={!premium}>
            <h4 className="font-semibold mb-2 flex items-center gap-1"><Flame className="w-4 h-4 text-primary" />ارزش غذایی (هر وعده)</h4>
            <div className="grid grid-cols-4 gap-2 text-center mb-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg bg-muted p-2">
                  <div className="font-bold">{premium ? s.value : "۰۰۰"}</div>
                  <div className="text-[10px] text-muted-foreground">{s.unit}</div>
                  <div className="text-xs">{s.label}</div>
                </div>
              ))}
            </div>
            <h4 className="font-semibold mb-2">نکات طلایی سرآشپز</h4>
            <ul className="list-disc ps-5 text-sm space-y-1">
              {(premium ? food.tips : ["این نکته مخصوص اعضای ویژه است و فقط با اشتراک دیده می‌شود.", "راز طعم و جاافتادن این غذا اینجاست."]).map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
          {!premium && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 rounded-xl text-center p-4">
              <Lock className="w-6 h-6 text-primary" />
              <p className="font-semibold text-sm">درصد پروتئین و نکات طلایی سرآشپز مخصوص اعضای ویژه است</p>
              <Button size="sm" onClick={onUnlock} className="gap-1"><Crown className="w-4 h-4" />خرید اشتراک ویژه</Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default PopularFoods;
