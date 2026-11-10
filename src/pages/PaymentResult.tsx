import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const TEXT = {
  fa: {
    success: ["پرداخت با موفقیت انجام شد 🎉", "اشتراک ویژه‌ات فعال شد. حالا بدون محدودیت آشپزی کن!"],
    cancelled: ["پرداخت لغو شد", "پرداخت را لغو کردی و مبلغی کسر نشد. هر زمان خواستی می‌توانی دوباره اقدام کنی."],
    failed: ["پرداخت ناموفق بود", "تراکنش تأیید نشد. اگر مبلغی کسر شده، طی ۷۲ ساعت توسط بانک به حسابت برمی‌گردد."],
    invalid: ["تراکنش نامعتبر است", "اطلاعات این تراکنش پیدا نشد. اگر مشکلی داری با پشتیبانی تماس بگیر."],
    ref: "کد پیگیری", home: "بازگشت به صفحه اصلی", retry: "مشاهده پلن‌ها",
  },
  en: {
    success: ["Payment successful 🎉", "Your premium subscription is now active."],
    cancelled: ["Payment cancelled", "You cancelled the payment and nothing was charged."],
    failed: ["Payment failed", "The transaction was not verified. Any deducted amount is refunded by your bank within 72 hours."],
    invalid: ["Invalid transaction", "We could not find this transaction. Please contact support if needed."],
    ref: "Reference", home: "Back to home", retry: "View plans",
  },
};

const PaymentResult = () => {
  const [params] = useSearchParams();
  const { locale, n } = useLanguage();
  const tx = TEXT[locale === "en" ? "en" : "fa"];
  const raw = params.get("status");
  const status = (["success", "cancelled", "failed", "invalid"].includes(raw ?? "") ? raw : "invalid") as "success" | "cancelled" | "failed" | "invalid";
  const [title, body] = tx[status] as string[];
  const ref = params.get("ref");
  const Icon = status === "success" ? CheckCircle2 : status === "cancelled" ? AlertTriangle : XCircle;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-16 container mx-auto px-4">
        <Card className="glass-card max-w-lg mx-auto p-8 text-center border-2 border-black/25 dark:border-border/60 space-y-4">
          <Icon className={`w-14 h-14 mx-auto ${status === "success" ? "text-primary" : "text-destructive"}`} />
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{body}</p>
          {ref && status === "success" && (
            <p className="text-sm text-foreground">{tx.ref}: <span dir="ltr" className="font-mono">{n(ref)}</span></p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild className="gradient-gold text-primary-foreground shadow-gold">
              <Link to="/">{tx.home}</Link>
            </Button>
            {status !== "success" && (
              <Button asChild variant="outline"><Link to="/#pricing">{tx.retry}</Link></Button>
            )}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentResult;
