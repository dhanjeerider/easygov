import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BriefcaseBusiness, FileText, LayoutGrid, LogOut, Plus, Save, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ICON_NAMES, SchemeAvatar } from "@/lib/icon-map";
import { SiteHeader } from "@/components/site/site-header";
import { ImageUpload } from "@/components/site/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Panel | Sarkari Setu" },
      { name: "description", content: "योजनाएँ, नौकरियाँ, पेज और लिंक मैनेज करें।" },
      { property: "og:title", content: "Admin Panel | Sarkari Setu" },
      { property: "og:description", content: "कंटेंट मैनेजमेंट पैनल।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
  errorComponent: () => <div className="p-10 text-center">Admin पैनल लोड नहीं हुआ।</div>,
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

const slugify = (s: string, fallback: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `${fallback}-${Date.now()}`;

type Scheme = {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string;
  description: string;
  icon: string;
  category: string;
  official_url: string | null;
  image_url: string | null;
  is_published: boolean;
  sort_order: number;
};

type SchemeLink = { id: string; scheme_id: string; label: string; url: string; note: string | null };

type Job = {
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
  is_published: boolean;
};

type Page = {
  id: string;
  slug: string;
  title: string;
  content: string;
  show_in_menu: boolean;
  is_published: boolean;
};

const EMPTY_SCHEME: Omit<Scheme, "id"> = {
  slug: "",
  title_hi: "",
  title_en: "",
  description: "",
  icon: "FileText",
  category: "",
  official_url: "",
  image_url: null,
  is_published: true,
  sort_order: 100,
};

const EMPTY_JOB: Omit<Job, "id"> = {
  slug: "",
  title_hi: "",
  title_en: "",
  department: "",
  category: "सरकारी नौकरी",
  qualification: "",
  total_posts: "",
  location: "",
  fee: "",
  age_limit: "",
  last_date: null,
  apply_url: "",
  notification_url: "",
  description: "",
  image_url: null,
  is_published: true,
};

const EMPTY_PAGE: Omit<Page, "id"> = {
  slug: "",
  title: "",
  content: "",
  show_in_menu: true,
  is_published: true,
};

function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();

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
        <div className="panel mx-auto mt-20 max-w-md p-8 text-center">
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
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">योजनाएँ, नौकरियाँ और पेज मैनेज करें</p>
          </div>
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>

        <Tabs defaultValue="schemes">
          <TabsList>
            <TabsTrigger value="schemes">
              <LayoutGrid className="size-4" /> योजनाएँ
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <BriefcaseBusiness className="size-4" /> नौकरियाँ
            </TabsTrigger>
            <TabsTrigger value="pages">
              <FileText className="size-4" /> पेज
            </TabsTrigger>
          </TabsList>
          <TabsContent value="schemes" className="mt-5">
            <SchemesTab />
          </TabsContent>
          <TabsContent value="jobs" className="mt-5">
            <JobsTab />
          </TabsContent>
          <TabsContent value="pages" className="mt-5">
            <PagesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function SchemesTab() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [links, setLinks] = useState<SchemeLink[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Scheme, "id">>(EMPTY_SCHEME);
  const [newLink, setNewLink] = useState({ label: "", url: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("schemes").select("*").order("sort_order");
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
    setForm(EMPTY_SCHEME);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      slug: slugify(form.slug || form.title_en || form.title_hi, "scheme"),
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

  const remove = async (id: string) => {
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

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
      <section className="panel max-h-[70vh] overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            योजनाएँ ({schemes.length})
          </h2>
          <Button size="sm" variant="secondary" onClick={reset}>
            <Plus className="size-4" /> नई
          </Button>
        </div>
        <ul className="space-y-2">
          {schemes.map((s) => (
            <li
              key={s.id}
              className={`flex items-center gap-3 rounded-md border p-3 ${selected === s.id ? "border-primary bg-surface" : "border-border bg-card"}`}
            >
              <button
                type="button"
                onClick={() => pick(s)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <SchemeAvatar icon={s.icon} image={s.image_url} alt={s.title_hi} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{s.title_hi}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {s.title_en} · {s.is_published ? "published" : "draft"}
                  </span>
                </span>
              </button>
              <Button size="icon" variant="ghost" aria-label="हटाएँ" onClick={() => remove(s.id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-5">
        <form onSubmit={save} className="panel space-y-4 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {selected ? "योजना संपादित करें" : "नई योजना जोड़ें"}
          </h2>
          <ImageUpload
            value={form.image_url}
            onChange={(path) => setForm({ ...form, image_url: path })}
            label="योजना की इमेज (icon की जगह)"
          />
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
              <Label>श्रेणी</Label>
              <Input
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>आइकॉन (fallback)</Label>
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
          </div>
          <div className="space-y-1.5">
            <Label>ऑफिशियल वेबसाइट (optional)</Label>
            <Input
              type="url"
              value={form.official_url ?? ""}
              onChange={(e) => setForm({ ...form, official_url: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>छोटा विवरण</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="scheme-pub"
              checked={form.is_published}
              onCheckedChange={(v) => setForm({ ...form, is_published: v })}
            />
            <Label htmlFor="scheme-pub">साइट पर दिखाएँ</Label>
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
          <div className="panel space-y-3 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              लिंक ({links.length})
            </h2>
            <ul className="space-y-2">
              {links.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{l.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{l.url}</span>
                  </span>
                  <Button size="icon" variant="ghost" aria-label="हटाएँ" onClick={() => removeLink(l.id)}>
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
  );
}

function JobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Job, "id">>(EMPTY_JOB);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setJobs((data as Job[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reset = () => {
    setSelected(null);
    setForm(EMPTY_JOB);
  };

  const pick = (job: Job) => {
    setSelected(job.id);
    const { id: _id, ...rest } = job;
    setForm({ ...rest, apply_url: rest.apply_url ?? "", notification_url: rest.notification_url ?? "" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      slug: slugify(form.slug || form.title_en || form.title_hi, "job"),
      last_date: form.last_date || null,
      apply_url: form.apply_url || null,
      notification_url: form.notification_url || null,
    };
    const res = selected
      ? await supabase.from("jobs").update(payload).eq("id", selected)
      : await supabase.from("jobs").insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(selected ? "भर्ती अपडेट हुई" : "नई भर्ती जुड़ गई");
    reset();
    void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("भर्ती हटाई गई");
    if (selected === id) reset();
    void load();
  };

  const text = (key: keyof Omit<Job, "id">, label: string) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={(form[key] as string) ?? ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
      <section className="panel max-h-[70vh] overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            भर्तियाँ ({jobs.length})
          </h2>
          <Button size="sm" variant="secondary" onClick={reset}>
            <Plus className="size-4" /> नई
          </Button>
        </div>
        <ul className="space-y-2">
          {jobs.map((j) => (
            <li
              key={j.id}
              className={`flex items-center gap-3 rounded-md border p-3 ${selected === j.id ? "border-primary bg-surface" : "border-border bg-card"}`}
            >
              <button
                type="button"
                onClick={() => pick(j)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <SchemeAvatar icon="Briefcase" image={j.image_url} alt={j.title_hi} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{j.title_hi}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {j.department} · {j.is_published ? "published" : "draft"}
                  </span>
                </span>
              </button>
              <Button size="icon" variant="ghost" aria-label="हटाएँ" onClick={() => remove(j.id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
          {jobs.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">अभी कोई भर्ती नहीं।</li>
          )}
        </ul>
      </section>

      <form onSubmit={save} className="panel space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {selected ? "भर्ती संपादित करें" : "नई भर्ती जोड़ें"}
        </h2>
        <ImageUpload
          value={form.image_url}
          onChange={(path) => setForm({ ...form, image_url: path })}
          label="भर्ती की इमेज / लोगो"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>पद का नाम (हिंदी)</Label>
            <Input
              required
              value={form.title_hi}
              onChange={(e) => setForm({ ...form, title_hi: e.target.value })}
            />
          </div>
          {text("title_en", "Post name (English)")}
          {text("department", "विभाग / बोर्ड")}
          {text("category", "श्रेणी")}
          {text("total_posts", "कुल पद")}
          {text("qualification", "योग्यता")}
          {text("location", "स्थान")}
          {text("age_limit", "आयु सीमा")}
          {text("fee", "आवेदन शुल्क")}
          <div className="space-y-1.5">
            <Label>आखिरी तारीख</Label>
            <Input
              type="date"
              value={form.last_date ?? ""}
              onChange={(e) => setForm({ ...form, last_date: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>आवेदन लिंक</Label>
          <Input
            type="url"
            value={form.apply_url ?? ""}
            onChange={(e) => setForm({ ...form, apply_url: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>नोटिफिकेशन लिंक (PDF)</Label>
          <Input
            type="url"
            value={form.notification_url ?? ""}
            onChange={(e) => setForm({ ...form, notification_url: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>विवरण</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="job-pub"
            checked={form.is_published}
            onCheckedChange={(v) => setForm({ ...form, is_published: v })}
          />
          <Label htmlFor="job-pub">साइट पर दिखाएँ</Label>
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
    </div>
  );
}

function PagesTab() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Page, "id">>(EMPTY_PAGE);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("pages").select("*").order("sort_order");
    if (error) toast.error(error.message);
    setPages((data as Page[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reset = () => {
    setSelected(null);
    setForm(EMPTY_PAGE);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, slug: slugify(form.slug || form.title, "page") };
    const res = selected
      ? await supabase.from("pages").update(payload).eq("id", selected)
      : await supabase.from("pages").insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(selected ? "पेज अपडेट हुआ" : "नया पेज जुड़ गया");
    reset();
    void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("पेज हटाया गया");
    if (selected === id) reset();
    void load();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
      <section className="panel max-h-[70vh] overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            पेज ({pages.length})
          </h2>
          <Button size="sm" variant="secondary" onClick={reset}>
            <Plus className="size-4" /> नया
          </Button>
        </div>
        <ul className="space-y-2">
          {pages.map((p) => (
            <li
              key={p.id}
              className={`flex items-center gap-3 rounded-md border p-3 ${selected === p.id ? "border-primary bg-surface" : "border-border bg-card"}`}
            >
              <button
                type="button"
                onClick={() => {
                  setSelected(p.id);
                  const { id: _id, ...rest } = p;
                  setForm(rest);
                }}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="tint-chip flex size-9 shrink-0 items-center justify-center rounded-md">
                  <FileText className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{p.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">/page/{p.slug}</span>
                </span>
              </button>
              <Button size="icon" variant="ghost" aria-label="हटाएँ" onClick={() => remove(p.id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={save} className="panel space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {selected ? "पेज संपादित करें" : "नया पेज बनाएँ"}
        </h2>
        <div className="space-y-1.5">
          <Label>पेज का शीर्षक</Label>
          <Input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>कंटेंट</Label>
          <Textarea
            rows={10}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3">
            <Switch
              id="page-menu"
              checked={form.show_in_menu}
              onCheckedChange={(v) => setForm({ ...form, show_in_menu: v })}
            />
            <Label htmlFor="page-menu">मेन्यू में दिखाएँ</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="page-pub"
              checked={form.is_published}
              onCheckedChange={(v) => setForm({ ...form, is_published: v })}
            />
            <Label htmlFor="page-pub">प्रकाशित</Label>
          </div>
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
    </div>
  );
}
