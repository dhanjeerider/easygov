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
    scheme: {
      slug: string;
      title_hi: string;
      title_en: string;
      description: string;
      icon: string;
      category: string;
      official_url: string | null;
    };
    links: SchemeLinkRow[];
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> सभी योजनाएँ
        </Link>

        <section className="mt-4 flex flex-wrap items-start gap-3 border-b border-border pb-6">
          <span className="tint-chip flex size-11 items-center justify-center rounded-md">
            <SchemeIcon name={scheme.icon} className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{scheme.category}</p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{scheme.title_hi}</h1>
            <p className="text-sm text-muted-foreground">{scheme.title_en}</p>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{scheme.description}</p>
            {scheme.official_url && (
              <Button asChild size="sm" variant="outline" className="mt-3">
                <a href={scheme.official_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="size-4" /> ऑफिशियल वेबसाइट
                </a>
              </Button>
            )}
          </div>
        </section>

        <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          सेवाएँ व लिंक ({links.length})
        </h2>
        <section className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link, i) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`tint-${(i % 6) + 1} panel group flex items-center justify-between gap-3 p-3 transition-colors hover:bg-surface`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{link.label}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {new URL(link.url).hostname}
                </span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-primary" />
            </a>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
