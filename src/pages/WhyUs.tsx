import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import SEO from "@/components/SEO";

const WhyUs = () => {
  return (
    <>
      <SEO title="چرا کوک‌اِی‌آی؟ | مزیت‌های دستیار آشپزی هوشمند" description="با کوک‌اِی‌آی در چند ثانیه دستور پخت شخصی‌سازی‌شده، مواد لازم و مراحل دقیق آشپزی را دریافت کنید." path="/why-us" />
      <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default WhyUs;
