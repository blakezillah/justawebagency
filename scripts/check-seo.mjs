#!/usr/bin/env node
/**
 * Post-build SEO and GEO (AI search) checks for justaweb.agency.
 *
 * WHY: the agency sells sites that are "built to be found and cited" by Google and AI
 * search, so its own site has to get the basics exactly right, every build. Structured
 * data that fails to parse, an FAQ schema that drifts from the visible FAQ, a private
 * tool leaking into the sitemap or llms.txt, or a robots.txt that shuts out an AI search
 * crawler would all fail silently in production. This script makes them fail loudly.
 *
 * HOW: runs automatically after `npm run build` (the "postbuild" npm script), reads the
 * built files in dist/ with plain string parsing (no dependencies), and exits 1 with a
 * list of problems if anything is off. Checks:
 *  - Every JSON-LD block parses; the homepage graph has WebSite, ProfessionalService,
 *    Person and FAQPage nodes with the required fields, and every {"@id"} reference
 *    resolves to a node in the graph.
 *  - Offer prices equal PRICING in src/data/site.js; the address is Vancouver, WA 98683.
 *  - FAQPage questions and answers equal the visible <details> FAQ, word for word.
 *  - Canonicals are the clean URLs; noindex pages and private tools are marked noindex.
 *  - sitemap.xml lists exactly the public pages; robots.txt names every AI crawler,
 *    blocks the private tools and points at the sitemap; llms.txt has the real prices and
 *    never mentions a private tool.
 *  - No em dashes in the built homepage or llms.txt (house style).
 *  - Share card: EVERY built HTML page (Astro pages and the private tools copied from
 *    public/) carries exactly one og:image and twitter:image, both the absolute URL of
 *    the logo card, with width 1200, height 630, alt text and summary_large_image; the
 *    card file itself is a 1200x630 PNG under 300 KB.
 *
 * Usage: node scripts/check-seo.mjs   (from the repo root, after astro build)
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { PRICING, FAQ, CONTACT } from "../src/data/site.js";

const DIST = new URL("../dist/", import.meta.url);
const SITE = "https://justaweb.agency";
const problems = [];
const fail = (msg) => problems.push(msg);
const read = (name) => {
  const u = new URL(name, DIST);
  if (!existsSync(u)) { fail(`missing dist/${name}`); return ""; }
  return readFileSync(u, "utf8");
};

/** Decode the handful of HTML entities Astro emits in text, so we can compare copy. */
const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const text = (html) => decode(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

/** All JSON-LD blocks in a page, parsed. A parse error is reported, not thrown. */
function jsonLd(html, page) {
  const out = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { out.push(JSON.parse(m[1])); } catch (e) { fail(`${page}: JSON-LD does not parse (${e.message})`); }
  }
  if (!out.length) fail(`${page}: no JSON-LD found`);
  return out;
}

/** Collect every {"@id": x} reference (objects with only an @id) anywhere in a value. */
function refs(v, acc = []) {
  if (Array.isArray(v)) v.forEach((x) => refs(x, acc));
  else if (v && typeof v === "object") {
    const keys = Object.keys(v);
    if (keys.length === 1 && keys[0] === "@id") acc.push(v["@id"]);
    else keys.forEach((k) => refs(v[k], acc));
  }
  return acc;
}

const canonicalOf = (html) => (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];

