import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/forms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold">Mot de passe oublié 🔑</h1>
      <p className="mt-1 mb-6 text-slate-500">Indique ton e-mail : on t&apos;envoie un lien pour en choisir un nouveau.</p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-bold text-brand-600 hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </>
  );
}
