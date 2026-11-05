import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Adresse e-mail invalide.");

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(72, "Le mot de passe est trop long (72 caractères max).")
  .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre.")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.");

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, "Pseudo : 3 à 20 caractères (lettres, chiffres, _).");

export const displayNameSchema = z.string().trim().min(1, "Nom requis.").max(40, "40 caractères maximum.");

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  /** Valeurs saisies (hors mots de passe), pour ne pas vider le formulaire en cas d'erreur. */
  values?: Record<string, string>;
  /** L'adresse e-mail n'est pas encore confirmée : propose de renvoyer le lien. */
  unconfirmed?: boolean;
};

/** Récupère les champs non sensibles d'un formulaire. */
export function keepValues(formData: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")]));
}

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/** N'autorise que les redirections internes (évite les "open redirects"). */
export function safeNext(next: unknown, fallback = "/dashboard"): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
