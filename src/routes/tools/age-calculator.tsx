import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalculatorIcon } from "lucide-react";
import { ToolShell } from "@/components/site/tool-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/tools/age-calculator")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "उम्र कैलकुलेटर — फॉर्म के लिए सही उम्र निकालें | Sarkari Setu" },
      {
        name: "description",
        content: "जन्मतिथि और किसी भी तारीख के हिसाब से सही उम्र (साल, महीने, दिन) निकालें।",
      },
      { property: "og:title", content: "उम्र कैलकुलेटर | Sarkari Setu" },
      { property: "og:description", content: "भर्ती फॉर्म के लिए सही उम्र जाँचें।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgeCalculator,
  errorComponent: () => <div className="p-10 text-center">टूल लोड नहीं हुआ।</div>,
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [on, setOn] = useState(new Date().toISOString().slice(0, 10));

  const result = useMemo(() => {
    if (!dob) return null;
    const a = new Date(dob);
    const b = new Date(on);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return null;
    let years = b.getFullYear() - a.getFullYear();
    let months = b.getMonth() - a.getMonth();
    let days = b.getDate() - a.getDate();
    if (days < 0) {
      months -= 1;
      days += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalDays = Math.floor((b.getTime() - a.getTime()) / 86400000);
    return { years, months, days, totalDays };
  }, [dob, on]);

  return (
    <ToolShell
      title="उम्र कैलकुलेटर"
      subtitle="भर्ती या योजना के फॉर्म में मांगी गई तारीख पर अपनी सही उम्र जानें।"
      icon={CalculatorIcon}
    >
      <div className="panel grid gap-3 p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>जन्मतिथि</Label>
          <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>किस तारीख को</Label>
          <Input type="date" value={on} onChange={(e) => setOn(e.target.value)} />
        </div>
      </div>

      {result && (
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            { label: "साल", value: result.years, tint: "tint-1" },
            { label: "महीने", value: result.months, tint: "tint-2" },
            { label: "दिन", value: result.days, tint: "tint-3" },
            { label: "कुल दिन", value: result.totalDays, tint: "tint-4" },
          ].map((c) => (
            <div key={c.label} className={`${c.tint} panel p-3.5`}>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-lg font-semibold">{c.value}</p>
            </div>
          ))}
        </div>
      )}
    </ToolShell>
  );
}