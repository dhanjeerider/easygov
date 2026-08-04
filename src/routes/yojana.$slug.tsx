import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Globe } from "lucide-react";
import { getScheme, type SchemeLinkRow } from "@/lib/schemes.functions";
import { SchemeIcon } from "@/lib/icon-map";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/yojana/$slug")({
  loader: async ({ params }) => {
    const data = await getScheme({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const s = loaderData?.scheme;
    const title = s ? `${s.title_hi} — ऑफिशियल लिंक | Sarkari Setu` : "योजना | Sarkari Setu";
    const description = s?.description ?? "सरकारी योजना के आधिकारिक लिंक।";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SchemePage,
  errorComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">पेज लोड नहीं हो सका।</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">यह योजना नहीं मिली।</div>
  ),
});

function SchemePage() {
  const { scheme, links } = Route.useLoaderData() as {
    scheme: { slug: string; title_hi: string; title_en: string; description: string; icon: string; category: string; official_url: string | null };
    links: SchemeLinkRow[];
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pt-10">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/">
            <ArrowLeft className="size-4" /> सभी योजनाएँ
          </Link>
        </Button>

        <section className="glass-card overflow-hidden p-0">
          <div className="gradient-hero flex flex-wrap items-center gap-4 px-6 py-8 text-primary-foreground">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/20">
              <SchemeIcon name={scheme.icon} className="size-7" />
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest opacity-80">{scheme.category}</p>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{scheme.title_hi}</h1>
              <p className="text-sm opacity-90">{scheme.title_en}</p>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm leading-relaxed text-muted-foreground">{scheme.description}</p>
            {scheme.official_url && (
              <Button asChild size="sm" className="mt-4">
                <a href={scheme.official_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="size-4" /> ऑफिशियल वेबसाइट
                </a>
              </Button>
            )}
          </div>
        </section>

        <h2 className="mb-3 mt-8 text-lg font-bold tracking-tight">
          उपलब्ध सेवाएँ व लिंक ({links.length})
        </h2>
        <section className="grid gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card lift group flex items-center justify-between gap-3 p-4 hover:lift-hover"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{link.label}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {new URL(link.url).hostname}
                </span>
                {link.note && (
                  <span className="mt-1 block text-xs text-muted-foreground">{link.note}</span>
                )}
              </span>
              <ExternalLink className="size-4 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5" />
            </a>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
