import { useSEO } from "../lib/seo";
import { BLOG_POSTS } from "../content/blogPosts";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Blog() {
  useSEO({
    title: "Blog",
    description:
      "Notes on resume screening, explainable AI hiring, and building a shortlist you can actually defend — from the team building ResumeMatch.",
    path: "/blog",
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors">
      <SiteHeader />
      <main className="w-full pt-32 pb-24 px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-[var(--color-text)] mb-3">
            Blog
          </h1>
          <p className="text-[var(--color-text-muted)] mb-12 max-w-xl">
            Notes on resume screening, explainable AI hiring, and building a shortlist you can
            actually defend.
          </p>

          <div className="space-y-5">
            {BLOG_POSTS.map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="clay-card value-card block p-7"
              >
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-faint)] mb-3">
                  <span>{formatDate(post.date)}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="font-heading text-xl font-bold text-[var(--color-text)] mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {post.excerpt}
                </p>
              </a>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
