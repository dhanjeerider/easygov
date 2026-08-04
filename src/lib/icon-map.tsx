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

export function imageSrc(path: string | null | undefined) {
  if (!path) return null;
  return /^https?:\/\//.test(path) ? path : `/api/public/img/${path}`;
}

export function SchemeAvatar({
  icon,
  image,
  alt,
  className = "size-9",
  iconClassName = "size-4.5",
}: {
  icon: string;
  image?: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
}) {
  const src = imageSrc(image);
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`${className} shrink-0 rounded-md border border-border object-cover`}
      />
    );
  }
  return (
    <span
      className={`tint-chip ${className} flex shrink-0 items-center justify-center rounded-md`}
    >
      <SchemeIcon name={icon} className={iconClassName} />
    </span>
  );
}
