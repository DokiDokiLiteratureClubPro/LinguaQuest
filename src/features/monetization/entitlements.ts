import { features, type Plan } from "@/config/features";

/**
 * Point d'entrée unique pour savoir ce qu'un utilisateur a le droit de faire.
 * Le jour où un abonnement est ajouté, seule cette fonction (et `profiles.plan`) évolue.
 */
export function canAccessLesson(plan: string, lesson: { isPremium: boolean }): boolean {
  if (!features.premiumEnabled || !lesson.isPremium) return true;
  return (plan as Plan) === "premium";
}

export function shouldShowAds(plan: string): boolean {
  return features.adsEnabled && (plan as Plan) !== "premium";
}
