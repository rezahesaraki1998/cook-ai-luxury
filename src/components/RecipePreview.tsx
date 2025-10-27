import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Flame, Users, Heart } from "lucide-react";

const RecipePreview = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient-gold">نمونه‌ای از نتیجه</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              همین الان ببین چطور کوک‌اِی‌آی برات دستور پخت می‌سازه
            </p>
          </div>

          {/* Recipe Card */}
          <Card className="glass-card p-6 md:p-8 border border-primary/20 shadow-elevation overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Recipe Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-primary/20 to-secondary/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full gradient-gold mx-auto flex items-center justify-center animate-glow-pulse">
                      <Flame className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <p className="text-muted-foreground">تصویر غذا با هوش مصنوعی</p>
                  </div>
                </div>
              </div>

              {/* Recipe Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-foreground mb-3">قرمه سبزی</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>۲ ساعت</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>۴ نفر</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-primary" />
                      <span>متوسط</span>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="glass-card p-4 rounded-xl border border-primary/10">
                  <h4 className="font-semibold text-primary mb-3">مواد لازم (برای ۴ نفر):</h4>
                  <ul className="space-y-2.5 text-sm text-foreground/90">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>گوشت گوسفند یا گوساله:</strong> ۵۰۰ گرم (بدون استخوان، برای خورش)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>سبزی قرمه:</strong> ۵۰۰ گرم (شامل: جعفری ۲۰۰گ، تره ۲۰۰گ، گشنیز ۱۰۰گ) - تازه و شسته شده</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>لوبیا قرمز:</strong> ۱ پیمانه (۲۰۰ گرم) - یک شب خیس خورده</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>پیاز متوسط:</strong> ۲ عدد (برای تفت دادن و پایه خورش)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>لیمو عمانی:</strong> ۳ عدد (سوراخ شده برای طعم‌دهی)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>روغن مایع:</strong> ۱/۲ پیمانه (برای تفت گوشت و سبزی)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>زردچوبه:</strong> ۱ قاشق چایخوری</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>نمک و فلفل:</strong> به مقدار لازم</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>آب لیمو یا آب نارنج:</strong> ۲ قاشق غذاخوری (اختیاری برای طعم)</span>
                    </li>
                  </ul>
                </div>

                {/* Nutrition Info */}
                <div className="flex gap-4">
                  <div className="flex-1 glass-card p-3 rounded-xl text-center border border-border/50">
                    <div className="text-2xl font-bold text-primary">۴۵۰</div>
                    <div className="text-xs text-muted-foreground">کالری</div>
                  </div>
                  <div className="flex-1 glass-card p-3 rounded-xl text-center border border-border/50">
                    <div className="text-2xl font-bold text-primary">۳۵گ</div>
                    <div className="text-xs text-muted-foreground">پروتئین</div>
                  </div>
                  <div className="flex-1 glass-card p-3 rounded-xl text-center border border-border/50">
                    <div className="text-2xl font-bold text-primary">۴۰گ</div>
                    <div className="text-xs text-muted-foreground">کربوهیدرات</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Steps Preview */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <h4 className="font-semibold text-lg mb-4">مراحل پخت:</h4>
              <div className="space-y-3">
                {[
                  "ابتدا لوبیا قرمز را شب قبل خیس کنید. صبح روز بعد آن را آبکش کرده و در قابلمه‌ای با آب و کمی نمک بگذارید تا نرم شود (حدود ۴۵ دقیقه).",
                  "گوشت را به قطعات متوسط خرد کنید. پیازها را نیز رنده کرده یا نگینی خرد کنید.",
                  "در قابلمه‌ای روغن را حرارت دهید و پیاز را تفت دهید تا طلایی و شفاف شود. سپس گوشت را اضافه کنید و هم بزنید تا رنگ آن تغییر کند.",
                  "زردچوبه، نمک و فلفل را به گوشت اضافه کنید. کمی آب اضافه کرده و اجازه دهید گوشت برای ۴۵ دقیقه بپزد تا کاملاً نرم شود.",
                  "سبزی قرمه را بعد از شستن و خشک کردن، ریز خرد کنید. در تابه‌ای جداگانه روغن را گرم کرده و سبزی‌ها را به مدت ۱۵-۲۰ دقیقه تفت دهید تا بوی خام آن‌ها از بین برود و رنگشان تیره شود.",
                  "سبزی تفت داده شده را به گوشت اضافه کنید. لوبیای پخته شده را نیز اضافه کرده و مخلوط کنید.",
                  "لیمو عمانی‌ها را سوراخ کنید و به خورش اضافه کنید. در صورت نیاز آب اضافه کنید تا غلظت مناسبی داشته باشد.",
                  "حرارت را کم کنید و اجازه دهید خورش به مدت ۴۵ دقیقه دیگر با حرارت ملایم بپزد تا طعم‌ها به هم بخورد و قوام مناسب پیدا کند.",
                  "در انتها طعم خورش را چک کنید و در صورت نیاز نمک و آب لیمو اضافه کنید. قرمه سبزی آماده است که با برنج سفید و ترشی سرو شود."
                ].map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                    </div>
                    <p className="text-foreground/90 pt-1 text-sm leading-relaxed">{step}</p>
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
