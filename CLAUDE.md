# LinguaQuest — consignes pour les sessions de développement

@AGENTS.md

Plateforme d'apprentissage des langues (FR → EN/ES pour l'instant). Projet long terme : on fait évoluer l'existant, on ne repart jamais de zéro. Voir `README.md` pour l'architecture complète.

## Règles de travail (demandées par le propriétaire)
1. Garder une vision globale de l'architecture ; analyser le code existant avant toute modification.
2. Modifications ciblées plutôt que réécriture de fichiers entiers.
3. Ne jamais supprimer une fonctionnalité existante sans accord explicite.
4. Vérifier la compatibilité avec le reste du site ; corriger sans créer de régressions.
5. Toujours expliquer les fichiers modifiés et pourquoi ; fournir les commandes à lancer.
6. Penser sécurité et performances à chaque changement.
7. Décision technique importante → présenter les options avant de choisir.

## Conventions
- Interface 100 % en français, tutoiement, ton motivant mais pas enfantin.
- Next.js 16 : `proxy.ts` (et non middleware), `params`/`searchParams` sont des Promises, lire `node_modules/next/dist/docs/` en cas de doute.
- Logique métier dans `src/features/*`, jamais dans les pages. Les services reçoivent `db` en paramètre (testables avec PGlite).
- Toute XP / niveau / succès est calculée côté serveur dans `features/progress/service.ts`. Le client n'envoie que des réponses brutes.
- Réglages de jeu dans `src/config/*` (pas de valeurs magiques ailleurs).
- Contenu pédagogique dans `src/db/seed/content/<lang>.ts`, synchronisé par `npm run db:seed` (idempotent, conserve les ids d'exercices).
- Schéma : `src/db/schema.ts` → `npm run db:generate` → nouvelle migration. Ne jamais modifier une migration existante.

## Avant de livrer
`npm run typecheck && npm run lint && npm test && npm run build` doivent passer.
