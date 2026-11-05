import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewPasswordForm } from "@/features/auth/forms";
import { getAuthUser } from "@/features/auth/session";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function ResetPasswordPage() {
  // On arrive ici via le lien e-mail, qui a ouvert une session temporaire.
  if (!(await getAuthUser())) redirect("/login?error=lien");
  return (
    <>
      <h1 className="text-2xl font-extrabold">Nouveau mot de passe 🔒</h1>
      <p className="mt-1 mb-6 text-slate-500">Choisis un mot de passe que tu n&apos;utilises pas ailleurs.</p>
      <NewPasswordForm redirectToDashboard />
    </>
  );
}
