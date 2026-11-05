import { gamificationConfig } from "@/config/gamification";

const { base, exponent, maxLevel } = gamificationConfig.levels;

/** XP nécessaire pour passer du niveau `level` au suivant. */
export function xpToNextLevel(level: number): number {
  return Math.round(base * Math.pow(level, exponent));
}

/** XP totale cumulée nécessaire pour atteindre `level`. */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpToNextLevel(l);
  return total;
}

export type LevelInfo = {
  level: number;
  /** XP gagnée depuis le début du niveau actuel. */
  xpIntoLevel: number;
  /** XP nécessaire pour finir le niveau actuel. */
  xpForLevel: number;
  progress: number; // 0..1
};

export function levelFromXp(xpTotal: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, Math.floor(xpTotal));
  while (level < maxLevel && remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level++;
  }
  const xpForLevel = xpToNextLevel(level);
  return { level, xpIntoLevel: remaining, xpForLevel, progress: Math.min(1, remaining / xpForLevel) };
}
