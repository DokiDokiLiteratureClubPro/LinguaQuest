import { english } from "./en";
import { spanish } from "./es";

/**
 * Langues disponibles. Pour ajouter une langue : créer `xx.ts` sur le modèle de `en.ts`,
 * l'ajouter à cette liste, puis lancer `npm run db:seed`. Aucun autre code à modifier.
 */
export const seedLanguages = [english, spanish];
