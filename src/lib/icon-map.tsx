import {
  IdCard, CreditCard, Sprout, Vote, Flame, ScanFace, Home, ShoppingBasket,
  HardHat, HeartPulse, Map, PiggyBank, Smartphone, FileText, GraduationCap,
  Landmark, Briefcase, Baby, Bus, Droplets, Wallet, ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  IdCard, CreditCard, Sprout, Vote, Flame, ScanFace, Home, ShoppingBasket,
  HardHat, HeartPulse, Map, PiggyBank, Smartphone, FileText, GraduationCap,
  Landmark, Briefcase, Baby, Bus, Droplets, Wallet, ShieldCheck,
};

export const ICON_NAMES = Object.keys(ICONS);

export function SchemeIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? FileText;
  return <Icon className={className} />;
}
