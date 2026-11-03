import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
// Preserve the existing canonical sitemap origin.
export const BASE_URL = "https://www.cookluxury.ir";

export function publicRoutes(source) {
  const file = ts.createSourceFile("App.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const routes = new Set();
  function visit(node) {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(file) === "Route") {
      const attribute = node.attributes.properties.find((item) => ts.isJsxAttribute(item) && item.name.getText(file) === "path");
      const path = attribute?.initializer && ts.isStringLiteral(attribute.initializer) ? attribute.initializer.text : undefined;
      if (path?.startsWith("/") && !/[:*?]/.test(path) && !/^\/(auth|profile|admin|not-found|lovable)(\/|$)/.test(path)) routes.add(path);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return [...routes];
}

const metadata = {
  "/": ["weekly", "1.0"],
  "/why-us": ["weekly", "0.8"],
  "/popular-recipes": ["weekly", "0.9"],
  "/llms.txt": ["monthly", "0.3"],
};

export function renderSitemap(routes) {
  const paths = [...new Set([...routes, "/llms.txt"])];
  const urls = paths.map((path) => {
    const [frequency, priority] = metadata[path] ?? ["monthly", "0.5"];
    const location = `${BASE_URL}${path}`.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    // No lastmod without an authoritative page-specific content timestamp.
    return `  <url>\n    <loc>${location}</loc>\n    <changefreq>${frequency}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function generateSitemap() {
  const source = readFileSync(resolve(projectRoot, "src/App.tsx"), "utf8");
  const xml = renderSitemap(publicRoutes(source));
  const target = resolve(projectRoot, "public/sitemap.xml");
  if (readFileSync(target, "utf8") !== xml) writeFileSync(target, xml);
  return xml;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) generateSitemap();