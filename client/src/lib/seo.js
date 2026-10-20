import { useEffect } from "react";

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// Updates document title, description, canonical, and OG/Twitter tags for the
// current route. index.html already ships sensible defaults for crawlers that
// don't execute JS; this keeps them in sync once React mounts and handles
// per-route values for anything that does render JS (Google, social share
// unfurls, etc).
export function useSEO({ title, description, path = "/", image = "/og-image.png", type = "website" }) {
  // During build-time prerender (scripts/prerender.mjs) there is no document;
  // hand the page's metadata to the collector so it can be written into the
  // static HTML head for crawlers that don't run JavaScript.
  if (typeof document === "undefined" && globalThis.__SEO_COLLECTOR__) {
    globalThis.__SEO_COLLECTOR__.seo = { title, description, path, image, type };
  }
  useEffect(() => {
    const fullTitle = title ? `${title} | ResumeMatch` : "ResumeMatch — Explainable AI Resume Screening";
    document.title = fullTitle;
    const url = `https://resumematch.co.in${path}`;

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:type", type);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("property", "og:image", image.startsWith("http") ? image : `https://resumematch.co.in${image}`);
    setMeta("name", "twitter:image", image.startsWith("http") ? image : `https://resumematch.co.in${image}`);
    setMeta("property", "og:url", url);
    setCanonical(url);
  }, [title, description, path, image, type]);
}

// Injects a JSON-LD schema block scoped to the current page, removing it on
// unmount so it doesn't leak into other routes in this single-page app.
export function useJsonLd(schema) {
  if (typeof document === "undefined" && schema && globalThis.__SEO_COLLECTOR__) {
    globalThis.__SEO_COLLECTOR__.jsonLd.push(schema);
  }
  useEffect(() => {
    if (!schema) return;
    // The prerendered HTML already carries this block; adding it again would
    // leave duplicate structured data in the DOM once React mounts.
    const key = JSON.stringify(schema);
    const alreadyPresent = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some((node) => {
      try {
        return JSON.stringify(JSON.parse(node.textContent)) === key;
      } catch {
        return false;
      }
    });
    if (alreadyPresent) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(schema);
    document.head.appendChild(el);
    return () => el.remove();
  }, [schema]);
}
