# LinguaQuest 🌍

Plateforme d'apprentissage des langues, ludique et progressive : exercices interactifs, XP, niveaux, séries quotidiennes et succès.

**Stack** : Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Supabase (Auth + PostgreSQL) · Drizzle ORM · Zod · Vitest.

---

## 🚀 Installation (première fois)

### 1. Prérequis
- [Node.js](https://nodejs.org) 20.9 ou plus récent (version LTS conseillée)
- Un compte gratuit [Supabase](https://supabase.com)

### 2. Créer le projet Supabase
1. Sur supabase.com → **New project**. Choisis une région proche (ex. *West EU (Paris)*), puis note bien le **mot de passe de la base**.
2. **Project Settings → API Keys** : copie la **Publishable key** (ou l'ancienne clé `anon`).
3. **Project Settings → Data API** (ou la page d'accueil du projet) : copie l'**URL du projet** (`https://xxxx.supabase.co`).
4. Bouton **Connect** (en haut) → onglet **ORM** → choisis **Drizzle**. Dans le bloc `.env.local` affiché, copie la valeur de `DATABASE_URL` (celle marquée *transaction-mode pooler*, qui se termine par `:6543/postgres`) et remplace `[YOUR-PASSWORD]` par ton mot de passe. ⚠️ N'exécute pas les commandes `npm install …` proposées par Supabase : le projet est déjà configuré.
5. **Authentication → URL Configuration** :
   - *Site URL* : `http://localhost:3000` (à remplacer par l'URL de prod plus tard)
   - *Redirect URLs* : ajoute `http://localhost:3000/**`

### 3. Configurer le projet
```bash
cd LinguaQuest
npm install
copy .env.example .env.local     # Windows (sur Mac/Linux : cp)
```
Ouvre `.env.local` et remplis les 4 valeurs.

### 4. Créer les tables et le contenu
```bash
npm run db:setup
```
Cette commande applique les migrations (tables + sécurité), puis charge les langues, leçons, exercices et succès.

### 5. Lancer le site
```bash
npm run dev
```
→ http://localhost:3000

> **Liens envoyés par e-mail (recommandé)** : par défaut, le lien de confirmation ne fonctionne que dans le navigateur où l'on s'est inscrit. Pour qu'il marche partout (téléphone, autre navigateur, messagerie qui pré-ouvre les liens), modifie deux modèles dans **Authentication → Emails → Templates** :
> - **Confirm signup** : remplace `{{ .ConfirmationURL }}` par `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
> - **Reset password** : remplace `{{ .ConfirmationURL }}` par `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
>
> Si un lien a expiré, la page de connexion propose de renvoyer l'e-mail de confirmation.

> **E-mail de confirmation** : par défaut, Supabase demande de confirmer l'adresse e-mail à l'inscription. Son service d'e-mail intégré est **très limité** (quelques e-mails par heure) et sert uniquement aux tests. Pendant le développement, tu peux désactiver la confirmation : **Authentication → Sign In / Providers → Email → Confirm email**. Avant l'ouverture au public, configure un SMTP gratuit (Resend, Brevo…) dans **Authentication → Emails → SMTP Settings**.

---

## 📜 Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm test` | Tests (correction des exercices, XP, niveaux, séries, parcours complet en base) |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |
| `npm run db:generate` | Génère une migration après modification de `src/db/schema.ts` |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:seed` | Synchronise le contenu (relançable sans risque) |
| `npm run db:setup` | `db:migrate` + `db:seed` |

---

## ☁️ Mise en ligne gratuite (Vercel)

1. Pousse le projet sur GitHub.
2. Sur [vercel.com](https://vercel.com) → **Add New → Project** → importe le dépôt.
3. Dans **Environment Variables**, ajoute les 4 variables de `.env.local`. `NEXT_PUBLIC_SITE_URL` doit valoir l'URL Vercel, par ex. `https://linguaquest.vercel.app`.
4. **Deploy**.
5. Dans Supabase → **Authentication → URL Configuration** : mets l'URL Vercel en *Site URL* et ajoute `https://linguaquest.vercel.app/**` aux *Redirect URLs*.

> 🌍 `vercel.json` place le serveur à Dublin (`dub1`), à côté de la base Supabase (`eu-west-1`). Chaque requête à la base est ainsi quasi instantanée. Si tu crées un jour un projet Supabase dans une autre région, adapte cette valeur.

> ✅ À chaque push sur `main`, GitHub vérifie automatiquement le code (types, lint, tests, build) grâce à `.github/workflows/ci.yml`.

> ⚠️ Le plan gratuit de Vercel (Hobby) est réservé à un usage **non commercial**. Dès que tu ajoutes de la pub ou un abonnement, il faut passer à Vercel Pro (20 $/mois) ou migrer vers un hébergeur qui autorise l'usage commercial gratuit (ex. Cloudflare). Le code n'utilise rien de spécifique à Vercel.

---

## 🧱 Architecture

```
src/
├─ app/                       # Pages (routes)
│  ├─ (marketing)/            # Page d'accueil publique
│  ├─ (auth)/                 # Connexion, inscription, mot de passe oublié / nouveau
│  ├─ (app)/                  # Espace connecté (avec navigation)
│  │  ├─ dashboard/  learn/  learn/[lang]/  achievements/  profile/
│  ├─ (lesson)/learn/[lang]/[lesson]/   # Leçon en mode "concentration"
│  └─ auth/confirm/           # Arrivée des liens envoyés par e-mail
├─ components/                # UI réutilisable (boutons, cartes, barres…)
├─ config/
│  ├─ gamification.ts         # ⚙️ XP, niveaux, bonus, séries, plafond quotidien
│  ├─ achievements.ts         # ⚙️ Catalogue des succès
│  └─ features.ts             # ⚙️ Interrupteurs (Premium, publicités)
├─ db/
│  ├─ schema.ts               # Schéma de la base (source de vérité)
│  └─ seed/content/           # 📚 Contenu pédagogique, un fichier par langue
├─ features/                  # Modules métier
│  ├─ auth/                   # Actions, formulaires, session
│  ├─ exercises/              # Moteur d'exercices (registre + 1 dossier par type)
│  ├─ gamification/           # Calculs purs : XP, niveaux, séries, succès
│  ├─ lesson/                 # Lecteur de leçon + écran de résultats
│  ├─ monetization/           # Droits d'accès (Premium) et emplacements pub
│  ├─ profile/
│  └─ progress/               # Logique serveur : sessions, correction, XP, succès
├─ lib/                       # Supabase, variables d'environnement, utilitaires
└─ proxy.ts                   # Protection des pages + rafraîchissement de session
drizzle/                      # Migrations SQL versionnées
tests/                        # Tests Vitest (avec une vraie base PostgreSQL en mémoire)
```

### Sécurité
- **Mots de passe** : gérés par Supabase Auth (hash bcrypt, jamais en clair). Les sessions sont stockées en cookies httpOnly et rafraîchies par `proxy.ts`.
- **Anti-triche** : le navigateur n'envoie que des réponses brutes. La correction, le score, l'XP, les niveaux et les succès sont calculés côté serveur (`features/progress/service.ts`).
  - Les solutions ne sont jamais envoyées au navigateur avant la réponse.
  - On ne peut répondre qu'une fois par exercice et par session, et une leçon ne se termine qu'une fois.
  - Rejouer une leçon rapporte moins d'XP, et l'XP gagnée par jour est plafonnée.
- **Traçabilité** : chaque gain d'XP est inscrit dans `xp_events`, ce qui rend l'XP vérifiable.
- **Base de données** : la Row Level Security est activée sur toutes les tables, sans policy. L'API publique de Supabase ne peut donc ni lire ni écrire les données. Seul le serveur Next.js y accède.
- **Validation** : toutes les entrées serveur sont validées avec Zod.
- **Redirections** : uniquement internes, pour éviter les « open redirects ».

---

## ➕ Faire évoluer le projet

### Ajouter une langue
1. Copie `src/db/seed/content/en.ts` en `de.ts`, par exemple, et traduis le contenu.
2. Ajoute-la dans `src/db/seed/content/index.ts`.
3. Lance `npm run db:seed`.

### Ajouter des leçons ou des exercices
Modifie le fichier de la langue concernée, puis lance `npm run db:seed`. Le contenu est validé avant l'écriture : une erreur indique précisément la leçon et l'exercice fautifs.

### Ajouter un type d'exercice
1. Crée `src/features/exercises/types/<nom>/definition.ts` (schémas, correction) et `view.tsx` (affichage).
2. Enregistre-le dans `definitions.ts` et `views.tsx`.
3. Ajoute un *builder* dans `src/db/seed/builders.ts` pour l'utiliser dans le contenu.

### Ajouter un succès
Ajoute une entrée dans `src/config/achievements.ts`, puis lance `npm run db:seed`.

### Modifier la base de données
1. Modifie `src/db/schema.ts`.
2. Lance `npm run db:generate`, puis `npm run db:migrate`.
3. Ne modifie jamais une migration déjà appliquée.

### Monétisation (plus tard)
- `profiles.plan` (`free` / `premium`) et `lessons.is_premium` existent déjà.
- `features.premiumEnabled` et `features.adsEnabled` activent les restrictions et les emplacements `<AdSlot />`.
- La seule fonction à faire évoluer est `features/monetization/entitlements.ts`.
