import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Percent } from "lucide-react";
import { ToolShell } from "@/components/site/tool-shell";
import { inr } from "@/lib/use-local-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/tools/emi-calculator")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "EMI कैलकुलेटर — लोन की मासिक किश्त निकालें | Sarkari Setu" },
      {
        name: "description",
        content: "लोन राशि, ब्याज दर और अवधि डालकर मासिक EMI, कुल ब्याज और कुल भुगतान जानें।",
      },
      { property: "og:title", content: "EMI कैलकुलेटर | Sarkari Setu" },
      { property: "og:description", content: "लोन की किश्त का आसान हिसाब।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmiCalculator,
  errorComponent: () => <div className="p-10 text-center">टूल लोड नहीं हुआ।</div>,
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

function EmiCalculator() {
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("9");
  const [years, setYears] = useState("5");

  const result = useMemo(() => {
    const p = Number(amount) || 0;
    const r = (Number(rate) || 0) / 12 / 100;
    const n = (Number(years) || 0) * 12;
    if (!p || !n) return null;
    const emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { emi, total: emi * n, interest: emi * n - p };
  }, [amount, rate, years]);

  return (
    <ToolShell
      title="EMI कैलकुलेटर"
      subtitle="लोन की मासिक किश्त, कुल ब्याज और कुल भुगतान तुरंत जानें।"
      icon={Percent}
    >
      <div className="panel grid gap-3 p-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>लोन राशि (₹)</Label>
          <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>ब्याज दर (%)</Label>
          <Input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>अवधि (साल)</Label>
          <Input inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} />
        </div>
      </div>

      {result && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "मासिक EMI", value: result.emi, tint: "tint-1" },
            { label: "कुल ब्याज", value: result.interest, tint: "tint-5" },
            { label: "कुल भुगतान", value: result.total, tint: "tint-3" },
          ].map((c) => (
            <div key={c.label} className={`${c.tint} panel p-3.5`}>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-lg font-semibold">₹ {inr(Math.round(c.value))}</p>
            </div>
          ))}
        </div>
      )}
    </ToolShell>
  );
}