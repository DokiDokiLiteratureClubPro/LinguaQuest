import Link from "next/link";
import { cn } from "@/lib/cn";

export function StreakChip({ streak, className }: { streak: number; className?: string }) {
  return (
    <span
      title={`Série de ${streak} jour${streak > 1 ? "s" : ""}`}
      className={cn("inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm font-extrabold", streak > 0 ? "text-orange-500" : "text-slate-300", className)}
    >
      <span className={streak > 0 ? "" : "grayscale"}>🔥</span>
      {streak}
    </span>
  );
}

export function LevelChip({ level, xp }: { level: number; xp: number }) {
  return (
    <span title={`${xp} XP au total`} className="inline-flex items-center gap-1.5 rounded-xl bg-xp-100 px-2.5 py-1.5 text-sm font-extrabold text-xp-600">
      ⭐ Niv. {level}
    </span>
  );
}

export function LanguageChip({ flag, code }: { flag: string; code: string }) {
  return (
    <Link href={`/learn/${code}`} title="Langue en cours" className="inline-flex items-center rounded-xl px-2 py-1.5 text-xl hover:bg-slate-100">
      {flag}
    </Link>
  );
}
