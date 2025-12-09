import { Card } from "@/components/ui/card";
import { Zap, Leaf, Users, Cake } from "lucide-react";

const suggestions = [
  {
    icon: Zap,
    title: "غذای سریع برای دو نفر",
    description: "دستور پخت‌های کمتر از ۳۰ دقیقه",
    gradient: "from-primary/20 to-secondary/20"
  },
  {
    icon: Leaf,
    title: "خوراک رژیمی ایرانی",
    description: "غذاهای سالم و کم کالری",
    gradient: "from-green-500/20 to-primary/20"
  },
  {
    icon: Users,
    title: "غذای مخصوص مهمان",
    description: "دستورهای فاخر و خاص",
    gradient: "from-secondary/20 to-rose-500/20"
  },
  {
    icon: Cake,
    title: "دسر ساده با میوه",
    description: "شیرینی‌های خوشمزه و آسان",
    gradient: "from-pink-500/20 to-primary/20"
  }
];

const SmartSuggestions = () => {
  return (
    <section className="py-12 md:py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="text-gradient-gold">الهام از هوش آشپز</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg px-4">
              نمی‌دونی چی بپزی؟ از پیشنهادهای هوشمند ما استفاده کن
            </p>
          </div>

          {/* Suggestions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {suggestions.map((suggestion, index) => (
              <Card 
                key={index}
                className="glass-card p-4 md:p-6 border-2 border-black/25 hover:border-black/40 cursor-pointer group smooth-transition hover:scale-105 hover:shadow-gold"
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${suggestion.gradient} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 smooth-transition`}>
                  <suggestion.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-sm md:text-lg font-bold text-foreground mb-1 md:mb-2 group-hover:text-primary smooth-transition">
                  {suggestion.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  {suggestion.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartSuggestions;
