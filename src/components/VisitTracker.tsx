import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackVisit } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";

/** Records real page visits (skips the admin panel itself). */
const VisitTracker = () => {
  const location = useLocation();
  const { locale } = useLanguage();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    void trackVisit(location.pathname, locale);
  }, [location.pathname, locale]);

  return null;
};

export default VisitTracker;
