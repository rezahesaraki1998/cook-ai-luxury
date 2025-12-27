import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: object;
}

const SEO = ({
  title = "CookAI | کوک‌اِی‌آی - دستیار هوشمند آشپزی با هوش مصنوعی",
  description = "فقط بگو چی می‌خوای بپزی! هوش مصنوعی در لحظه دستور پخت، مواد لازم و مراحل دقیق آشپزی رو برات آماده می‌کنه. دستور پخت غذاهای ایرانی و بین‌المللی با کوک‌اِی‌آی",
  keywords = "دستور پخت, آشپزی, هوش مصنوعی, غذای ایرانی, دستور غذا, آشپزی آنلاین, قرمه سبزی, کباب کوبیده, فسنجان, کوکو سبزی, آشپز هوشمند",
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  url = "https://cookai.ir",
  type = "website",
  jsonLd,
}: SEOProps) => {
  const defaultJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CookAI - کوک‌اِی‌آی",
    "description": description,
    "url": url,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IRR"
    },
    "author": {
      "@type": "Organization",
      "name": "CookAI"
    },
    "inLanguage": "fa-IR"
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="CookAI" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Persian" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="fa_IR" />
      <meta property="og:site_name" content="CookAI - کوک‌اِی‌آی" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd || defaultJsonLd)}
      </script>
    </Helmet>
  );
};

export default SEO;