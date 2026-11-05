-- Sécurité : lie chaque profil à un compte Supabase Auth et verrouille l'API publique.
--
-- Supabase expose automatiquement les tables du schéma `public` via son API REST
-- (avec la clé publique). L'application n'utilise PAS cette API : elle passe par le
-- serveur Next.js. On active donc la Row Level Security SANS aucune policy, ce qui
-- interdit tout accès direct aux tables depuis le navigateur. Le serveur, lui, se
-- connecte avec le rôle propriétaire et n'est pas concerné.

ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_id_auth_users_fk"
  FOREIGN KEY ("id") REFERENCES auth.users ("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "languages" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "lessons" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "exercises" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "user_languages" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "lesson_sessions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "exercise_attempts" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "lesson_progress" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "xp_events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "daily_activity" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "achievements" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "user_achievements" ENABLE ROW LEVEL SECURITY;
