import { shouldShowAds } from "./entitlements";

/**
 * Emplacement publicitaire réservé. N'affiche rien tant que `features.adsEnabled` est false.
 * Le jour venu, il suffira d'insérer ici le script de la régie choisie.
 */
export function AdSlot({ plan, slot }: { plan: string; slot: string }) {
  if (!shouldShowAds(plan)) return null;
  return (
    <div data-ad-slot={slot} className="grid h-24 place-items-center rounded-2xl border-2 border-dashed border-slate-200 text-xs text-slate-400">
      Publicité
    </div>
  );
}
