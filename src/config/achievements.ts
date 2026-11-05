import type { AchievementCondition } from "@/features/gamification/achievements";

/**
 * Catalogue des succès. Synchronisé en base par `npm run db:seed` (par slug).
 * Pour ajouter un succès : ajoute une entrée ici puis relance le seed.
 */
export type AchievementDefinition = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  xpReward: number;
};

export const achievementDefinitions: AchievementDefinition[] = [
  { slug: "first-lesson", name: "Premier pas", description: "Termine ta première leçon.", icon: "🎯", condition: { type: "lessons_completed", count: 1 }, xpReward: 10 },
  { slug: "ten-correct", name: "Bien parti", description: "Réussis 10 exercices.", icon: "✅", condition: { type: "correct_answers", count: 10 }, xpReward: 10 },
  { slug: "combo-10", name: "Inarrêtable", description: "Enchaîne 10 bonnes réponses d'affilée.", icon: "🔥", condition: { type: "best_combo", count: 10 }, xpReward: 25 },
  { slug: "perfect-lesson", name: "Sans faute", description: "Termine une leçon avec 100 % de réussite.", icon: "💎", condition: { type: "perfect_lessons", count: 1 }, xpReward: 15 },
  { slug: "ten-lessons", name: "Assidu", description: "Termine 10 leçons.", icon: "📚", condition: { type: "lessons_completed", count: 10 }, xpReward: 30 },
  { slug: "hundred-correct", name: "Centurion", description: "Donne 100 bonnes réponses.", icon: "💯", condition: { type: "correct_answers", count: 100 }, xpReward: 50 },
  { slug: "streak-3", name: "Sur la lancée", description: "Apprends 3 jours d'affilée.", icon: "📅", condition: { type: "streak_days", count: 3 }, xpReward: 20 },
  { slug: "streak-7", name: "Une semaine complète", description: "Apprends 7 jours d'affilée.", icon: "🗓️", condition: { type: "streak_days", count: 7 }, xpReward: 50 },
  { slug: "level-5", name: "Niveau 5", description: "Atteins le niveau 5.", icon: "⭐", condition: { type: "level", count: 5 }, xpReward: 25 },
  { slug: "xp-1000", name: "Millionnaire… en XP", description: "Cumule 1 000 XP.", icon: "🏆", condition: { type: "xp_total", count: 1000 }, xpReward: 50 },
  { slug: "polyglot", name: "Polyglotte", description: "Gagne de l'XP dans 2 langues différentes.", icon: "🌍", condition: { type: "languages_started", count: 2 }, xpReward: 30 },
  { slug: "language-500", name: "Bases solides", description: "Cumule 500 XP dans une même langue.", icon: "🎓", condition: { type: "language_xp", count: 500 }, xpReward: 40 },
];
