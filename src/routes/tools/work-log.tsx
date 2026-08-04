import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { ToolShell } from "@/components/site/tool-shell";
import { useLocalState, inr } from "@/lib/use-local-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/tools/work-log")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Daily Work Log — रोज़ का काम और मज़दूरी रिकॉर्ड | Sarkari Setu" },
      {
        name: "description",
        content: "रोज़ का काम, काम के घंटे और मज़दूरी लिखकर रखें। पूरा हिसाब एक जगह।",
      },
      { property: "og:title", content: "Daily Work Log | Sarkari Setu" },
      { property: "og:description", content: "रोज़ के काम और मज़दूरी का आसान रिकॉर्ड।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkLog,
  errorComponent: () => <div className="p-10 text-center">टूल लोड नहीं हुआ।</div>,
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

type Log = { id: string; date: string; work: string; hours: number; amount: number };

function WorkLog() {
  const [logs, setLogs] = useLocalState<Log[]>("ss:worklog", []);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    work: "",
    hours: "",
    amount: "",
  });

  const add = () => {
    if (!form.work.trim()) return;
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        date: form.date,
        work: form.work.trim(),
        hours: Number(form.hours) || 0,
        amount: Number(form.amount) || 0,
      },
      ...prev,
    ]);
    setForm({ ...form, work: "", hours: "", amount: "" });
  };

  const totalHours = logs.reduce((s, l) => s + l.hours, 0);
  const totalAmount = logs.reduce((s, l) => s + l.amount, 0);

  return (
    <ToolShell
      title="Daily Work Log"
      subtitle="रोज़ का काम, घंटे और मज़दूरी — सब एक जगह दर्ज करें।"
      icon={NotebookPen}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="tint-2 panel p-3.5">
          <p className="text-xs text-muted-foreground">कुल दिन</p>
          <p className="mt-1 text-lg font-semibold">{logs.length}</p>
        </div>
        <div className="tint-4 panel p-3.5">
          <p className="text-xs text-muted-foreground">कुल घंटे</p>
          <p className="mt-1 text-lg font-semibold">{inr(totalHours)}</p>
        </div>
        <div className="tint-3 panel p-3.5">
          <p className="text-xs text-muted-foreground">कुल कमाई</p>
          <p className="mt-1 text-lg font-semibold">₹ {inr(totalAmount)}</p>
        </div>
      </div>

      <div className="panel mt-5 grid gap-3 p-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>तारीख</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>घंटे</Label>
          <Input
            inputMode="decimal"
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>मज़दूरी (₹)</Label>
          <Input
            inputMode="numeric"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-3">
          <Label>काम का विवरण</Label>
          <Textarea
            rows={2}
            value={form.work}
            onChange={(e) => setForm({ ...form, work: e.target.value })}
          />
        </div>
        <div>
          <Button onClick={add}>
            <Plus className="size-4" /> दर्ज करें
          </Button>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {logs.map((l) => (
          <li key={l.id} className="panel flex items-start gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{l.work}</p>
              <p className="text-xs text-muted-foreground">
                {l.date} · {inr(l.hours)} घंटे · ₹{inr(l.amount)}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label="हटाएँ"
              onClick={() => setLogs((prev) => prev.filter((x) => x.id !== l.id))}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </li>
        ))}
        {logs.length === 0 && (
          <li className="py-8 text-center text-sm text-muted-foreground">अभी कोई एंट्री नहीं है।</li>
        )}
      </ul>
    </ToolShell>
  );
}