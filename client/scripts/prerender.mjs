// Build-time prerender. The app is a client-rendered SPA and Vercel serves the
// same index.html for every URL, so crawlers that don't run JavaScript (most
// AI crawlers, link-preview bots) would otherwise see an empty shell with the
// homepage's canonical on every page. This renders each public route with the
// real React components and writes it to dist/<route>/index.html with that
// route's own title, description, canonical, social tags and JSON-LD. It also
// generates sitemap.xml, llms.txt and llms-full.txt from the same route and
// blog data so they can't drift from the site.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE = "https://resumematch.co.in";
const TEMPLATE_PATH = join(dist, "index.html");

if (!existsSync(TEMPLATE_PATH)) {
  console.error("prerender: dist/index.html not found — run `vite build` first.");
  process.exit(1);
}
const template = readFileSync(TEMPLATE_PATH, "utf-8");

const vite = await createServer({
  root,
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

const warnings = [];
const warn = (msg) => {
  warnings.push(msg);
  console.warn(`prerender: ${msg}`);
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setMeta(html, attr, key, content, route) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`);
  if (!re.test(html)) {
    warn(`${route}: <meta ${attr}="${key}"> not found in template`);
    return html;
  }
  return html.replace(re, () => `<meta ${attr}="${key}" content="${esc(content)}" />`);
}

const SEO_PAGES = ["/free-resume-screening-software", "/explainable-ai-resume-screening", "/ats-alternative-for-recruiters"];

const { BLOG_POSTS } = await vite.ssrLoadModule("/src/content/blogPosts.js");

const routes = [
  { path: "/", component: "Home", priority: "1.0", changefreq: "weekly" },
  { path: "/demo", component: "PublicDemo", priority: "0.9", changefreq: "weekly", optional: true },
  { path: "/resume-parser", component: "ResourcePage", props: { type: "parser" }, priority: "0.9", changefreq: "monthly" },
  { path: "/docs", component: "ResourcePage", props: { type: "docs" }, priority: "0.8", changefreq: "monthly" },
  ...SEO_PAGES.map((path) => ({ path, component: "SeoLandingPage", props: { path }, priority: "0.8", changefreq: "monthly" })),
  { path: "/blog", component: "Blog", priority: "0.8", changefreq: "weekly" },
  ...BLOG_POSTS.map((p) => ({
    path: `/blog/${p.slug}`,
    component: "BlogPost",
    props: { slug: p.slug },
    priority: "0.7",
    changefreq: "monthly",
    lastmod: p.date,
  })),
  { path: "/privacy", component: "LegalPage", props: { page: "privacy" }, priority: "0.3", changefreq: "monthly" },
  { path: "/terms", component: "LegalPage", props: { page: "terms" }, priority: "0.3", changefreq: "monthly" },
];

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ResumeMatch",
  url: `${SITE}/`,
  logo: `${SITE}/favicon.svg`,
  description:
    "ResumeMatch builds explainable AI resume screening software for recruiters, HR teams and staffing agencies.",
};
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ResumeMatch",
  url: `${SITE}/`,
  inLanguage: "en",
};

function jsonLdTag(schema) {
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

function buildPage(route, bodyHtml, collected) {
  let html = template;
  const seo = collected.seo;
  if (!seo) {
    warn(`${route.path}: component did not call useSEO — using template defaults`);
  } else {
    const fullTitle = seo.title ? `${seo.title} | ResumeMatch` : "ResumeMatch — Explainable AI Resume Screening";
    const url = `${SITE}${seo.path ?? route.path}`;
    const image = (seo.image ?? "/og-image.png").startsWith("http") ? seo.image : `${SITE}${seo.image ?? "/og-image.png"}`;
    html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(fullTitle)}</title>`);
    if (seo.description) {
      html = setMeta(html, "name", "description", seo.description, route.path);
      html = setMeta(html, "property", "og:description", seo.description, route.path);
      html = setMeta(html, "name", "twitter:description", seo.description, route.path);
    }
    html = setMeta(html, "property", "og:title", fullTitle, route.path);
    html = setMeta(html, "name", "twitter:title", fullTitle, route.path);
    html = setMeta(html, "property", "og:type", seo.type ?? "website", route.path);
    html = setMeta(html, "property", "og:url", url, route.path);
    html = setMeta(html, "property", "og:image", image, route.path);
    html = setMeta(html, "name", "twitter:image", image, route.path);
    const canonicalRe = /<link rel="canonical" href="[^"]*"\s*\/?>/;
    if (!canonicalRe.test(html)) warn(`${route.path}: canonical link not found in template`);
    html = html.replace(canonicalRe, () => `<link rel="canonical" href="${esc(url)}" />`);
  }

  const schemas = [...collected.jsonLd];
  if (route.path === "/") {
    schemas.push(ORG_SCHEMA, WEBSITE_SCHEMA);
  } else {
    // The template ships a homepage SoftwareApplication block; other routes
    // carry their own schema, so drop it rather than duplicate it.
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/, "");
  }
  if (schemas.length) {
    html = html.replace("</head>", () => `${schemas.map(jsonLdTag).join("\n    ")}\n  </head>`);
  }

  if (bodyHtml) {
    if (!html.includes('<div id="root"></div>')) warn(`${route.path}: empty #root not found in template`);
    html = html.replace('<div id="root"></div>', () => `<div id="root">${bodyHtml}</div>`);
  }
  return html;
}

