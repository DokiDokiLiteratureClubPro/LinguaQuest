"use client";

import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { FormState } from "@/features/auth/schemas";
import { cn } from "@/lib/cn";
import { updateProfileAction } from "./actions";
import { AVATARS } from "./avatars";

export function ProfileForm({ profile }: { profile: { displayName: string; username: string; avatar: string } }) {
  const [state, action, pending] = useActionState(updateProfileAction, {} as FormState);
  const [avatar, setAvatar] = useState(profile.avatar);

  return (
    <form action={action} className="space-y-5">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.success && <Alert kind="success">{state.success}</Alert>}
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-slate-700">Avatar</legend>
        <input type="hidden" name="avatar" value={avatar} />
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              aria-pressed={avatar === a}
              className={cn("grid size-12 place-items-center rounded-2xl border-2 text-2xl transition-all", avatar === a ? "border-brand-400 bg-brand-50 scale-110" : "border-slate-200 hover:bg-slate-50")}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>
      <Field label="Nom affiché" name="displayName" defaultValue={state.values?.displayName ?? profile.displayName} maxLength={40} required error={state.fieldErrors?.displayName} />
      <Field label="Pseudo" name="username" defaultValue={state.values?.username ?? profile.username} maxLength={20} required error={state.fieldErrors?.username} hint="3 à 20 caractères : lettres, chiffres, _" />
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
