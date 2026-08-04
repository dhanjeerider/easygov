import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Copy } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/site/tool-shell";
import { useLocalState } from "@/lib/use-local-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/tools/my-details")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "फॉर्म भरने की जानकारी — एक क्लिक में कॉपी | Sarkari Setu" },
      {
        name: "description",
        content:
          "नाम, पिता का नाम, जन्मतिथि, पता, बैंक और आधार जैसी जानकारी सेव करें और फॉर्म भरते समय एक क्लिक में कॉपी करें।",
      },
      { property: "og:title", content: "फॉर्म भरने की जानकारी | Sarkari Setu" },
      { property: "og:description", content: "अपनी जानकारी सेव करें, फॉर्म तेज़ी से भरें।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyDetails,
  errorComponent: () => <div className="p-10 text-center">टूल लोड नहीं हुआ।</div>,
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

const FIELDS = [
  { key: "name", label: "पूरा नाम" },
  { key: "father", label: "पिता का नाम" },
  { key: "mother", label: "माता का नाम" },
  { key: "dob", label: "जन्मतिथि" },
  { key: "mobile", label: "मोबाइल नंबर" },
  { key: "email", label: "ईमेल" },
  { key: "address", label: "पूरा पता" },
  { key: "pincode", label: "पिन कोड" },
  { key: "bank", label: "बैंक का नाम" },
  { key: "account", label: "खाता संख्या" },
  { key: "ifsc", label: "IFSC कोड" },
  { key: "qualification", label: "शैक्षणिक योग्यता" },
] as const;

type Details = Record<string, string>;

function MyDetails() {
  const [details, setDetails] = useLocalState<Details>("ss:mydetails", {});

  const copy = async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success("कॉपी हो गया");
  };

  return (
    <ToolShell
      title="फॉर्म भरने की जानकारी"
      subtitle="एक बार भरें, हर फॉर्म में एक क्लिक से कॉपी करें। जानकारी सिर्फ़ आपके फ़ोन में सेव होती है।"
      icon={ClipboardList}
    >
      <div className="panel grid gap-3 p-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label>{f.label}</Label>
            <div className="flex gap-2">
              <Input
                value={details[f.key] ?? ""}
                onChange={(e) => setDetails((prev) => ({ ...prev, [f.key]: e.target.value }))}
              />
              <Button
                size="icon"
                variant="outline"
                aria-label={`${f.label} कॉपी करें`}
                onClick={() => copy(details[f.key] ?? "")}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        सुरक्षा सलाह: साझा (shared) कंप्यूटर पर संवेदनशील जानकारी सेव न करें।
      </p>
    </ToolShell>
  );
}