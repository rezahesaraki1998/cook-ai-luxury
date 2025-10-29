import { ChefHat, Instagram, Send, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative border-t border-primary/20 mt-20">
      {/* Gold gradient line */}
      <div className="h-1 w-full gradient-gold"></div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gradient-gold">CookAI</span>
                <span className="text-xs text-muted-foreground">کوک‌اِی‌آی</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              دستیار هوشمند آشپزی که با قدرت هوش مصنوعی، آشپزی رو برات آسون می‌کنه
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="text-muted-foreground hover:text-primary smooth-transition">خانه</a></li>
              <li><a href="#recipes" className="text-muted-foreground hover:text-primary smooth-transition">محبوب‌ترین دستورها</a></li>
              <li><a href="/why-us" className="text-muted-foreground hover:text-primary smooth-transition">چرا ما</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">قوانین</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary smooth-transition">حریم خصوصی</a></li>
              <li><a href="/terms" className="text-muted-foreground hover:text-primary smooth-transition">شرایط استفاده</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary smooth-transition">تماس با ما</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">شبکه‌های اجتماعی</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl glass-card border border-primary/20 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 smooth-transition group"
              >
                <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-primary smooth-transition" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl glass-card border border-primary/20 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 smooth-transition group"
              >
                <Send className="w-5 h-5 text-muted-foreground group-hover:text-primary smooth-transition" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl glass-card border border-primary/20 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 smooth-transition group"
              >
                <Youtube className="w-5 h-5 text-muted-foreground group-hover:text-primary smooth-transition" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 CookAI. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
