/**
 * Réglages de la gamification. Modifier ces valeurs suffit à rééquilibrer le jeu,
 * sans toucher au reste du code.
 */
export const gamificationConfig = {
  /** Fuseau utilisé pour définir "un jour" (séries, activité quotidienne). */
  timezone: "Europe/Paris",

  levels: {
    /** XP pour passer du niveau n au niveau n+1 = base × n^exponent. */
    base: 100,
    exponent: 1.35,
    maxLevel: 200,
  },

  lesson: {
    /** Bonus pour avoir terminé une leçon (si score >= passingScore). */
    completionBonus: 20,
    passingScore: 50, // %
    perfectBonus: 15,
    /** +comboBonus XP par tranche de `comboStep` bonnes réponses d'affilée. */
    comboStep: 5,
    comboBonus: 5,
    /**
     * Multiplicateur d'XP selon le nombre de fois où la leçon a déjà été terminée.
     * Empêche de "farmer" la même leçon à l'infini.
     */
    replayMultipliers: [1, 0.5, 0.5, 0.25] as const,
  },

  streak: {
    /** Bonus pour la première leçon du jour, si la série atteint au moins minDays. */
    minDays: 2,
    xpPerDay: 2,
    maxBonus: 20,
  },

  /** Plafond anti-abus d'XP gagnée par jour. */
  dailyXpCap: 2000,
} as const;

export type GamificationConfig = typeof gamificationConfig;
