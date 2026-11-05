import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/features/progress/service";

export type AuthUser = { id: string; email: string | null; metadata: { username?: string; display_name?: string } };

/**
 * Utilisateur authentifié, mis en cache pour la requête.
 * `getClaims()` vérifie la signature du jeton localement (clés asymétriques Supabase),
 * ce qui évite un aller-retour réseau vers Supabase Auth à chaque page.
 */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    metadata: (claims.user_metadata ?? {}) as AuthUser["metadata"],
  };
});

/** Profil de l'utilisateur connecté, créé au besoin. Redirige vers /login sinon. */
export const requireProfile = cache(async () => {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return ensureProfile(db, {
    id: user.id,
    email: user.email,
    username: user.metadata.username,
    displayName: user.metadata.display_name,
  });
});

/** Variante pour les Server Actions : renvoie l'id ou redirige vers /login. */
export async function requireUserId(): Promise<string> {
  const profile = await requireProfile();
  return profile.id;
}
