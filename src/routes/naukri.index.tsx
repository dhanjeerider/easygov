import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BriefcaseBusiness, CalendarDays, ChevronRight, MapPin, Search, Users } from "lucide-react";
import { listJobs, type JobRow } from "@/lib/content.functions";
import { SchemeAvatar } from "@/lib/icon-map";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/naukri/")({
  head: () => ({
    meta: [
      { title: "सरकारी नौकरी 2026 — लेटेस्ट भर्ती | Sarkari Setu" },
      {
        name: "description",
        content:
          "नई सरकारी भर्तियाँ, पद संख्या, योग्यता, आखिरी तारीख और सीधा आवेदन लिंक — एक ही जगह हिंदी में।",
      },
      { property: "og:title", content: "सरकारी नौकरी — लेटेस्ट भर्ती | Sarkari Setu" },
      { property: "og:description", content: "लेटेस्ट सरकारी भर्तियाँ और आवेदन लिंक।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => listJobs(),
  component: JobsPage,
  errorComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">नौकरियाँ लोड नहीं हो सकीं।</div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

const TINTS = ["tint-1", "tint-2", "tint-3", "tint-4", "tint-5", "tint-6"];

export function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("hi-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function JobsPage() {
  const jobs = Route.useLoaderData() as JobRow[];
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      [j.title_hi, j.title_en, j.department, j.category, j.qualification, j.location]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [jobs, query]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4">
        <section className="border-b border-border py-9">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <BriefcaseBusiness className="size-6 text-primary" /> सरकारी नौकरी
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {jobs.length} भर्तियाँ — योग्यता, पद संख्या, आखिरी तारीख और सीधा आवेदन लिंक।
          </p>
          <div className="mt-5 flex max-w-md items-center gap-2 rounded-md border border-input bg-surface px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="भर्ती खोजें… जैसे: रेलवे, पुलिस"
              aria-label="भर्ती खोजें"
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </section>

        <section className="grid gap-3 py-7 sm:grid-cols-2">
          {filtered.map((job, i) => (
            <Link
              key={job.id}
              to="/naukri/$slug"
              params={{ slug: job.slug }}
              className={`${TINTS[i % TINTS.length]} panel group flex items-start gap-3 p-3.5 transition-colors hover:bg-surface`}
            >
              <SchemeAvatar icon="Briefcase" image={job.image_url} alt={job.title_hi} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{job.title_hi}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {job.department || job.category}
                </span>
                <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  {job.total_posts && (
                    <span className="flex items-center gap-1">
                      <Users className="size-3" /> {job.total_posts} पद
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {job.location}
                    </span>
                  )}
                  {job.last_date && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3" /> {formatDate(job.last_date)}
                    </span>
                  )}
                </span>
              </span>
              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              अभी कोई भर्ती नहीं है।
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}