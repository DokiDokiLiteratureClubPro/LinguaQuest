"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { requestPasswordResetAction, resendConfirmationAction, signInAction, signUpAction, updatePasswordAction } from "./actions";
import type { FormState } from "./schemas";

const initial: FormState = {};

function Messages({ state }: { state: FormState }) {
  if (state.error) return <Alert kind="error">{state.error}</Alert>;
  if (state.success) return <Alert kind="success">{state.success}</Alert>;
  return null;
}

export function SignInForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        {linkError && !state.error && (
          <Alert kind="error">Ce lien est invalide ou a expiré. Connecte-toi pour en recevoir un nouveau si besoin.</Alert>
        )}
        <Messages state={state} />
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <Field label="E-mail" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
        <Field label="Mot de passe" name="password" type="password" autoComplete="current-password" required error={state.fieldErrors?.password} />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-brand-600 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
      {state.unconfirmed && <ResendConfirmation email={state.values?.email ?? ""} />}
    </div>
  );
}

/** Renvoie le lien de confirmation (formulaire séparé : les <form> ne s'imbriquent pas). */
function ResendConfirmation({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendConfirmationAction, initial);
  return (
    <form action={action} className="space-y-2 rounded-2xl bg-slate-50 p-3">
      <Messages state={state} />
      <input type="hidden" name="email" value={email} />
      <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
        {pending ? "Envoi…" : "Renvoyer l'e-mail de confirmation"}
      </Button>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, initial);
  if (state.success) return <Alert kind="success">{state.success}</Alert>;
  return (
    <form action={action} className="space-y-4">
      <Messages state={state} />
      <Field label="Pseudo" name="username" autoComplete="username" required defaultValue={state.values?.username} minLength={3} maxLength={20} error={state.fieldErrors?.username} hint="3 à 20 caractères : lettres, chiffres, _" />
      <Field label="E-mail" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
      <Field label="Mot de passe" name="password" type="password" autoComplete="new-password" required minLength={8} error={state.fieldErrors?.password} hint="8 caractères minimum, avec au moins une lettre et un chiffre" />
      <Field label="Confirmer le mot de passe" name="confirm" type="password" autoComplete="new-password" required error={state.fieldErrors?.confirm} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Création…" : "Créer mon compte"}
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);
  return (
    <form action={action} className="space-y-4">
      <Messages state={state} />
      <Field label="E-mail" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Envoi…" : "Recevoir un lien"}
      </Button>
    </form>
  );
}

export function NewPasswordForm({ redirectToDashboard = false }: { redirectToDashboard?: boolean }) {
  const [state, action, pending] = useActionState(updatePasswordAction, initial);
  return (
    <form action={action} className="space-y-4">
      <Messages state={state} />
      {redirectToDashboard && <input type="hidden" name="redirect" value="dashboard" />}
      <Field label="Nouveau mot de passe" name="password" type="password" autoComplete="new-password" required minLength={8} error={state.fieldErrors?.password} hint="8 caractères minimum, avec au moins une lettre et un chiffre" />
      <Field label="Confirmer" name="confirm" type="password" autoComplete="new-password" required error={state.fieldErrors?.confirm} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </Button>
    </form>
  );
}
