import { getPostBySlug } from "../content/blogPosts";
import { useSEO } from "../lib/seo";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Block({ block }) {
  if (block.type === "h2") {
    return (
      <h2 className="font-heading text-xl font-bold tracking-tight text-[var(--color-text)] mt-10 mb-3">
        {block.text}
      </h2>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="list-disc list-outside pl-5 space-y-2 mb-4 text-[var(--color-text-muted)]">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-[var(--color-text-muted)] leading-relaxed mb-4">{block.text}</p>;
}

export default function BlogPost({ slug }) {
  const post = getPostBySlug(slug);

  useSEO({
    title: post ? post.title : "Post not found",
    description: post ? post.description : "This post doesn't exist.",
    path: `/blog/${slug}`,
  });

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] transition-colors">
        <SiteHeader />
        <main className="w-full pt-32 pb-24 px-6 md:px-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-4">
            Post not found
          </h1>
          <a href="/blog" className="text-[var(--color-accent)] hover:underline">
            ← Back to the blog
          </a>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] transition-colors">
      <SiteHeader />
      <main className="w-full pt-32 pb-24 px-6 md:px-16">
        <article className="max-w-2xl mx-auto">
          <a
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-faint)] hover:text-[var(--color-accent)] transition mb-6"
          >
            ← All posts
          </a>
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-faint)] mb-4">
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text)] mb-8 text-balance">
            {post.title}
          </h1>
          <div>
            {post.content.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--color-border)]/60">
            <a
              href="/demo"
              className="clay-button inline-flex items-center gap-2 bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] px-6 py-3 rounded-full font-heading font-medium text-sm"
            >
              Try ResumeMatch on your own JD
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
