import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Flame, Users, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const recipes = [
  {
    name: "قرمه سبزی",
    time: "۲ ساعت",
    servings: "۴ نفر",
    difficulty: "متوسط",
    ingredients: [
      { name: "گوشت گوسفند یا گوساله", amount: "۵۰۰ گرم", note: "بدون استخوان، برای خورش" },
      { name: "سبزی قرمه", amount: "۵۰۰ گرم", note: "شامل: جعفری ۲۰۰گ، تره ۲۰۰گ، گشنیز ۱۰۰گ - تازه و شسته شده" },
      { name: "لوبیا قرمز", amount: "۱ پیمانه", note: "۲۰۰ گرم - یک شب خیس خورده" },
      { name: "پیاز متوسط", amount: "۲ عدد", note: "برای تفت دادن و پایه خورش" },
      { name: "لیمو عمانی", amount: "۳ عدد", note: "سوراخ شده برای طعم‌دهی" },
      { name: "روغن مایع", amount: "۱/۲ پیمانه", note: "برای تفت گوشت و سبزی" },
      { name: "زردچوبه", amount: "۱ قاشق چایخوری", note: "" },
      { name: "نمک و فلفل", amount: "به مقدار لازم", note: "" },
      { name: "آب لیمو یا آب نارنج", amount: "۲ قاشق غذاخوری", note: "اختیاری برای طعم" },
    ],
    nutrition: { calories: "۴۵۰", protein: "۳۵گ", carbs: "۴۰گ" },
    steps: [
      "ابتدا لوبیا قرمز را شب قبل خیس کنید. صبح روز بعد آن را آبکش کرده و در قابلمه‌ای با آب و کمی نمک بگذارید تا نرم شود (حدود ۴۵ دقیقه).",
      "گوشت را به قطعات متوسط خرد کنید. پیازها را نیز رنده کرده یا نگینی خرد کنید.",
      "در قابلمه‌ای روغن را حرارت دهید و پیاز را تفت دهید تا طلایی و شفاف شود. سپس گوشت را اضافه کنید و هم بزنید تا رنگ آن تغییر کند.",
      "زردچوبه، نمک و فلفل را به گوشت اضافه کنید. کمی آب اضافه کرده و اجازه دهید گوشت برای ۴۵ دقیقه بپزد تا کاملاً نرم شود.",
      "سبزی قرمه را بعد از شستن و خشک کردن، ریز خرد کنید. در تابه‌ای جداگانه روغن را گرم کرده و سبزی‌ها را به مدت ۱۵-۲۰ دقیقه تفت دهید تا بوی خام آن‌ها از بین برود و رنگشان تیره شود.",
      "سبزی تفت داده شده را به گوشت اضافه کنید. لوبیای پخته شده را نیز اضافه کرده و مخلوط کنید.",
      "لیمو عمانی‌ها را سوراخ کنید و به خورش اضافه کنید. در صورت نیاز آب اضافه کنید تا غلظت مناسبی داشته باشد.",
      "حرارت را کم کنید و اجازه دهید خورش به مدت ۴۵ دقیقه دیگر با حرارت ملایم بپزد تا طعم‌ها به هم بخورد و قوام مناسب پیدا کند.",
      "در انتها طعم خورش را چک کنید و در صورت نیاز نمک و آب لیمو اضافه کنید. قرمه سبزی آماده است که با برنج سفید و ترشی سرو شود."
    ]
  },
  {
    name: "قیمه",
    time: "۱.۵ ساعت",
    servings: "۴ نفر",
    difficulty: "آسان",
    ingredients: [
      { name: "گوشت چرخ‌کرده", amount: "۵۰۰ گرم", note: "گوشت گوسفند یا گوساله" },
      { name: "سیب‌زمینی", amount: "۳ عدد", note: "برای سرخ کردن" },
      { name: "پیاز متوسط", amount: "۲ عدد", note: "برای تفت دادن" },
      { name: "رب گوجه‌فرنگی", amount: "۳ قاشق غذاخوری", note: "" },
      { name: "نخود", amount: "۱ پیمانه", note: "یک شب خیس خورده" },
      { name: "لیمو عمانی", amount: "۲ عدد", note: "سوراخ شده" },
      { name: "زردچوبه", amount: "۱ قاشق چایخوری", note: "" },
      { name: "دارچین", amount: "۱/۲ قاشق چایخوری", note: "" },
      { name: "نمک و فلفل", amount: "به مقدار لازم", note: "" },
    ],
    nutrition: { calories: "۴۲۰", protein: "۳۰گ", carbs: "۴۵گ" },
    steps: [
      "نخود را شب قبل خیس کنید. صبح آن را آبکش کرده و با آب و کمی نمک بگذارید تا نرم شود.",
      "پیاز را نگینی خرد کنید و در روغن طلایی کنید.",
      "گوشت چرخ‌کرده را به پیاز اضافه کنید و تفت دهید تا رنگ آن تغییر کند.",
      "زردچوبه، دارچین، نمک و فلفل را اضافه کنید و چند دقیقه تفت دهید.",
      "رب گوجه را اضافه کرده و کمی تفت دهید تا بوی خام آن از بین برود.",
      "آب اضافه کرده و اجازه دهید گوشت به مدت ۳۰ دقیقه بپزد.",
      "سیب‌زمینی‌ها را پوست کنده و مکعبی خرد کنید، سپس سرخ کنید.",
      "نخود پخته شده و لیمو عمانی را به خورش اضافه کنید و ۱۵ دقیقه دیگر بپزد.",
      "در انتها سیب‌زمینی‌های سرخ شده را اضافه کنید. قیمه آماده است."
    ]
  },
  {
    name: "فسنجان",
    time: "۲ ساعت",
    servings: "۴ نفر",
    difficulty: "متوسط",
    ingredients: [
      { name: "مرغ", amount: "۴ تکه", note: "ران یا سینه" },
      { name: "گردو خردشده", amount: "۳۰۰ گرم", note: "" },
      { name: "پیاز متوسط", amount: "۲ عدد", note: "رنده شده" },
      { name: "رب انار", amount: "۱ پیمانه", note: "ترش یا ترش و شیرین" },
      { name: "شکر", amount: "۲-۳ قاشق غذاخوری", note: "بسته به طعم رب انار" },
      { name: "زعفران دم‌کرده", amount: "۲ قاشق غذاخوری", note: "" },
      { name: "روغن", amount: "۱/۴ پیمانه", note: "" },
      { name: "نمک و فلفل", amount: "به مقدار لازم", note: "" },
    ],
    nutrition: { calories: "۵۲۰", protein: "۳۸گ", carbs: "۳۵گ" },
    steps: [
      "پیازها را رنده کرده و در روغن طلایی کنید.",
      "مرغ‌ها را با نمک و فلفل چاشنی کرده و به پیاز اضافه کنید. تفت دهید تا سفیدی مرغ از بین برود.",
      "گردوهای خردشده را در تابه‌ای بدون روغن تفت دهید تا بو بدهد (مواظب باشید نسوزد).",
      "گردو را به مرغ اضافه کنید و آب بریزید تا مواد را بپوشاند.",
      "اجازه دهید به مدت ۱ ساعت با حرارت ملایم بپزد تا گردو نرم و روغنش بیرون بیاید.",
      "رب انار را اضافه کنید و خوب هم بزنید.",
      "شکر و زعفران را اضافه کنید و ۳۰ دقیقه دیگر بپزد تا قوام بگیرد.",
      "طعم را چک کنید و در صورت نیاز شکر یا رب انار اضافه کنید. فسنجان آماده است."
    ]
  },
  {
    name: "زرشک پلو با مرغ",
    time: "۱ ساعت",
    servings: "۴ نفر",
    difficulty: "آسان",
    ingredients: [
      { name: "برنج", amount: "۳ پیمانه", note: "خیس خورده" },
      { name: "مرغ", amount: "۴ تکه", note: "" },
      { name: "زرشک", amount: "۱۵۰ گرم", note: "شسته شده" },
      { name: "پیاز", amount: "۱ عدد", note: "رنده شده" },
      { name: "زعفران دم‌کرده", amount: "۳ قاشق غذاخوری", note: "" },
      { name: "شکر", amount: "۲ قاشق غذاخوری", note: "برای زرشک" },
      { name: "زردچوبه", amount: "۱ قاشق چایخوری", note: "" },
      { name: "نمک", amount: "به مقدار لازم", note: "" },
    ],
    nutrition: { calories: "۵۸۰", protein: "۳۵گ", carbs: "۷۵گ" },
    steps: [
      "مرغ را با پیاز، زردچوبه، نمک و فلفل بپزید تا کاملاً نرم شود.",
      "برنج را آبکش کرده و در قابلمه با آب و نمک بگذارید تا دم بکشد.",
      "زرشک را شسته و آبکش کنید. در روغن و شکر تفت دهید (مواظب باشید نسوزد).",
      "مرغ‌های پخته شده را با زعفران و کمی روغن مخلوط کنید و در فر یا تابه طلایی کنید.",
      "برنج را دم کشیده و با زعفران رنگ دهید.",
      "برنج را در ظرف سرو بکشید، زرشک را روی آن بریزید و مرغ‌ها را کنار بچینید.",
      "زرشک پلو با مرغ آماده است."
    ]
  },
  {
    name: "کوکو سبزی",
    time: "۴۵ دقیقه",
    servings: "۴ نفر",
    difficulty: "آسان",
    ingredients: [
      { name: "تخم‌مرغ", amount: "۶ عدد", note: "" },
      { name: "سبزی کوکو", amount: "۴۰۰ گرم", note: "شامل: جعفری، شوید، تره، گشنیز" },
      { name: "گردو خردشده", amount: "۱/۲ پیمانه", note: "" },
      { name: "زرشک", amount: "۳ قاشق غذاخوری", note: "" },
      { name: "آرد", amount: "۲ قاشق غذاخوری", note: "" },
      { name: "زردچوبه", amount: "۱/۲ قاشق چایخوری", note: "" },
      { name: "نمک و فلفل", amount: "به مقدار لازم", note: "" },
    ],
    nutrition: { calories: "۲۸۰", protein: "۱۸گ", carbs: "۱۵گ" },
    steps: [
      "سبزی‌ها را بشویید، خشک کنید و ریز خرد کنید.",
      "تخم‌مرغ‌ها را در کاسه‌ای بزنید و با نمک، فلفل و زردچوبه مخلوط کنید.",
      "سبزی‌ها، گردو، زرشک و آرد را به تخم‌مرغ اضافه کنید و خوب مخلوط کنید.",
      "تابه را با روغن گرم کنید و مخلوط را در آن بریزید.",
      "درب تابه را بگذارید و با حرارت ملایم ۱۵ دقیقه بپزید.",
      "کوکو را برگردانید و ۱۵ دقیقه دیگر بپزید تا طلایی شود.",
      "کوکو سبزی آماده است که می‌توان با نان و ماست سرو کرد."
    ]
  }
];

