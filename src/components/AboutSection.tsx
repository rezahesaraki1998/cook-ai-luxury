import { Card } from "@/components/ui/card";
import { Brain, Sparkles, ChefHat } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Title */}
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-gold">
              چرا ما؟
            </h1>

          </div>

          {/* Questions Section */}
          <Card className="glass-card p-8 border border-primary/20">
            <div className="space-y-6 text-right">
              <h2 className="text-2xl font-bold text-foreground">سوال‌های همیشگی آشپزی</h2>
              <p className="text-lg text-foreground leading-relaxed">
                تا حالا چند بار از خودت پرسیدی:
              </p>
              <div className="space-y-4 pr-4">
                <p className="text-base text-foreground/90 leading-relaxed">
                  🍲 «چی درست کنم؟»
                </p>
                <p className="text-base text-foreground/90 leading-relaxed">
                  ⌛ «وقتم کمه، یه غذای سریع چی میشه پخت؟»
                </p>
                <p className="text-base text-foreground/90 leading-relaxed">
                  🏋️‍♀️ «می‌خوام رژیمی بخورم، چی بخورم که هم خوشمزه باشه هم سالم؟»
                </p>
                <p className="text-base text-foreground/90 leading-relaxed">
                  👩‍🍳 یا شاید گفتی: «خسته شدم از تکرار، یه غذای جدید یادم بده!»
                </p>
              </div>
            </div>
          </Card>

          {/* Main Content */}
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-foreground">CookAI چطور کمک می‌کند؟</h2>
            <p className="text-xl text-foreground font-semibold leading-relaxed">
              اینجا جاییه که CookAI به کمکت میاد.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              ما با هوش مصنوعی طراحی شدیم تا بر اساس مواد اولیه‌ای که توی خونه داری، سلیقه‌ات، و حتی اهداف رژیمی‌ات، غذاهای دقیق و خوش‌طعم بهت پیشنهاد بدیم.
            </p>
          </div>

          {/* Highlight Card */}
          <Card className="glass-card p-8 border border-primary/20 bg-primary/5 max-w-3xl mx-auto">
            <div className="space-y-4 text-center">
              <p className="text-2xl font-bold text-gradient-gold leading-relaxed">
                با ما دیگه هیچ‌وقت نمی‌گی «چی بپزم؟»
              </p>
              <p className="text-lg text-foreground/90 leading-relaxed">
                فقط بگو چی داری، یا چه غذایی دلت می‌خواد، و در چند ثانیه دستور پخت اختصاصی‌ت آماده‌ست.
              </p>
            </div>
          </Card>

          {/* Closing Statement */}
          <div className="text-center space-y-4 pt-6">
            <p className="text-lg text-foreground/90 leading-relaxed italic max-w-3xl mx-auto">
              در CookAI، آشپزی یه تجربه‌ی ساده، الهام‌بخش و کاملاً شخصی میشه —
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              برای کسانی که به کیفیت، زمان و طعم اهمیت می‌دن.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
