import { gamificationConfig } from "@/config/gamification";

/** Date du jour au format YYYY-MM-DD dans le fuseau configuré. */
export function todayKey(now: Date = new Date(), timeZone: string = gamificationConfig.timezone): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function dayDiff(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** Nouvelle série après une activité le jour `today`. */
export function nextStreak(lastActive: string | null, current: number, today: string): number {
  if (!lastActive) return 1;
  const diff = dayDiff(lastActive, today);
  if (diff <= 0) return Math.max(current, 1);
  if (diff === 1) return current + 1;
  return 1;
}

/** Série à afficher : retombe à 0 si l'utilisateur a manqué plus d'un jour. */
export function displayedStreak(lastActive: string | null, current: number, today: string = todayKey()): number {
  if (!lastActive) return 0;
  return dayDiff(lastActive, today) <= 1 ? current : 0;
}
