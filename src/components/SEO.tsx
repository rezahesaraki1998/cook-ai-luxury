import { Helmet } from 'react-helmet-async';

export const SITE_URL = "https://cook-ai-luxury.lovable.app";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  /** Path of the current route, e.g. "/contact". Used for canonical + og:url */
  path?: string;
  type?: string;
  noindex?: boolean;
  jsonLd?: object;
}

const SEO = ({
  title = "کوک‌اِی‌آی | دستور پخت فوری با هوش مصنوعی",
  description = "فقط بگو چی می‌خوای بپزی! کوک‌اِی‌آی در لحظه مواد لازم و مراحل پخت غذاهای ایرانی و بین‌المللی را برایت آماده می‌کند.",
  keywords = "دستور پخت, آشپزی, هوش مصنوعی, غذای ایرانی, دستور غذا, آشپزی آنلاین, قرمه سبزی, کباب کوبیده, فسنجان, کوکو سبزی, آشپز هوشمند",
  image = DEFAULT_OG_IMAGE,
  path = "/",
  type = "website",
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;

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
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="language" content="Persian" />
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
