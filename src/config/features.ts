/**
 * Interrupteurs de fonctionnalités. Permet d'activer la monétisation plus tard
 * sans reconstruire l'application.
 */
export const features = {
  /** Si false, toutes les leçons sont accessibles à tous (même `isPremium`). */
  premiumEnabled: false,
  /** Affiche les emplacements publicitaires (<AdSlot />). */
  adsEnabled: false,
} as const;

export const plans = {
  free: { label: "Gratuit" },
  premium: { label: "Premium" },
} as const;

export type Plan = keyof typeof plans;
