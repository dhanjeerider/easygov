import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalculatorIcon,
  ClipboardList,
  ListChecks,
  NotebookPen,
  Percent,
  Wallet,
  Wrench,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "फ्री टूल्स — सैलरी ट्रैकर, वर्क लॉग, लिस्ट बिल्डर | Sarkari Setu" },
      {
        name: "description",
        content:
          "Salary Tracker, Daily Work Log, Quick List Builder, फॉर्म भरने की जानकारी और उम्र कैलकुलेटर — सब कुछ मुफ्त और आपके ब्राउज़र में सुरक्षित।",
      },
      { property: "og:title", content: "फ्री टूल्स | Sarkari Setu" },
      { property: "og:description", content: "रोज़ काम आने वाले आसान टूल्स, बिल्कुल मुफ्त।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ToolsIndex,
  errorComponent: () => <div className="p-10 text-center">टूल्स लोड नहीं हुए।</div>,
  notFoundComponent: () => <div className="p-10 text-center">पेज नहीं मिला</div>,
});

export const TOOLS = [
  {
    to: "/tools/salary-tracker",
    icon: Wallet,
    title: "Salary Tracker",
    hi: "महीने की सैलरी, कटौती और बचत का हिसाब रखें।",
  },
  {
    to: "/tools/work-log",
    icon: NotebookPen,
    title: "Daily Work Log",
    hi: "रोज़ का काम, घंटे और मज़दूरी लिखकर रखें।",
  },
  {
    to: "/tools/list-builder",
    icon: ListChecks,
    title: "Quick List Builder",
    hi: "कोई भी लिस्ट बनाएँ, टिक करें और कॉपी करें।",
  },
  {
    to: "/tools/my-details",
    icon: ClipboardList,
    title: "फॉर्म भरने की जानकारी",
    hi: "नाम, आधार, बैंक जैसी जानकारी सेव करें और एक क्लिक में कॉपी करें।",
  },
  {
    to: "/tools/age-calculator",
    icon: CalculatorIcon,
    title: "उम्र कैलकुलेटर",
    hi: "जन्मतिथि से सही उम्र और पात्रता जाँचें।",
  },
  {
    to: "/tools/emi-calculator",
    icon: Percent,
    title: "EMI कैलकुलेटर",
    hi: "लोन की मासिक किश्त और कुल ब्याज निकालें।",
  },
] as const;

function ToolsIndex() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4">
        <section className="border-b border-border py-9">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <Wrench className="size-6 text-primary" /> उपयोगी टूल्स
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            फॉर्म भरने और रोज़मर्रा के हिसाब-किताब के लिए आसान टूल्स। सारा डेटा आपके अपने फ़ोन/ब्राउज़र
            में ही सेव रहता है।
          </p>
        </section>
        <section className="grid gap-3 py-7 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t, i) => (
            <Link
              key={t.to}
              to={t.to}
              className={`tint-${(i % 6) + 1} panel flex items-start gap-3 p-3.5 transition-colors hover:bg-surface`}
            >
              <span className="tint-chip flex size-9 shrink-0 items-center justify-center rounded-md">
                <t.icon className="size-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{t.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {t.hi}
                </span>
              </span>
            </Link>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}