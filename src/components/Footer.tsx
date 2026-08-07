import { ChefHat, Instagram, Send, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative border-t border-primary/20 mt-12 md:mt-20">
      {/* Gold gradient line */}
      <div className="h-1 w-full gradient-gold"></div>
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl gradient-gold flex items-center justify-center">
                <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-gradient-gold">CookAI</span>
                <span className="text-[10px] md:text-xs text-muted-foreground">کوک‌اِی‌آی</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              دستیار هوشمند آشپزی که با قدرت هوش مصنوعی، آشپزی رو برات آسون می‌کنه
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">دسترسی سریع</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-primary smooth-transition">خانه</a></li>
              <li><a href="/#recipes" className="text-muted-foreground hover:text-primary smooth-transition">محبوب‌ترین دستورها</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">قوانین</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li><a href="/why-us" className="text-muted-foreground hover:text-primary smooth-transition">چرا ما</a></li>
              <li><a href="/privacy" className="text-muted-foreground hover:text-primary smooth-transition">حریم خصوصی</a></li>
              <li><a href="/terms" className="text-muted-foreground hover:text-primary smooth-transition">شرایط استفاده</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary smooth-transition">تماس با ما</a></li>
            </ul>
          </div>


          {/* Social */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">شبکه‌های اجتماعی</h4>
            <div className="flex gap-2 md:gap-3">
              <a 
                href="#" 
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl glass-card border border-primary/20 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 smooth-transition group"
              >
                <Instagram className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary smooth-transition" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl glass-card border border-primary/20 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 smooth-transition group"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary smooth-transition" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl glass-card border border-primary/20 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 smooth-transition group"
              >
                <Youtube className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary smooth-transition" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 md:pt-8 border-t border-border/50 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            © 2025 CookAI. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
