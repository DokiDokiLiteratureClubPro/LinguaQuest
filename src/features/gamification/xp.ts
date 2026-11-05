import { gamificationConfig } from "@/config/gamification";

export type XpBreakdownItem = { label: string; amount: number };

export type LessonXpInput = {
  /** Somme des XP des exercices réussis. */
  correctXp: number;
  correctCount: number;
  totalCount: number;
  maxCombo: number;
  /** Nombre de fois où la leçon avait déjà été terminée avant celle-ci. */
  completionsBefore: number;
  /** Série de jours après prise en compte d'aujourd'hui. */
  streakAfter: number;
  firstLessonToday: boolean;
  /** XP déjà gagnée aujourd'hui (pour le plafond). */
  xpEarnedToday: number;
};

export type LessonXpResult = {
  total: number;
  score: number; // %
  passed: boolean;
  perfect: boolean;
  breakdown: XpBreakdownItem[];
};

/** Calcul pur (sans base de données) de l'XP d'une leçon. Testé unitairement. */
export function computeLessonXp(input: LessonXpInput, cfg = gamificationConfig): LessonXpResult {
  const { lesson, streak, dailyXpCap } = cfg;
  const score = input.totalCount === 0 ? 0 : Math.round((input.correctCount / input.totalCount) * 100);
  const passed = score >= lesson.passingScore;
  const perfect = input.totalCount > 0 && input.correctCount === input.totalCount;

  const breakdown: XpBreakdownItem[] = [];
  if (input.correctXp > 0) breakdown.push({ label: "Bonnes réponses", amount: input.correctXp });
  if (passed) breakdown.push({ label: "Leçon terminée", amount: lesson.completionBonus });
  if (perfect) breakdown.push({ label: "Sans faute", amount: lesson.perfectBonus });
  const comboTiers = Math.floor(input.maxCombo / lesson.comboStep);
  if (comboTiers > 0) breakdown.push({ label: `Combo ×${input.maxCombo}`, amount: comboTiers * lesson.comboBonus });

  let subtotal = breakdown.reduce((s, b) => s + b.amount, 0);

  const multipliers = lesson.replayMultipliers;
  const multiplier = multipliers[Math.min(input.completionsBefore, multipliers.length - 1)];
  if (multiplier < 1 && subtotal > 0) {
    const reduced = Math.round(subtotal * multiplier);
    breakdown.push({ label: "Leçon déjà terminée", amount: reduced - subtotal });
    subtotal = reduced;
  }

  if (passed && input.firstLessonToday && input.streakAfter >= streak.minDays) {
    const bonus = Math.min(input.streakAfter * streak.xpPerDay, streak.maxBonus);
    breakdown.push({ label: `Série de ${input.streakAfter} jours`, amount: bonus });
    subtotal += bonus;
  }

  const allowed = Math.max(0, dailyXpCap - input.xpEarnedToday);
  if (subtotal > allowed) {
    breakdown.push({ label: "Plafond quotidien atteint", amount: allowed - subtotal });
    subtotal = allowed;
  }

  return { total: subtotal, score, passed, perfect, breakdown };
}
