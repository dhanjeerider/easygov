import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, Plus, Save, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ICON_NAMES, SchemeIcon } from "@/lib/icon-map";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Panel | Sarkari Setu" },
      { name: "description", content: "योजनाएँ और आधिकारिक लिंक मैनेज करें।" },
      { property: "og:title", content: "Admin Panel | Sarkari Setu" },
      { property: "og:description", content: "योजनाएँ और लिंक मैनेज करें।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
  errorComponent: () => <div className="p-10 text-center">Admin पैनल लोड नहीं हुआ।</div>,
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

type Scheme = {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string;
  description: string;
  icon: string;
  category: string;
  official_url: string | null;
  is_published: boolean;
  sort_order: number;
};

type SchemeLink = { id: string; scheme_id: string; label: string; url: string; note: string | null };

const EMPTY: Omit<Scheme, "id"> = {
  slug: "",
  title_hi: "",
  title_en: "",
  description: "",
  icon: "FileText",
  category: "",
  official_url: "",
  is_published: true,
  sort_order: 100,
};

function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [links, setLinks] = useState<SchemeLink[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Scheme, "id">>(EMPTY);
  const [newLink, setNewLink] = useState({ label: "", url: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("schemes")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setSchemes((data as Scheme[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selected) {
      setLinks([]);
      return;
    }
    void supabase
      .from("scheme_links")
      .select("id, scheme_id, label, url, note")
      .eq("scheme_id", selected)
      .order("sort_order")
      .then(({ data }) => setLinks((data as SchemeLink[]) ?? []));
  }, [selected]);

  const pick = (scheme: Scheme) => {
    setSelected(scheme.id);
    const { id: _id, ...rest } = scheme;
    setForm({ ...rest, description: rest.description ?? "", official_url: rest.official_url ?? "" });
  };

  const reset = () => {
    setSelected(null);
    setForm(EMPTY);
  };

  const saveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      description: form.description,
      official_url: form.official_url || null,
    };
    const res = selected
      ? await supabase.from("schemes").update(payload).eq("id", selected)
      : await supabase.from("schemes").insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(selected ? "योजना अपडेट हुई" : "नई योजना जुड़ गई");
    reset();
    void load();
  };

  const removeScheme = async (id: string) => {
    const { error } = await supabase.from("schemes").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("योजना हटाई गई");
    if (selected === id) reset();
    void load();
  };

  const addLink = async () => {
    if (!selected || !newLink.label || !newLink.url) return;
    const { data, error } = await supabase
      .from("scheme_links")
      .insert({ scheme_id: selected, label: newLink.label, url: newLink.url, sort_order: links.length })
      .select("id, scheme_id, label, url, note")
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    setLinks((prev) => [...prev, data as SchemeLink]);
    setNewLink({ label: "", url: "" });
  };

  const removeLink = async (id: string) => {
    const { error } = await supabase.from("scheme_links").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (loading) {
    return <div className="p-16 text-center text-sm text-muted-foreground">लोड हो रहा है…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="glass-card mx-auto mt-20 max-w-md p-8 text-center">
          <h1 className="text-xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            आपके खाते के पास admin अधिकार नहीं हैं।
          </p>
          <Button onClick={signOut} variant="secondary" className="mt-5">
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">योजनाएँ और लिंक मैनेज करें</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={reset}>
              <Plus className="size-4" /> नई योजना
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <section className="glass-card max-h-[70vh] overflow-y-auto p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              सभी योजनाएँ ({schemes.length})
            </h2>
            <ul className="space-y-2">
              {schemes.map((s) => (
                <li
                  key={s.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                    selected === s.id ? "border-primary bg-primary/5" : "border-border bg-white/40"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => pick(s)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="gradient-accent flex size-9 shrink-0 items-center justify-center rounded-xl text-accent-foreground">
                      <SchemeIcon name={s.icon} className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{s.title_hi}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.title_en} · {s.is_published ? "published" : "draft"}
                      </span>
                    </span>
                  </button>
                  <Button size="icon" variant="ghost" onClick={() => removeScheme(s.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-5">
            <form onSubmit={saveScheme} className="glass-card space-y-4 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {selected ? "योजना संपादित करें" : "नई योजना जोड़ें"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>शीर्षक (हिंदी)</Label>
                  <Input
                    required
                    value={form.title_hi}
                    onChange={(e) => setForm({ ...form, title_hi: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Title (English)</Label>
                  <Input
                    required
                    value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Icon</Label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {ICON_NAMES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Official URL</Label>
                <Input
                  type="url"
                  value={form.official_url ?? ""}
                  onChange={(e) => setForm({ ...form, official_url: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>विवरण</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_published}
                  onCheckedChange={(v) => setForm({ ...form, is_published: v })}
                />
                <Label>Published</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  <Save className="size-4" /> सेव करें
                </Button>
                {selected && (
                  <Button type="button" variant="ghost" onClick={reset}>
                    <X className="size-4" /> रद्द करें
                  </Button>
                )}
              </div>
            </form>

            {selected && (
              <div className="glass-card space-y-3 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  लिंक ({links.length})
                </h2>
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-white/40 p-3"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{l.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{l.url}</span>
                      </span>
                      <Button size="icon" variant="ghost" onClick={() => removeLink(l.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                  <Input
                    placeholder="लेबल"
                    value={newLink.label}
                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  />
                  <Input
                    placeholder="https://…"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  />
                  <Button type="button" onClick={addLink}>
                    <Plus className="size-4" /> जोड़ें
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
