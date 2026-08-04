import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
import { ToolShell } from "@/components/site/tool-shell";
import { useLocalState, inr } from "@/lib/use-local-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/tools/salary-tracker")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Salary Tracker — मासिक सैलरी और कटौती हिसाब | Sarkari Setu" },
      {
        name: "description",
        content: "हर महीने की सैलरी, कटौती और बचत का हिसाब रखें। डेटा आपके ब्राउज़र में सुरक्षित।",
      },
      { property: "og:title", content: "Salary Tracker | Sarkari Setu" },
      { property: "og:description", content: "मासिक सैलरी और बचत का आसान हिसाब।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SalaryTracker,
  errorComponent: () => <div className="p-10 text-center">टूल लोड नहीं हुआ।</div>,
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

type Entry = { id: string; month: string; gross: number; deduction: number; note: string };

function SalaryTracker() {
  const [entries, setEntries] = useLocalState<Entry[]>("ss:salary", []);
  const [form, setForm] = useState({ month: "", gross: "", deduction: "", note: "" });

  const add = () => {
    if (!form.month) return;
    setEntries((prev) => [
      {
        id: crypto.randomUUID(),
        month: form.month,
        gross: Number(form.gross) || 0,
        deduction: Number(form.deduction) || 0,
        note: form.note,
      },
      ...prev,
    ]);
    setForm({ month: "", gross: "", deduction: "", note: "" });
  };

  const totalGross = entries.reduce((s, e) => s + e.gross, 0);
  const totalDed = entries.reduce((s, e) => s + e.deduction, 0);

  return (
    <ToolShell
      title="Salary Tracker"
      subtitle="हर महीने की सैलरी, कटौती और हाथ में आने वाली रकम का रिकॉर्ड।"
      icon={Wallet}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "कुल सैलरी", value: totalGross, tint: "tint-1" },
          { label: "कुल कटौती", value: totalDed, tint: "tint-5" },
          { label: "कुल नेट", value: totalGross - totalDed, tint: "tint-3" },
        ].map((s) => (
          <div key={s.label} className={`${s.tint} panel p-3.5`}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-lg font-semibold">₹ {inr(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="panel mt-5 grid gap-3 p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>महीना</Label>
          <Input
            type="month"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>कुल सैलरी (₹)</Label>
          <Input
            inputMode="numeric"
            value={form.gross}
            onChange={(e) => setForm({ ...form, gross: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>कटौती (₹)</Label>
          <Input
            inputMode="numeric"
            value={form.deduction}
            onChange={(e) => setForm({ ...form, deduction: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>नोट</Label>
          <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={add}>
            <Plus className="size-4" /> जोड़ें
          </Button>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="panel flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{e.month}</p>
              <p className="text-xs text-muted-foreground">
                सैलरी ₹{inr(e.gross)} · कटौती ₹{inr(e.deduction)} {e.note && `· ${e.note}`}
              </p>
            </div>
            <p className="text-sm font-semibold text-primary">₹ {inr(e.gross - e.deduction)}</p>
            <Button
              size="icon"
              variant="ghost"
              aria-label="हटाएँ"
              onClick={() => setEntries((prev) => prev.filter((x) => x.id !== e.id))}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </li>
        ))}
        {entries.length === 0 && (
          <li className="py-8 text-center text-sm text-muted-foreground">अभी कोई रिकॉर्ड नहीं है।</li>
        )}
      </ul>
    </ToolShell>
  );
}