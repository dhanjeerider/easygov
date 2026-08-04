import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  FileText,
  LayoutGrid,
  LogIn,
  Menu,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listMenuPages, type MenuPage } from "@/lib/content.functions";

const NAV = [
  { to: "/", label: "योजनाएँ", icon: LayoutGrid },
  { to: "/naukri", label: "नौकरियाँ", icon: BriefcaseBusiness },
  { to: "/tools", label: "टूल्स", icon: Wrench },
] as const;

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<MenuPage[]>([]);

  useEffect(() => {
    let active = true;
    void listMenuPages().then((rows) => active && setPages(rows));
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LayoutGrid className="size-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-tight">Sarkari Setu</span>
            <span className="block text-[11px] text-muted-foreground">योजना · नौकरी · टूल्स</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-surface text-primary" }}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <item.icon className="size-4" /> {item.label}
            </Link>
          ))}
          {pages.map((p) => (
            <Link
              key={p.slug}
              to="/page/$slug"
              params={{ slug: p.slug }}
              activeProps={{ className: "bg-surface text-primary" }}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <FileText className="size-4" /> {p.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link to="/admin">
                <ShieldCheck className="size-4" /> Admin
              </Link>
            </Button>
          )}
          {!user && (
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <Link to="/auth">
                <LogIn className="size-4" /> Login
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="मेन्यू"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Menu className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <nav className="mx-auto grid max-w-5xl gap-1 px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-background"
              >
                <item.icon className="size-4 text-primary" /> {item.label}
              </Link>
            ))}
            {pages.map((p) => (
              <Link
                key={p.slug}
                to="/page/$slug"
                params={{ slug: p.slug }}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-background"
              >
                <FileText className="size-4 text-primary" /> {p.title}
              </Link>
            ))}
            <Link
              to={isAdmin ? "/admin" : "/auth"}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-background"
            >
              {isAdmin ? (
                <ShieldCheck className="size-4 text-primary" />
              ) : (
                <LogIn className="size-4 text-primary" />
              )}
              {isAdmin ? "Admin Panel" : "Login"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
