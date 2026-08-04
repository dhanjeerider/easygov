import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeIndianRupee,
  CalendarDays,
  ExternalLink,
  FileDown,
  GraduationCap,
  MapPin,
  Timer,
  Users,
} from "lucide-react";
import { getJob, type JobRow } from "@/lib/content.functions";
import { SchemeAvatar } from "@/lib/icon-map";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/naukri/$slug")({
  loader: async ({ params }) => {
    const job = await getJob({ data: { slug: params.slug } });
    if (!job) throw notFound();
    return job;
  },
  head: ({ loaderData }) => {
    const j = loaderData as JobRow | undefined;
    const title = j ? `${j.title_hi} भर्ती — आवेदन लिंक | Sarkari Setu` : "भर्ती | Sarkari Setu";
    const description = j?.description || `${j?.department ?? ""} भर्ती की पूरी जानकारी।`;
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
  component: JobPage,
  errorComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">पेज लोड नहीं हो सका।</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">यह भर्ती नहीं मिली।</div>
  ),
});

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("hi-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function JobPage() {
  const job = Route.useLoaderData() as JobRow;

  const facts = [
    { icon: Users, label: "कुल पद", value: job.total_posts },
    { icon: GraduationCap, label: "योग्यता", value: job.qualification },
    { icon: MapPin, label: "स्थान", value: job.location },
    { icon: Timer, label: "आयु सीमा", value: job.age_limit },
    { icon: BadgeIndianRupee, label: "आवेदन शुल्क", value: job.fee },
    { icon: CalendarDays, label: "आखिरी तारीख", value: job.last_date ? fmt(job.last_date) : "" },
  ].filter((f) => f.value);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pt-6">
        <Link
          to="/naukri"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> सभी नौकरियाँ
        </Link>

        <header className="mt-4 flex items-start gap-3.5 border-b border-border pb-6">
          <SchemeAvatar
            icon="Briefcase"
            image={job.image_url}
            alt={job.title_hi}
            className="size-12"
            iconClassName="size-6"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{job.title_hi}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {job.department} {job.title_en && `· ${job.title_en}`}
            </p>
          </div>
        </header>

        {job.description && (
          <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {job.description}
          </p>
        )}

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((f, i) => (
            <div key={f.label} className={`tint-${(i % 6) + 1} panel flex items-center gap-3 p-3.5`}>
              <span className="tint-chip flex size-9 shrink-0 items-center justify-center rounded-md">
                <f.icon className="size-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{f.label}</span>
                <span className="block truncate text-sm font-semibold">{f.value}</span>
              </span>
            </div>
          ))}
        </section>

        <section className="mt-6 flex flex-wrap gap-2">
          {job.apply_url && (
            <Button asChild>
              <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" /> ऑनलाइन आवेदन करें
              </a>
            </Button>
          )}
          {job.notification_url && (
            <Button asChild variant="outline">
              <a href={job.notification_url} target="_blank" rel="noopener noreferrer">
                <FileDown className="size-4" /> नोटिफिकेशन देखें
              </a>
            </Button>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}