const RecipePreview = () => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [recipeData, setRecipeData] = useState(recipes[0]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const toPersianNumber = (num: number) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().split('').map(digit => persianDigits[parseInt(digit)]).join('');
  };

  useEffect(() => {
    // Select random recipe on mount
    const randomIndex = Math.floor(Math.random() * recipes.length);
    setRecipeData(recipes[randomIndex]);
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkIfFavorite(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await checkIfFavorite(session.user.id);
    }
  };

  const checkIfFavorite = async (userId: string) => {
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("recipe_name", recipeData.name)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "نیاز به ورود",
        description: "برای ذخیره دستور پخت، ابتدا وارد حساب خود شوید",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_name", recipeData.name);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: "حذف شد",
          description: "دستور پخت از علاقه‌مندی‌ها حذف شد",
        });
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          recipe_name: recipeData.name,
          recipe_data: recipeData,
        });

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: "ذخیره شد!",
          description: "دستور پخت به علاقه‌مندی‌ها اضافه شد",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="recipes" className="py-12 md:py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="text-gradient-gold">نمونه‌ای از نتیجه</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg px-4">
              همین الان ببین چطور کوک‌اِی‌آی برات دستور پخت می‌سازه
            </p>
          </div>

          {/* Recipe Card */}
          <Card className="glass-card p-4 md:p-6 lg:p-8 border border-primary/20 shadow-elevation overflow-hidden">
            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
              {/* Recipe Image */}
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden aspect-video md:aspect-square bg-gradient-to-br from-primary/20 to-secondary/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2 md:space-y-4">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full gradient-gold mx-auto flex items-center justify-center animate-glow-pulse">
                      <Flame className="w-7 h-7 md:w-10 md:h-10 text-primary-foreground" />
                    </div>
                    <p className="text-xs md:text-base text-muted-foreground">تصویر غذا با هوش مصنوعی</p>
                  </div>
                </div>
              </div>

              {/* Recipe Details */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">{recipeData.name}</h3>
                  <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      <span>{recipeData.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      <span>{recipeData.servings}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Flame className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                      <span>{recipeData.difficulty}</span>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="glass-card p-3 md:p-4 rounded-lg md:rounded-xl border border-primary/10">
                  <h4 className="font-semibold text-primary mb-2 md:mb-3 text-sm md:text-base">مواد لازم (برای {recipeData.servings}):</h4>
                  <ul className="space-y-1.5 md:space-y-2.5 text-xs md:text-sm text-foreground/90">
                    {recipeData.ingredients.slice(0, 5).map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-1.5 md:gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          <strong>{ingredient.name}:</strong> {ingredient.amount}
                        </span>
                      </li>
                    ))}
                    {recipeData.ingredients.length > 5 && (
                      <li className="text-primary text-xs md:text-sm">
                        و {recipeData.ingredients.length - 5} ماده دیگر...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Nutrition Info */}
                <div className="flex gap-2 md:gap-4">
                  <div className="flex-1 glass-card p-2 md:p-3 rounded-lg md:rounded-xl text-center border border-border/50">
                    <div className="text-lg md:text-2xl font-bold text-primary">{recipeData.nutrition.calories}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">کالری</div>
                  </div>
                  <div className="flex-1 glass-card p-2 md:p-3 rounded-lg md:rounded-xl text-center border border-border/50">
                    <div className="text-lg md:text-2xl font-bold text-primary">{recipeData.nutrition.protein}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">پروتئین</div>
                  </div>
                  <div className="flex-1 glass-card p-2 md:p-3 rounded-lg md:rounded-xl text-center border border-border/50">
                    <div className="text-lg md:text-2xl font-bold text-primary">{recipeData.nutrition.carbs}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">کربوهیدرات</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleToggleFavorite}
                    disabled={loading}
                    variant="outline"
                    aria-label={isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
                    aria-pressed={isFavorite}
                    className={`border-primary/30 hover:bg-primary/10 smooth-transition ${
                      isFavorite ? "bg-primary/10 border-primary" : ""
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 smooth-transition ${
                        isFavorite ? "fill-primary text-primary" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </div>

            {/* Steps Preview */}
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border/50">
              <h4 className="font-semibold text-base md:text-lg mb-3 md:mb-4">مراحل پخت:</h4>
              <div className="space-y-2 md:space-y-3">
                {recipeData.steps.map((step, index) => (
                  <div key={index} className="flex gap-2 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                      <span className="text-xs md:text-sm font-bold text-primary-foreground">{toPersianNumber(index + 1)}</span>
                    </div>
                    <p className="text-foreground/90 pt-0.5 md:pt-1 text-xs md:text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RecipePreview;
