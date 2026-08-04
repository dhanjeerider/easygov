import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { listSchemes, type SchemeSummary } from "@/lib/schemes.functions";
import { SchemeIcon } from "@/lib/icon-map";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sarkari Setu — सरकारी योजना और ऑफिशियल लिंक डायरेक्टरी" },
      {
        name: "description",
        content:
          "आधार, पैन, राशन कार्ड, PM Kisan, आयुष्मान, ई-श्रम, भू-नक्शा और PF जैसी सरकारी सेवाओं के 150+ आधिकारिक लिंक एक ही जगह।",
      },
      { property: "og:title", content: "Sarkari Setu — सरकारी योजना व लिंक डायरेक्टरी" },
      {
        property: "og:description",
        content: "हर सरकारी योजना का ऑफिशियल लिंक — सत्यापित, व्यवस्थित और तेज़।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => listSchemes(),
  component: Index,
  errorComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">डेटा लोड नहीं हो सका।</div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

const TINTS = ["tint-1", "tint-2", "tint-3", "tint-4", "tint-5", "tint-6"];

function Index() {
  const schemes = Route.useLoaderData() as SchemeSummary[];
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schemes;
    return schemes.filter((s) =>
      [s.title_hi, s.title_en, s.description, s.category].join(" ").toLowerCase().includes(q),
    );
  }, [query, schemes]);

  const totalLinks = schemes.reduce((sum, s) => sum + s.link_count, 0);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4">
        <section className="border-b border-border py-9">
          <h1 className="max-w-2xl text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
            हर सरकारी योजना का <span className="text-primary">ऑफिशियल लिंक</span>, एक जगह
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {schemes.length} सेवाएँ · {totalLinks} आधिकारिक लिंक — आधार, पैन, राशन कार्ड, PM Kisan,
            आयुष्मान, ई-श्रम, भू-नक्शा और PF।
          </p>

          <div className="mt-5 flex max-w-md items-center gap-2 rounded-md border border-input bg-surface px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="योजना या सेवा खोजें… जैसे: राशन कार्ड"
              aria-label="योजना खोजें"
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </section>

        <section className="grid gap-3 py-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scheme, i) => (
            <Link
              key={scheme.id}
              to="/yojana/$slug"
              params={{ slug: scheme.slug }}
              className={`${TINTS[i % TINTS.length]} panel group flex items-start gap-3 p-3.5 transition-colors hover:bg-surface`}
            >
              <span className="tint-chip flex size-9 shrink-0 items-center justify-center rounded-md">
                <SchemeIcon name={scheme.icon} className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{scheme.title_hi}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {scheme.title_en} · {scheme.link_count} लिंक
                </span>
              </span>
              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              कोई योजना नहीं मिली।
            </p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
