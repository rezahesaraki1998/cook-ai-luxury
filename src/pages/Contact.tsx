import { Button } from "@/components/ui/button";
import { ChevronRight, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO title="تماس با ما | کوک‌اِی‌آی" description="راه‌های ارتباط با تیم کوک‌اِی‌آی: واتساپ و ایمیل پشتیبانی برای پرسش، پیشنهاد و گزارش مشکل." path="/contact" />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8 group"
        >
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          بازگشت
        </Button>

        <div className="glass-card rounded-2xl p-8 md:p-12 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">تماس با ما</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                ما همیشه آماده پاسخگویی به سوالات، پیشنهادها و نظرات شما هستیم. برای ارتباط سریع‌تر می‌توانید از طریق واتساپ یا ایمیل با ما در تماس باشید.
              </p>
            </section>

            <section className="space-y-6">
              <a
                href="https://wa.me/989101563977"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-black/15 hover:border-black/30 hover:bg-primary/5 smooth-transition"
              >
                <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">واتساپ</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">+98 910 156 3977</p>
                </div>
              </a>

              <a
                href="mailto:rezahesaraki1998@gmail.com"
                className="flex items-center gap-4 p-4 rounded-xl border border-black/15 hover:border-black/30 hover:bg-primary/5 smooth-transition"
              >
                <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">ایمیل</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">rezahesaraki1998@gmail.com</p>
                </div>
              </a>
            </section>

            <section className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                با کلیک روی شماره تماس، مستقیماً وارد واتساپ شوید و پیام خود را برای ما ارسال کنید. همچنین با کلیک روی ایمیل، برنامه ایمیل شما باز شده و می‌توانید پیام خود را ارسال کنید.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Contact;
