import { z } from "zod";

/** Types de conditions possibles. En ajouter un = l'ajouter ici + dans `statValue`. */
export const achievementConditionSchema = z.object({
  type: z.enum([
    "lessons_completed",
    "correct_answers",
    "best_combo",
    "perfect_lessons",
    "streak_days",
    "level",
    "xp_total",
    "languages_started",
    "language_xp",
  ]),
  count: z.number().int().positive(),
});

export type AchievementCondition = z.infer<typeof achievementConditionSchema>;

/** Statistiques utilisateur utilisées pour évaluer les succès. */
export type UserStats = {
  lessonsCompleted: number;
  totalCorrect: number;
  bestCombo: number;
  perfectLessons: number;
  longestStreak: number;
  level: number;
  xpTotal: number;
  languagesStarted: number;
  maxLanguageXp: number;
};

export function statValue(type: AchievementCondition["type"], s: UserStats): number {
  switch (type) {
    case "lessons_completed":
      return s.lessonsCompleted;
    case "correct_answers":
      return s.totalCorrect;
    case "best_combo":
      return s.bestCombo;
    case "perfect_lessons":
      return s.perfectLessons;
    case "streak_days":
      return s.longestStreak;
    case "level":
      return s.level;
    case "xp_total":
      return s.xpTotal;
    case "languages_started":
      return s.languagesStarted;
    case "language_xp":
      return s.maxLanguageXp;
  }
}

export function isConditionMet(condition: unknown, stats: UserStats): boolean {
  const parsed = achievementConditionSchema.safeParse(condition);
  if (!parsed.success) return false;
  return statValue(parsed.data.type, stats) >= parsed.data.count;
}

/** Progression (0..1) vers un succès, pour l'affichage. */
export function conditionProgress(condition: unknown, stats: UserStats): { current: number; target: number } {
  const parsed = achievementConditionSchema.safeParse(condition);
  if (!parsed.success) return { current: 0, target: 1 };
  return { current: Math.min(statValue(parsed.data.type, stats), parsed.data.count), target: parsed.data.count };
}
