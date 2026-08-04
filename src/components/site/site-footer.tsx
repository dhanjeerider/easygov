import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  CalculatorIcon,
  ClipboardList,
  FileText,
  LayoutGrid,
  ListChecks,
  NotebookPen,
  ShieldCheck,
  Wallet,
  Wrench,
} from "lucide-react";
import { listMenuPages, type MenuPage } from "@/lib/content.functions";

export function SiteFooter() {
  const [pages, setPages] = useState<MenuPage[]>([]);

  useEffect(() => {
    let active = true;
    void listMenuPages().then((rows) => active && setPages(rows));
    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="mt-14 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-3">
        <div>
          <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
            <LayoutGrid className="size-4 text-primary" /> मुख्य
          </h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="flex items-center gap-1.5 hover:text-foreground">
                <LayoutGrid className="size-3.5" /> सभी योजनाएँ
              </Link>
            </li>
            <li>
              <Link to="/naukri" className="flex items-center gap-1.5 hover:text-foreground">
                <BriefcaseBusiness className="size-3.5" /> सरकारी नौकरी
              </Link>
            </li>
            <li>
              <Link to="/tools" className="flex items-center gap-1.5 hover:text-foreground">
                <Wrench className="size-3.5" /> सभी टूल्स
              </Link>
            </li>
            <li>
              <Link to="/auth" className="flex items-center gap-1.5 hover:text-foreground">
                <ShieldCheck className="size-3.5" /> एडमिन लॉगिन
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
            <Wrench className="size-4 text-primary" /> टूल्स
          </h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <Link
                to="/tools/salary-tracker"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <Wallet className="size-3.5" /> Salary Tracker
              </Link>
            </li>
            <li>
              <Link to="/tools/work-log" className="flex items-center gap-1.5 hover:text-foreground">
                <NotebookPen className="size-3.5" /> Daily Work Log
              </Link>
            </li>
            <li>
              <Link
                to="/tools/list-builder"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <ListChecks className="size-3.5" /> Quick List Builder
              </Link>
            </li>
            <li>
              <Link
                to="/tools/my-details"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <ClipboardList className="size-3.5" /> फॉर्म भरने की जानकारी
              </Link>
            </li>
            <li>
              <Link
                to="/tools/age-calculator"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <CalculatorIcon className="size-3.5" /> उम्र कैलकुलेटर
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
            <FileText className="size-4 text-primary" /> जानकारी
          </h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {pages.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/page/$slug"
                  params={{ slug: p.slug }}
                  className="flex items-center gap-1.5 hover:text-foreground"
                >
                  <FileText className="size-3.5" /> {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-5 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            सभी लिंक संबंधित सरकारी विभागों की आधिकारिक वेबसाइटों के हैं। यह एक निजी सूचना पोर्टल
            है, किसी सरकारी संस्था से संबद्ध नहीं है।
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Sarkari Setu
          </p>
        </div>
      </div>
    </footer>
  );
}
