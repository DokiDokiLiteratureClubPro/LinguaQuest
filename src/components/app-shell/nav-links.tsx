"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/dashboard", label: "Accueil", icon: "🏠" },
  { href: "/learn", label: "Apprendre", icon: "📚" },
  { href: "/achievements", label: "Succès", icon: "🏆" },
  { href: "/profile", label: "Profil", icon: "👤" },
];

function useIsActive() {
  const path = usePathname();
  return (href: string) => path === href || path.startsWith(`${href}/`);
}

export function DesktopNav() {
  const isActive = useIsActive();
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "rounded-xl px-3 py-2 text-sm font-bold transition-colors",
            isActive(l.href) ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav() {
  const isActive = useIsActive();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t-2 border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Navigation principale"
    >
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold", isActive(l.href) ? "text-brand-600" : "text-slate-400")}
        >
          <span className={cn("text-xl transition-transform", isActive(l.href) && "scale-110")}>{l.icon}</span>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
