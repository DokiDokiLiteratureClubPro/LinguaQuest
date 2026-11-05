import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/features/auth/forms";
import { safeNext } from "@/features/auth/schemas";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  return (
    <>
      <h1 className="text-2xl font-extrabold">Content de te revoir 👋</h1>
      <p className="mt-1 mb-6 text-slate-500">Connecte-toi pour reprendre ta progression.</p>
      <SignInForm next={safeNext(params.next)} linkError={params.error === "lien"} />
      <p className="mt-6 text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-bold text-brand-600 hover:underline">
          Inscris-toi gratuitement
        </Link>
      </p>
    </>
  );
}
