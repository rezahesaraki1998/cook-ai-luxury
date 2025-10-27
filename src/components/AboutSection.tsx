import { Card } from "@/components/ui/card";
import { Brain, Sparkles, ChefHat } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Title */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-gold">
              با CookAI دیگه لازم نیست فکر کنی چی بپزی
            </h2>
            <p className="text-xl text-muted-foreground">
              فقط بگو، بقیه‌ش با ماست
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card p-6 border border-primary/20 space-y-4">
              <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center mx-auto">
                <Brain className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">هوش مصنوعی قدرتمند</h3>
              <p className="text-sm text-muted-foreground">
                با استفاده از جدیدترین مدل‌های AI، بهترین دستورها رو برات پیدا می‌کنیم
              </p>
            </Card>

            <Card className="glass-card p-6 border border-primary/20 space-y-4">
              <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">شخصی‌سازی هوشمند</h3>
              <p className="text-sm text-muted-foreground">
                دستورها رو بر اساس سلیقه، تعداد افراد و زمان موجودت تنظیم می‌کنه
              </p>
            </Card>

            <Card className="glass-card p-6 border border-primary/20 space-y-4">
              <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center mx-auto">
                <ChefHat className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">راهنمای گام‌به‌گام</h3>
              <p className="text-sm text-muted-foreground">
                از مواد اولیه تا آخرین مرحله، کنارت هستیم تا غذای عالی بپزی
              </p>
            </Card>
          </div>

          {/* Testimonial */}
          <Card className="glass-card p-8 border border-primary/20 max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary text-2xl">★</span>
                ))}
              </div>
              <p className="text-lg text-foreground/90 leading-relaxed">
                "قبلاً همیشه برای انتخاب غذا استرس داشتم، الان با CookAI تو چند ثانیه دستور پخت کامل و حرفه‌ای دارم. عالیه!"
              </p>
              <div className="pt-4">
                <p className="font-semibold text-foreground">سارا احمدی</p>
                <p className="text-sm text-muted-foreground">کاربر CookAI</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
