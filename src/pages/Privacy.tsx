import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO title="حریم خصوصی | کوک‌اِی‌آی" description="سیاست حریم خصوصی کوک‌اِی‌آی: چه داده‌هایی جمع‌آوری می‌شود، چگونه نگهداری و محافظت می‌شود." path="/privacy" />
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
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">حریم خصوصی</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۱. تعهد به حفظ حریم خصوصی</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما به اعتماد شما اهمیت می‌دهیم. اطلاعاتی که در سایت وارد می‌کنید فقط برای ارائه خدمات بهتر، بهبود تجربه کاربری و پاسخ‌گویی دقیق‌تر استفاده می‌شود. ما متعهد هستیم از اطلاعات شما محافظت کنیم و آن را بدون اجازه شما در اختیار شخص یا مجموعه دیگری قرار ندهیم.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۲. استفاده از اطلاعات</h2>
              <p className="text-muted-foreground leading-relaxed">
                استفاده شما از این سایت به معنی پذیرش قوانین حریم خصوصی و اعتماد به ما برای حفظ اطلاعات شماست. اطلاعات جمع‌آوری‌شده صرفاً برای بهبود عملکرد سایت، شخصی‌سازی تجربه کاربری و ارائه پشتیبانی مناسب مورد استفاده قرار می‌گیرد.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۳. حفاظت از اطلاعات</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما از روش‌ها و استانداردهای امنیتی مناسب برای محافظت از اطلاعات شخصی کاربران استفاده می‌کنیم. اطلاعات شما در دسترس اشخاص ثالث قرار نخواهد گرفت، مگر آن‌که قانون یا مرجع صالحی این موضوع را الزامی کند.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۴. تغییرات در سیاست حریم خصوصی</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما حق داریم هر زمان این سیاست حریم خصوصی را به‌روزرسانی کنیم. تغییرات پس از انتشار در سایت لازم‌الاجرا خواهند بود و استفاده مداوم از خدمات به معنی پذیرش نسخهٔ به‌روزشده است.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۵. تماس با ما</h2>
              <p className="text-muted-foreground leading-relaxed">
                در صورت داشتن هرگونه سوال دربارهٔ حریم خصوصی و نحوهٔ مدیریت اطلاعات، می‌توانید از طریق صفحه تماس با ما یا آدرس ایمیل <a href="mailto:support@cookai.example" className="text-primary hover:underline">support@cookai.example</a> با ما در ارتباط باشید.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
