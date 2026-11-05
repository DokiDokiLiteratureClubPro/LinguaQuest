import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/features/auth/forms";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold">Crée ton compte ✨</h1>
      <p className="mt-1 mb-6 text-slate-500">Gratuit. Ta progression sera sauvegardée.</p>
      <SignUpForm />
      <p className="mt-6 text-center text-sm text-slate-500">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-bold text-brand-600 hover:underline">
          Connecte-toi
        </Link>
      </p>
    </>
  );
}
