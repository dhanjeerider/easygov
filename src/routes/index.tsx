import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Link2, Search, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { listSchemes, type SchemeSummary } from "@/lib/schemes.functions";
import { SchemeIcon } from "@/lib/icon-map";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const SPAN = [
  "md:col-span-4 md:row-span-2",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-3",
  "md:col-span-3",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
];

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
  const categories = new Set(schemes.map((s) => s.category)).size;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4">
        <section className="pb-10 pt-14 text-center sm:pt-20">
          <span className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
            <Sparkles className="size-3.5 text-primary" />
            {totalLinks}+ सत्यापित सरकारी लिंक
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            हर <span className="gradient-text">सरकारी योजना</span> का
            <br className="hidden sm:block" /> ऑफिशियल लिंक, एक जगह
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            आधार, पैन, राशन कार्ड, PM Kisan, आयुष्मान, ई-श्रम, भू-नक्शा और PF — बिना भटके सीधे
            सरकारी वेबसाइट तक पहुँचें।
          </p>

          <div className="glass-card mx-auto mt-8 flex max-w-xl items-center gap-2 p-2">
            <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="योजना या सेवा खोजें… जैसे: राशन कार्ड"
              aria-label="योजना खोजें"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-6">
          {filtered.map((scheme, i) => (
            <Link
              key={scheme.id}
              to="/yojana/$slug"
              params={{ slug: scheme.slug }}
              className={`glass-card lift group flex flex-col justify-between p-5 hover:lift-hover ${
                query ? "md:col-span-2" : (SPAN[i % SPAN.length] ?? "md:col-span-2")
              }`}
            >
              <div>
                <span className="gradient-accent mb-4 inline-flex size-11 items-center justify-center rounded-2xl text-accent-foreground">
                  <SchemeIcon name={scheme.icon} className="size-5" />
                </span>
                <h2 className="text-lg font-bold tracking-tight">{scheme.title_hi}</h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">
                  {scheme.title_en}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {scheme.description}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Link2 className="size-3.5" /> {scheme.link_count} लिंक
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  खोलें <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              कोई योजना नहीं मिली।
            </p>
          )}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Link2, value: `${totalLinks}+`, label: "आधिकारिक लिंक" },
            { icon: ShieldCheck, value: `${schemes.length}`, label: "योजनाएँ व सेवाएँ" },
            { icon: Zap, value: `${categories}`, label: "श्रेणियाँ" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card flex items-center gap-4 p-5">
              <span className="gradient-hero flex size-11 items-center justify-center rounded-2xl text-primary-foreground">
                <stat.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-extrabold leading-none">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="glass-card mt-6 overflow-hidden p-0">
          <div className="gradient-hero px-6 py-12 text-center text-primary-foreground sm:px-12">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              सही लिंक ढूँढने में समय बर्बाद न करें
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm opacity-90">
              हर सेवा का सीधा सरकारी पोर्टल लिंक — नियमित रूप से जाँचा और अपडेट किया जाता है।
            </p>
            <Button asChild variant="secondary" size="lg" className="mt-6">
              <a href="#top">सभी योजनाएँ देखें</a>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
