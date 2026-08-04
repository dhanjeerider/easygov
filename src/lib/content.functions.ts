import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type JobRow = {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string;
  department: string;
  category: string;
  qualification: string;
  total_posts: string;
  location: string;
  fee: string;
  age_limit: string;
  last_date: string | null;
  apply_url: string | null;
  notification_url: string | null;
  description: string;
  image_url: string | null;
};

const JOB_COLS =
  "id, slug, title_hi, title_en, department, category, qualification, total_posts, location, fee, age_limit, last_date, apply_url, notification_url, description, image_url";

export type PageRow = { id: string; slug: string; title: string; content: string };
export type MenuPage = { slug: string; title: string };

export const listJobs = createServerFn({ method: "GET" }).handler(async (): Promise<JobRow[]> => {
  const { data } = await publicClient()
    .from("jobs")
    .select(JOB_COLS)
    .eq("is_published", true)
    .order("sort_order")
    .order("created_at", { ascending: false });
  return (data as JobRow[]) ?? [];
});

export const getJob = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<JobRow | null> => {
    const { data: job } = await publicClient()
      .from("jobs")
      .select(JOB_COLS)
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    return (job as JobRow) ?? null;
  });

export const listMenuPages = createServerFn({ method: "GET" }).handler(
  async (): Promise<MenuPage[]> => {
    const { data } = await publicClient()
      .from("pages")
      .select("slug, title")
      .eq("is_published", true)
      .eq("show_in_menu", true)
      .order("sort_order");
    return (data as MenuPage[]) ?? [];
  },
);

export const getPage = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<PageRow | null> => {
    const { data: page } = await publicClient()
      .from("pages")
      .select("id, slug, title, content")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    return (page as PageRow) ?? null;
  });