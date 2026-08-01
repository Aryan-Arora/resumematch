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
export function useSEO({ title, description, path = "/" }) {
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
    setMeta("name", "twitter:title", fullTitle);
    setMeta("property", "og:url", url);
    setCanonical(url);
  }, [title, description, path]);
}