function writeRoute(routePath, html) {
  const outDir = routePath === "/" ? dist : join(dist, routePath);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
}

const failedCritical = [];
let rendered = 0;

for (const route of routes) {
  const collected = { seo: null, jsonLd: [] };
  globalThis.__SEO_COLLECTOR__ = collected;
  let bodyHtml = "";
  try {
    const mod = await vite.ssrLoadModule(`/src/components/${route.component}.jsx`);
    bodyHtml = renderToString(createElement(mod.default, route.props ?? {}));
    rendered++;
  } catch (err) {
    warn(`${route.path}: render failed (${err.message}) — writing head-only HTML`);
    if (!route.optional) failedCritical.push(route.path);
  }
  writeRoute(route.path, buildPage(route, bodyHtml, collected));
}
globalThis.__SEO_COLLECTOR__ = undefined;

// ---- sitemap.xml ----
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes
    .map(
      (r) =>
        `  <url><loc>${SITE}${r.path === "/" ? "/" : r.path}</loc>` +
        (r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : "") +
        `<changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
    )
    .join("\n") +
  `\n</urlset>\n`;
writeFileSync(join(dist, "sitemap.xml"), sitemap);

// ---- llms.txt / llms-full.txt ----
const sortedPosts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

const SUMMARY =
  "ResumeMatch is a free, explainable AI resume screening tool for recruiters, HR teams and staffing agencies. " +
  "Paste a job description, upload PDF or DOCX resumes, and get a ranked shortlist showing matched, missing and implied skills with evidence from each resume, not a black-box score. " +
  "Matching runs on local embedding models on ResumeMatch's own servers rather than a per-resume paid AI API, and it works across many hiring domains, not just software roles.";

const llms = `# ResumeMatch

> ${SUMMARY}

## Key facts

- Free during early access; the public demo at ${SITE}/demo needs no signup.
- Accepts PDF and DOCX resumes and compares them to a pasted job description.
- Every match lists matched skills, missing skills, and implied skills (with the supporting resume sentence).
- ResumeMatch is a prioritization aid, not an automatic hiring decision. Recruiters should review the underlying resume and apply consistent human review.

## Core pages

- [Homepage](${SITE}/): product overview and FAQ
- [Free demo](${SITE}/demo): try explainable matching without signing up
- [Resume parser](${SITE}/resume-parser): PDF/DOCX parsing and skill extraction
- [Documentation](${SITE}/docs): how scoring and matching work
- [Free resume screening software](${SITE}/free-resume-screening-software)
- [Explainable AI resume screening](${SITE}/explainable-ai-resume-screening)
- [ATS alternative for recruiters](${SITE}/ats-alternative-for-recruiters)

## Blog

${sortedPosts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.description}`).join("\n")}

## Optional

- [Privacy policy](${SITE}/privacy)
- [Terms of service](${SITE}/terms)
`;
writeFileSync(join(dist, "llms.txt"), llms);

function postToText(p) {
  const body = p.content
    .map((b) => (b.type === "h2" ? `\n## ${b.text}\n` : b.type === "ul" ? b.items.map((i) => `- ${i}`).join("\n") : b.text))
    .join("\n\n");
  return `# ${p.title}\n\nURL: ${SITE}/blog/${p.slug}\nPublished: ${p.date}\n\n${body}`;
}
const llmsFull = `# ResumeMatch: full content\n\n> ${SUMMARY}\n\n${sortedPosts.map(postToText).join("\n\n---\n\n")}\n`;
writeFileSync(join(dist, "llms-full.txt"), llmsFull);

await vite.close();

console.log(
  `prerender: ${rendered}/${routes.length} routes rendered, ${BLOG_POSTS.length} blog posts, sitemap + llms.txt + llms-full.txt written` +
    (warnings.length ? `, ${warnings.length} warning(s)` : "")
);
if (failedCritical.length) {
  console.error(`prerender: critical routes failed to render: ${failedCritical.join(", ")}`);
  process.exit(1);
}
