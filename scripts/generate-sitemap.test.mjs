import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { publicRoutes, renderSitemap } from "./generate-sitemap.mjs";

test("popular-recipes remains included in the generated sitemap", () => {
  const source = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.ok(renderSitemap(publicRoutes(source)).includes("<loc>https://www.cookluxury.ir/popular-recipes</loc>"));
});

test("new public routes are discovered automatically", () => {
  const source = '<Routes><Route path="/new-public-page" element={<Page />} /></Routes>';
  assert.deepEqual(publicRoutes(source), ["/new-public-page"]);
});

test("account, admin, and non-concrete routes are excluded", () => {
  const paths = ["/auth", "/profile", "/admin", "/admin/users", "*", "/recipes/:id", "/lovable/callback"];
  const source = `<Routes>${paths.map((path) => `<Route path="${path}" element={<Page />} />`).join("")}</Routes>`;
  assert.deepEqual(publicRoutes(source), []);
});

test("generation does not invent lastmod timestamps", () => {
  assert.equal(renderSitemap(["/"]).includes("<lastmod>"), false);
});