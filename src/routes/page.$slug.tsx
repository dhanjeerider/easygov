import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPage, type PageRow } from "@/lib/content.functions";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/page/$slug")({
  loader: async ({ params }) => {
    const page = await getPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => {
    const p = loaderData as PageRow | undefined;
    const title = p ? `${p.title} | Sarkari Setu` : "पेज | Sarkari Setu";
    const description = (p?.content ?? "").slice(0, 150) || "Sarkari Setu पेज।";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: PageView,
  errorComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">पेज लोड नहीं हो सका।</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">यह पेज नहीं मिला।</div>
  ),
});

function PageView() {
  const page = Route.useLoaderData() as PageRow;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-9">
        <h1 className="text-2xl font-semibold tracking-tight">{page.title}</h1>
        <div className="panel mt-5 whitespace-pre-line p-5 text-sm leading-relaxed text-muted-foreground">
          {page.content}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}