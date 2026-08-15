import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/i18n/LanguageContext';

export const SITE_URL = "https://cookluxury.lovable.app";
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
  title,
  description,
  keywords,
  image = DEFAULT_OG_IMAGE,
  path = "/",
  type = "website",
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const { t, locale, dir } = useLanguage();
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;

  const resolvedTitle = title ?? t("seo.homeTitle");
  const resolvedDescription = description ?? t("seo.homeDesc");
  const resolvedKeywords = keywords ?? t("seo.keywords");
  const htmlLang = locale === "fa" ? "fa-IR" : "en-US";
  const ogLocale = locale === "fa" ? "fa_IR" : "en_US";

  const defaultJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "cookluxury",
    "description": resolvedDescription,
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
      "name": "cookluxury"
    },
    "inLanguage": htmlLang
  };

  return (
    <Helmet>
      <html lang={locale} dir={dir} />
      {/* Basic Meta Tags */}
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={resolvedKeywords} />
      <meta name="author" content="cookluxury" />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="language" content={locale === "fa" ? "Persian" : "English"} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:site_name" content="cookluxury" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd || defaultJsonLd)}
      </script>
    </Helmet>
  );
};

export default SEO;
