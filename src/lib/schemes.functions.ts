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
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listSchemes = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [{ data: schemes }, { data: links }] = await Promise.all([
    supabase
      .from("schemes")
      .select("id, slug, title_hi, title_en, description, icon, category, official_url")
      .eq("is_published", true)
      .order("sort_order"),
    supabase.from("scheme_links").select("scheme_id"),
  ]);
  const counts = new Map<string, number>();
  for (const l of links ?? []) counts.set(l.scheme_id, (counts.get(l.scheme_id) ?? 0) + 1);
  return (schemes ?? []).map((s) => ({ ...s, link_count: counts.get(s.id) ?? 0 }));
});

export const getScheme = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: scheme } = await supabase
      .from("schemes")
      .select("id, slug, title_hi, title_en, description, icon, category, official_url")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!scheme) return null;
    const { data: links } = await supabase
      .from("scheme_links")
      .select("id, label, url, note")
      .eq("scheme_id", scheme.id)
      .order("sort_order");
    return { scheme, links: links ?? [] };
  });
