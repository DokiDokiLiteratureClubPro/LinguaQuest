import type { Metadata } from "next";
import { db } from "@/db";
import { requireProfile } from "@/features/auth/session";
import { LanguagePicker } from "@/features/progress/language-picker";
import { getActiveLanguages } from "@/features/progress/queries";

export const metadata: Metadata = { title: "Choisir une langue" };

export default async function LearnPage() {
  const profile = await requireProfile();
  const langs = await getActiveLanguages(db);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Quelle langue veux-tu apprendre ?</h1>
        <p className="text-slate-500">Tu peux en apprendre plusieurs et changer à tout moment : ta progression est gardée pour chacune.</p>
      </div>
      <LanguagePicker languages={langs} active={profile.activeLanguage} />
      <p className="text-center text-sm text-slate-400">D&apos;autres langues arrivent bientôt : allemand, italien, japonais, coréen, portugais…</p>
    </div>
  );
}