// ---- Homepage -------------------------------------------------------------------
const home = read("index.html");
const [ld] = jsonLd(home, "index.html");
if (ld) {
  if (ld["@context"] !== "https://schema.org") fail("@context is not https://schema.org");
  const graph = ld["@graph"] || [];
  const byType = (t) => graph.find((n) => n["@type"] === t);
  const ids = new Set(graph.map((n) => n["@id"]).filter(Boolean));
  for (const r of refs(graph)) if (!ids.has(r)) fail(`JSON-LD reference ${r} does not resolve`);

  const site = byType("WebSite");
  if (!site || site.url !== `${SITE}/` || !site.name) fail("WebSite node missing or incomplete");

  const biz = byType("ProfessionalService");
  if (!biz) fail("ProfessionalService node missing");
  else {
    for (const k of ["name", "url", "email", "description", "address", "areaServed", "founder", "makesOffer"]) {
      if (!biz[k]) fail(`ProfessionalService.${k} missing`);
    }
    if (biz.email !== CONTACT.email) fail("ProfessionalService.email does not match CONTACT.email");
    const a = biz.address || {};
    if (a.addressLocality !== "Vancouver" || a.addressRegion !== "WA" || a.postalCode !== "98683" || a.streetAddress) {
      fail("address must be Vancouver, WA 98683 with no street address");
    }
    const prices = (biz.makesOffer || []).map((o) => Number(o.price)).sort((x, y) => x - y);
    const want = [PRICING.hosting, PRICING.site].sort((x, y) => x - y);
    if (JSON.stringify(prices) !== JSON.stringify(want)) fail(`offer prices ${prices} do not match PRICING ${want}`);
    if ((biz.makesOffer || []).some((o) => o.priceCurrency !== "USD")) fail("every offer needs priceCurrency USD");
    if (biz.sameAs) fail("sameAs present: only add real, verified profiles (none exist yet)");
  }

  const person = byType("Person");
  if (!person || person.name !== "Blake Goble") fail("founder Person (Blake Goble) missing");

  const faq = byType("FAQPage");
  if (!faq) fail("FAQPage node missing");
  else {
    // Visible FAQ: each <details class="qa"> holds <summary>Q</summary><p>A</p>.
    const visible = [...home.matchAll(/<details class="qa[^"]*"[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>/g)]
      .map((m) => ({ q: text(m[1]), a: text(m[2]) }));
    const marked = faq.mainEntity.map((q) => ({ q: q.name, a: q.acceptedAnswer?.text }));
    if (visible.length !== FAQ.length) fail(`visible FAQ has ${visible.length} items, site.js has ${FAQ.length}`);
    if (marked.length !== visible.length) fail(`FAQPage has ${marked.length} questions, page shows ${visible.length}`);
    marked.forEach((m, i) => {
      const v = visible[i] || {};
      if (m.q !== v.q) fail(`FAQ question ${i + 1} differs from the page: "${m.q}" vs "${v.q}"`);
      if (m.a !== v.a) fail(`FAQ answer ${i + 1} differs from the page`);
    });
  }
}
if (canonicalOf(home) !== `${SITE}/`) fail(`homepage canonical is ${canonicalOf(home)}, want ${SITE}/`);
if (/<meta name="robots" content="noindex/.test(home)) fail("homepage is noindex");
if (text(home.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "")).includes("—")) fail("em dash in homepage copy");

// ---- Other pages -----------------------------------------------------------------
const privacy = read("privacy.html");
if (canonicalOf(privacy) !== `${SITE}/privacy`) fail(`privacy canonical is ${canonicalOf(privacy)}`);
jsonLd(privacy, "privacy.html");
for (const p of ["thank-you.html", "intake-thank-you.html"]) {
  if (!/<meta name="robots" content="noindex/.test(read(p))) fail(`${p} must be noindex`);
}
for (const p of ["intake.html", "contract.html", "audit-results.html"]) {
  if (!/<meta name="robots" content="noindex/i.test(read(p))) fail(`${p} (private tool) must carry a noindex meta tag`);
}

// ---- sitemap.xml -----------------------------------------------------------------
const sitemap = read("sitemap.xml");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const want of [`${SITE}/`, `${SITE}/privacy`]) if (!locs.includes(want)) fail(`sitemap missing ${want}`);
for (const l of locs) if (/intake|contract|audit|thank-you/.test(l)) fail(`sitemap lists a private or noindex page: ${l}`);

// ---- robots.txt ------------------------------------------------------------------
const robots = read("robots.txt");
const BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot",
  "Google-Extended", "Applebot-Extended", "Bingbot", "Googlebot"];
for (const b of BOTS) if (!new RegExp(`^User-agent: ${b}$`, "m").test(robots)) fail(`robots.txt does not name ${b}`);
if (/^Disallow: \/\s*$/m.test(robots)) fail("robots.txt disallows the whole site for some agent");
for (const p of ["/intake", "/contract", "/audit-results"]) {
  // Each group must repeat the private Disallows (a named group ignores the * group).
  const groups = robots.split(/\n\s*\n/).filter((g) => /^User-agent:/m.test(g));
  for (const g of groups) if (!g.includes(`Disallow: ${p}`)) fail(`a robots.txt group is missing Disallow: ${p}`);
}
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail("robots.txt does not point at the sitemap");

// ---- llms.txt --------------------------------------------------------------------
const llms = read("llms.txt");
if (!llms.startsWith("# JustAWeb")) fail("llms.txt must start with '# JustAWeb'");
for (const want of [`$${PRICING.site.toLocaleString("en-US")}`, `$${PRICING.hosting}`, CONTACT.email, "98683"]) {
  if (!llms.includes(want)) fail(`llms.txt missing ${want}`);
}
if (/intake|contract\.html|audit-results/i.test(llms)) fail("llms.txt mentions a private tool");
if (llms.includes("—")) fail("em dash in llms.txt");

// ---- Share card (Open Graph + Twitter) on every page ------------------------------
const OG_URL = `${SITE}/og/justaweb-card.png`;
const meta = (html, attr, key) =>
  [...html.matchAll(new RegExp(`<meta ${attr}="${key.replace(/[:]/g, "\\:")}" content="([^"]*)"`, "g"))].map((m) => m[1]);
for (const file of readdirSync(DIST).filter((f) => f.endsWith(".html"))) {
  const html = read(file);
  const ogImg = meta(html, "property", "og:image");
  const twImg = meta(html, "name", "twitter:image");
  if (ogImg.length !== 1 || ogImg[0] !== OG_URL) fail(`${file}: og:image must appear once as ${OG_URL} (found ${JSON.stringify(ogImg)})`);
  if (twImg.length !== 1 || twImg[0] !== OG_URL) fail(`${file}: twitter:image must appear once as ${OG_URL} (found ${JSON.stringify(twImg)})`);
  if (meta(html, "property", "og:image:width")[0] !== "1200") fail(`${file}: og:image:width must be 1200`);
  if (meta(html, "property", "og:image:height")[0] !== "630") fail(`${file}: og:image:height must be 630`);
  if (!meta(html, "property", "og:image:alt")[0]) fail(`${file}: og:image:alt missing`);
  if (meta(html, "name", "twitter:card")[0] !== "summary_large_image") fail(`${file}: twitter:card must be summary_large_image`);
}
{
  const card = new URL("og/justaweb-card.png", DIST);
  if (!existsSync(card)) fail("dist/og/justaweb-card.png missing");
  else {
    const buf = readFileSync(card);
    // PNG signature, then the IHDR chunk: width and height are big-endian at bytes 16 and 20.
    const isPng = buf.subarray(1, 4).toString() === "PNG";
    if (!isPng || buf.readUInt32BE(16) !== 1200 || buf.readUInt32BE(20) !== 630) fail("share card must be a 1200x630 PNG");
    if (statSync(card).size > 300 * 1024) fail(`share card is ${Math.round(statSync(card).size / 1024)} KB, budget is 300 KB`);
  }
}

// ---- Result ----------------------------------------------------------------------
if (problems.length) {
  console.error(`check-seo: ${problems.length} problem(s)\n - ${problems.join("\n - ")}`);
  process.exit(1);
}
console.log("check-seo: JSON-LD, FAQ match, canonicals, noindex, sitemap, robots.txt, llms.txt and share cards all OK");
