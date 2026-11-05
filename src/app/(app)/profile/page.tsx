import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { plans, type Plan } from "@/config/features";
import { signOutAction } from "@/features/auth/actions";
import { NewPasswordForm } from "@/features/auth/forms";
import { getAuthUser, requireProfile } from "@/features/auth/session";
import { ProfileForm } from "@/features/profile/profile-form";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const profile = await requireProfile();
  const user = await getAuthUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <span className="grid size-20 place-items-center rounded-full bg-brand-100 text-5xl">{profile.avatar}</span>
        <div>
          <h1 className="text-2xl font-extrabold">{profile.displayName}</h1>
          <p className="text-slate-500">
            @{profile.username} · {user?.email}
          </p>
          <p className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            Offre {plans[profile.plan as Plan]?.label ?? profile.plan}
          </p>
        </div>
      </div>

      <Card className="space-y-4">
        <CardTitle>Mon profil</CardTitle>
        <ProfileForm profile={profile} />
      </Card>

      <Card className="space-y-4">
        <CardTitle>Changer de mot de passe</CardTitle>
        <NewPasswordForm />
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>Déconnexion</CardTitle>
          <p className="text-sm text-slate-500">Ta progression reste sauvegardée sur ton compte.</p>
        </div>
        <form action={signOutAction}>
          <Button variant="secondary" type="submit">
            Se déconnecter
          </Button>
        </form>
      </Card>
    </div>
  );
}
