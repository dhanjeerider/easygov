import { Link } from "@tanstack/react-router";
import { LayoutGrid, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-4">
      <div className="glass-card mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="gradient-hero flex size-9 items-center justify-center rounded-xl text-primary-foreground shadow-sm">
            <LayoutGrid className="size-4.5" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight">Sarkari Setu</span>
            <span className="block text-[11px] text-muted-foreground">योजना व सरकारी लिंक डायरेक्टरी</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild variant="secondary" size="sm">
              <Link to="/admin">
                <ShieldCheck className="size-4" /> Admin
              </Link>
            </Button>
          )}
          {!user && (
            <Button asChild size="sm">
              <Link to="/auth">
                <LogIn className="size-4" /> Login
              </Link>
            </Button>
          )}
          {user && !isAdmin && (
            <span className="hidden text-xs text-muted-foreground sm:block">{user.email}</span>
          )}
        </nav>
      </div>
    </header>
  );
}
