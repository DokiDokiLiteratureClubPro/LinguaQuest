"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  emailSchema,
  fieldErrorsFrom,
  keepValues,
  passwordSchema,
  safeNext,
  usernameSchema,
  type FormState,
} from "./schemas";

const signUpSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Les mots de passe ne correspondent pas." });

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = keepValues(formData, ["username", "email"]);
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, fieldErrors: fieldErrorsFrom(parsed.error) };
  const { username, email, password } = parsed.data;

  const taken = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.username, username)).limit(1);
  if (taken[0]) return { values, fieldErrors: { username: "Ce pseudo est déjà utilisé." } };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.siteUrl()}/auth/confirm?next=/dashboard`,
      data: { username, display_name: username },
    },
  });
  if (error) {
    if (error.code === "weak_password") return { values, fieldErrors: { password: "Mot de passe trop faible ou trop courant." } };
    if (error.code === "over_email_send_rate_limit") return { values, error: "Trop de tentatives. Réessaie dans quelques minutes." };
    return { values, error: "L'inscription a échoué. Réessaie plus tard." };
  }
  if (data.session) redirect("/dashboard");
  return {
    success: "Compte créé ! Clique sur le lien reçu par e-mail pour l'activer — de préférence dans ce même navigateur.",
  };
}

const signInSchema = z.object({ email: emailSchema, password: z.string().min(1, "Mot de passe requis.") });

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = keepValues(formData, ["email"]);
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, fieldErrors: fieldErrorsFrom(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { values, unconfirmed: true, error: "Ton adresse e-mail n'est pas encore confirmée. Clique sur le lien reçu à l'inscription, ou demande-en un nouveau ci-dessous." };
    }
    return { values, error: "E-mail ou mot de passe incorrect." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function resendConfirmationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ email: emailSchema }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${env.siteUrl()}/auth/confirm?next=/dashboard` },
  });
  if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
    return { error: "Trop de demandes. Patiente quelques minutes avant de redemander un lien." };
  }
  // Même message dans tous les autres cas : on ne révèle pas quels comptes existent.
  return { success: "Si ce compte attend une confirmation, un nouveau lien vient d'être envoyé. Ouvre-le dans ce navigateur." };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ email: emailSchema }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values: keepValues(formData, ["email"]), fieldErrors: fieldErrorsFrom(parsed.error) };

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.siteUrl()}/auth/confirm?next=/reset-password`,
  });
  // Même message que l'adresse existe ou non : on ne révèle pas quels comptes existent.
  return { success: "Si un compte existe pour cette adresse, un lien de réinitialisation vient d'être envoyé." };
}

const newPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Les mots de passe ne correspondent pas." });

export async function updatePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Lien expiré. Refais une demande de réinitialisation." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { fieldErrors: { password: "Choisis un mot de passe différent de l'ancien." } };
    if (error.code === "weak_password") return { fieldErrors: { password: "Mot de passe trop faible ou trop courant." } };
    return { error: "Impossible de modifier le mot de passe." };
  }
  if (formData.get("redirect") === "dashboard") redirect("/dashboard");
  return { success: "Mot de passe mis à jour." };
}
