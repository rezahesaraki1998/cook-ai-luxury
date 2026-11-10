# AGENTS.md

## Structure
- Recipe entitlements are reserved and settled atomically through service-only database functions; clients read status through recipe-ai, and image/nutrition calls require a single-use request receipt bound to identity and prompt to prevent quota bypasses.
- Generate `public/sitemap.xml` from concrete public routes in `src/App.tsx` through the Vite buildStart hook; exclude account/admin routes and omit lastmod without page-specific timestamps, so every deployment updates crawlable URLs without fabricated freshness.
- Popular recipes (the 40-dish catalog) live on the dedicated `/popular-recipes` page, not on the homepage. All nav/footer/search-dialog links point there; its SEO metadata comes from `seo.popularRecipesTitle`/`popularRecipesDesc` and it is listed in `public/sitemap.xml`.
- Subscription checkout goes through the `zarinpal-payment` edge function: amount/currency come from the trusted plan row, a pending `payments` row is created before redirect, and only the service-only `complete_payment` RPC (row lock + idempotent) activates subscriptions after ZarinPal verify returns 100/101, so callbacks can never grant access on their own.
