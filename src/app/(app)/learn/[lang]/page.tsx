import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { db } from "@/db";
import { requireProfile } from "@/features/auth/session";
import { canAccessLesson } from "@/features/monetization/entitlements";
import { getLanguage, getLearningPath } from "@/features/progress/queries";
import { cn } from "@/lib/cn";

const DIFFICULTY: Record<number, string> = { 1: "● Débutant", 2: "●● Intermédiaire", 3: "●●● Avancé" };

export async function generateMetadata({ params }: PageProps<"/learn/[lang]">): Promise<Metadata> {
  const lang = await getLanguage(db, (await params).lang);
  return { title: lang ? `Apprendre l'${lang.name.toLowerCase()}` : "Apprendre" };
}

export default async function LanguagePathPage({ params }: PageProps<"/learn/[lang]">) {
  const { lang: code } = await params;
  const profile = await requireProfile();
  const language = await getLanguage(db, code);
  if (!language) notFound();
  const path = await getLearningPath(db, profile.id, language.code);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-6xl">{language.flag}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{language.name}</h1>
          <p className="text-slate-500">
            {path.done}/{path.total} leçons terminées
          </p>
          <ProgressBar value={path.total ? path.done / path.total : 0} color="success" className="mt-2 max-w-xs" />
        </div>
        <Link href="/learn" className="text-sm font-bold text-brand-600 hover:underline">
          Changer de langue
        </Link>
      </div>

      {path.groups.map(({ category, lessons }) => (
        <section key={category.id} className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-brand-100 text-2xl">{category.icon}</span>
            <div>
              <h2 className="text-lg font-extrabold">{category.name}</h2>
              <p className="text-sm text-slate-500">{category.description}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {lessons.map((l) => {
              const locked = !canAccessLesson(profile.plan, l);
              const done = l.completions > 0;
              const isNext = path.next?.id === l.id;
              return (
                <Link
                  key={l.id}
                  href={locked ? "#" : `/learn/${language.code}/${l.slug}`}
                  aria-disabled={locked}
                  className={cn("block transition-transform hover:-translate-y-0.5", locked && "pointer-events-none opacity-60")}
                >
                  <Card className={cn("flex items-center gap-4 p-4 sm:p-4", isNext && "border-brand-300 ring-4 ring-brand-100", done && "border-emerald-200")}>
                    <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl text-3xl", done ? "bg-emerald-100" : "bg-slate-100")}>{l.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold">{l.title}</p>
                      <p className="truncate text-sm text-slate-500">{l.description}</p>
                      <p className="mt-1 text-xs font-bold">
                        {locked ? (
                          <span className="text-xp-600">👑 Premium</span>
                        ) : done ? (
                          <span className="text-emerald-600">✓ Meilleur score : {l.bestScore} %</span>
                        ) : isNext ? (
                          <span className="text-brand-600">▶ À faire ensuite</span>
                        ) : (
                          <span className="text-slate-400">{DIFFICULTY[l.difficulty] ?? "Avancé"}</span>
                        )}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
