import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { imageSrc } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";

export function ImageUpload({
  value,
  onChange,
  label = "इमेज / आइकॉन",
}: {
  value: string | null;
  onChange: (path: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const src = imageSrc(value);

  const upload = async (file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      toast.error("इमेज 3MB से छोटी होनी चाहिए");
      return;
    }
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("scheme-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    onChange(path);
    toast.success("इमेज अपलोड हो गई");
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex items-center gap-3">
        {src ? (
          <img
            src={src}
            alt="preview"
            className="size-14 rounded-md border border-border object-cover"
          />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-md border border-dashed border-input text-muted-foreground">
            <ImagePlus className="size-5" />
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          इमेज चुनें
        </Button>
        {value && (
          <Button type="button" variant="ghost" onClick={() => onChange(null)}>
            <X className="size-4" /> हटाएँ
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        इमेज न डालने पर नीचे चुना गया आइकॉन दिखेगा।
      </p>
    </div>
  );
}