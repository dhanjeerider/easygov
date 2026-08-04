import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, ListChecks, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/site/tool-shell";
import { useLocalState } from "@/lib/use-local-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/tools/list-builder")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Quick List Builder — तुरंत चेकलिस्ट बनाएँ | Sarkari Setu" },
      {
        name: "description",
        content: "दस्तावेज़ लिस्ट, सामान की लिस्ट या कोई भी चेकलिस्ट बनाएँ, टिक करें और कॉपी करें।",
      },
      { property: "og:title", content: "Quick List Builder | Sarkari Setu" },
      { property: "og:description", content: "आसान चेकलिस्ट बनाइए और कॉपी कीजिए।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ListBuilder,
  errorComponent: () => <div className="p-10 text-center">टूल लोड नहीं हुआ।</div>,
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

type Item = { id: string; text: string; done: boolean };

function ListBuilder() {
  const [title, setTitle] = useLocalState<string>("ss:list:title", "मेरी लिस्ट");
  const [items, setItems] = useLocalState<Item[]>("ss:list:items", []);
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), text: text.trim(), done: false }]);
    setText("");
  };

  const copy = async () => {
    const body = items.map((i) => `${i.done ? "[x]" : "[ ]"} ${i.text}`).join("\n");
    await navigator.clipboard.writeText(`${title}\n${body}`);
    toast.success("लिस्ट कॉपी हो गई");
  };

  const done = items.filter((i) => i.done).length;

  return (
    <ToolShell
      title="Quick List Builder"
      subtitle="दस्तावेज़ या किसी भी काम की चेकलिस्ट बनाएँ और कॉपी करें।"
      icon={ListChecks}
    >
      <div className="panel space-y-3 p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="लिस्ट का नाम"
          className="text-base font-semibold"
        />
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="नया आइटम लिखें…"
          />
          <Button onClick={add}>
            <Plus className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {done}/{items.length} पूरा
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((i) => (
          <li key={i.id} className="panel flex items-center gap-3 p-3">
            <input
              type="checkbox"
              checked={i.done}
              aria-label={i.text}
              onChange={() =>
                setItems((prev) =>
                  prev.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)),
                )
              }
              className="size-4 accent-[var(--primary)]"
            />
            <span
              className={`min-w-0 flex-1 text-sm ${i.done ? "text-muted-foreground line-through" : ""}`}
            >
              {i.text}
            </span>
            <Button
              size="icon"
              variant="ghost"
              aria-label="हटाएँ"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <Button variant="outline" className="mt-4" onClick={copy}>
          <Copy className="size-4" /> लिस्ट कॉपी करें
        </Button>
      )}
    </ToolShell>
  );
}