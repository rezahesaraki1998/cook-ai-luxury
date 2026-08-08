import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO title="قوانین و شرایط استفاده | کوک‌اِی‌آی" description="قوانین و شرایط استفاده از سرویس دستور پخت هوشمند کوک‌اِی‌آی را پیش از استفاده مطالعه کنید." path="/terms" />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 group"
        >
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          بازگشت
        </Button>

        <div className="glass-card rounded-2xl p-8 md:p-12 space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">شرایط استفاده</h1>
            <p className="text-muted-foreground">لطفاً پیش از استفاده از خدمات سایت CookAI این شرایط استفاده را با دقت مطالعه نمایید. استفاده شما از خدمات سایت به معنی پذیرش کامل این شرایط است.</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۱. مفاهیم و تعاریف</h2>
              <p className="text-muted-foreground leading-relaxed">
                در این سند، اصطلاحات زیر به معانی زیر به‌کار می‌روند مگر آن‌که صراحتاً ذکر شده باشد:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                <li><strong className="text-foreground">(کاربر):</strong> هر شخصی که از خدمات سایت استفاده می‌کند.</li>
                <li><strong className="text-foreground">(حساب کاربری):</strong> پروفایل کاربر در سایت که با شماره تلفن و مشخصات دیگر ثبت می‌شود.</li>
                <li><strong className="text-foreground">(دستور پخت):</strong> متن، تصویر و محتوای تولیدشده توسط هوش مصنوعی که برای پخت یک غذا ارائه می‌گردد.</li>
                <li><strong className="text-foreground">(خدمات رایگان):</strong> امکاناتی که بدون پرداخت هزینه در اختیار کاربر قرار می‌گیرد.</li>
                <li><strong className="text-foreground">(اشتراک):</strong> خرید بسته اشتراک که دسترسی‌های بیشتری نسبت به نسخهٔ رایگان فراهم می‌کند.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۲. شرایط عضویت و دسترسی به دستور پخت‌ها</h2>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground mr-4">
                <li className="leading-relaxed">دسترسی به دستور پخت‌ها مشروط به ثبت‌نام و ایجاد حساب کاربری در سایت است. ارائه دستور پخت به‌صورت عمومی و بدون عضویت امکان‌پذیر نیست.</li>
                <li className="leading-relaxed">هر کاربر پس از ثبت‌نام می‌تواند تا ۷ (هفت) دستور پخت را به‌صورت رایگان از هوش مصنوعی درخواست نماید. پس از اتمام سقف یادشده، برای دریافت دستور پخت‌های بیشتر الزاماً باید اشتراک تهیه شود.</li>
                <li className="leading-relaxed">تهیه اشتراک، دسترسی‌های اضافی (شامل اما نه محدود به: درخواست نامحدود دستور پخت، دسترسی به محتوای پریمیوم، اولویت در پردازش درخواست‌ها و امکانات ویژه دیگر) را مطابق با پلن انتخابی فراهم می‌کند. شرایط دقیق هر پلن در صفحه مربوط به اشتراک‌ها اعلام می‌شود.</li>
                <li className="leading-relaxed">سایت می‌تواند در هر زمان و بدون اخطار قبلی سقف دسترسی رایگان یا مزایای اشتراک را تغییر دهد؛ در صورت تغییرات اساسی، کاربرانی که اشتراک فعال دارند از طریق ایمیل یا پیام درون‌سایتی مطلع خواهند شد.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۳. محدودیت‌ها و قواعد استفاده</h2>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground mr-4">
                <li className="leading-relaxed">هر شماره تلفن همراه مجاز به ساخت ۱ (یک) حساب کاربری است. ایجاد بیش از یک حساب با یک شماره تلفن مجاز نیست و در صورت تشخیص، حساب‌های اضافی مسدود خواهند شد.</li>
                <li className="leading-relaxed">اضافه‌کردن دستور پخت‌ها به لیست علاقه‌مندی‌ها (فهرست ذخیره‌شده‌ها) محدودیتی ندارد و کاربران می‌توانند هر تعداد دستور را ذخیره کنند.</li>
                <li className="leading-relaxed">استفاده از خدمات باید قانونی، اخلاقی و مطابق با قوانین و مقررات کشور باشد. هرگونه تولید، انتشار یا درخواست محتوا که ناقض قوانین جاری، حقوق اشخاص ثالث، یا محتوای نامناسب باشد، ممنوع است و سایت مجاز به حذف محتوا و یا مسدودسازی حساب کاربری خاطی خواهد بود.</li>
                <li className="leading-relaxed">کاربر مسئول صحت اطلاعاتی است که هنگام ثبت‌نام ارائه می‌دهد. اطلاعات نادرست یا ناقص ممکن است منجر به محدودیت در ارائه خدمات شود.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۴. پرداخت و بازپرداخت</h2>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground mr-4">
                <li className="leading-relaxed">خرید اشتراک از طریق روش‌های پرداخت اعلام‌شده در سایت انجام می‌شود. قیمت‌ها و شرایط هر پلن در صفحه خرید اشتراک مشخص است.</li>
                <li className="leading-relaxed">سیاست بازپرداخت طبق قوانین صفحه مربوطه (Refund Policy) اعمال خواهد شد. توصیه می‌شود کاربران پیش از خرید، شرایط بازپرداخت را مطالعه نمایند.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۵. حریم خصوصی و استفاده از شماره تلفن</h2>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground mr-4">
                <li className="leading-relaxed">شماره تلفن برای ایجاد حساب، احراز هویت و جلوگیری از ساخت چند حساب با یک شماره مورد استفاده قرار می‌گیرد.</li>
                <li className="leading-relaxed">اطلاعات شخصی کاربران مطابق با «سیاست حریم خصوصی» سایت ذخیره و پردازش می‌شود. استفاده سایت از شماره تلفن و سایر اطلاعات تنها در چارچوب قوانین حریم خصوصی و اهداف ارائهٔ خدمات صورت می‌گیرد.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۶. حقوق مالکیت معنوی</h2>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground mr-4">
                <li className="leading-relaxed">محتوای تولیدشده توسط هوش مصنوعی (دستور پخت‌ها، تصاویر تولیدی و غیره) متعلق به سایت یا تأمین‌کنندگان مجاز آن است. به کاربر مجوز استفاده غیرانحصاری، غیرقابل انتقال و محدود جهت استفاده شخصی از محتوای دریافت‌شده اعطا می‌گردد، مگر آن‌که در شرایط اشتراک خلاف آن قید شده باشد.</li>
                <li className="leading-relaxed">بازنشر، فروش یا استفاده تجاری از خروجی‌ها بدون اجازه کتبی سایت مجاز نیست.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۷. مسئولیت‌ها و محدودیت مسئولیت</h2>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground mr-4">
                <li className="leading-relaxed">سایت تلاش می‌کند محتوای دقیق و قابل اتکایی فراهم کند، اما هیچ تضمینی نسبت به کامل‌بودن، صحت یا مناسب‌بودن خروجی‌ها برای مقاصد خاص کاربر ارائه نمی‌شود.</li>
                <li className="leading-relaxed">سایت در قبال هرگونه خسارت مستقیم یا غیرمستقیم ناشی از استفاده یا عدم‌استفاده از محتوا یا خطاهای احتمالی مسئولیتی نمی‌پذیرد.</li>
                <li className="leading-relaxed">کاربر موظف است پیش از تهیه مواد غذایی جهت مصارف پزشکی یا رژیمی با متخصص ذی‌صلاح مشورت نماید. اطلاعات تغذیه‌ای ارائه‌شده صرفاً جهت اطلاع است و جایگزین مشورت پزشکی نیست.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۸. تعليق و خاتمه حساب</h2>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground mr-4">
                <li className="leading-relaxed">در صورت تخلف از این شرایط یا استفاده غیرمجاز، سایت می‌تواند حساب کاربر را تعلیق یا حذف کند.</li>
                <li className="leading-relaxed">کاربر می‌تواند در هر زمان درخواست حذف حساب خود را ثبت کند؛ با این حال برخی اطلاعات ممکن است طبق قوانین و برای حفظ سوابق پرداخت یا مسائل حقوقی ذخیره شوند.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۹. تغییر در شرایط استفاده</h2>
              <p className="text-muted-foreground leading-relaxed">
                سایت می‌تواند این شرایط را در هر زمان به‌روزرسانی نماید. تغییرات بلافاصله پس از انتشار در سایت لازم‌الاجرا خواهند بود، مگر آن‌که در متن تغییر تاریخ اجرا مشخص شده باشد. استفاده مداوم کاربر پس از اعمال تغییرات به منزله پذیرش شرایط جدید است.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">۱۰. تماس و پشتیبانی</h2>
              <p className="text-muted-foreground leading-relaxed">
                در صورت پرسش یا نیاز به پشتیبانی لطفاً از طریق صفحه تماس با ما یا آدرس ایمیل <a href="mailto:support@cookai.example" className="text-primary hover:underline">support@cookai.example</a> با ما در تماس باشید.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
