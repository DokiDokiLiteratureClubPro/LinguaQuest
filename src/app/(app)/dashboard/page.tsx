import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { db } from "@/db";
import { requireProfile } from "@/features/auth/session";
import { levelFromXp } from "@/features/gamification/levels";
import { displayedStreak } from "@/features/gamification/streak";
import { AdSlot } from "@/features/monetization/ad-slot";
import { getDashboardData } from "@/features/progress/queries";

export const metadata: Metadata = { title: "Tableau de bord" };

const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];

export default async function DashboardPage() {
  const profile = await requireProfile();
  const data = await getDashboardData(db, profile.id, profile.activeLanguage);
  const level = levelFromXp(profile.xpTotal);
  const streak = displayedStreak(profile.lastActiveDate, profile.currentStreak);
  const accuracy = profile.totalAnswers ? Math.round((profile.totalCorrect / profile.totalAnswers) * 100) : 0;
  const maxDayXp = Math.max(30, ...data.days.map((d) => d.xp));
  const activeLang = data.myLanguages.find((l) => l.code === profile.activeLanguage);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Salut {profile.displayName} {profile.avatar}</h1>
        <p className="text-slate-500">
          {streak > 0 ? `Tu es sur une série de ${streak} jour${streak > 1 ? "s" : ""}. Continue comme ça !` : "Une petite leçon aujourd'hui pour lancer ta série ?"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reprendre */}
        <Card className="relative overflow-hidden border-brand-200 bg-gradient-to-br from-brand-600 to-brand-800 text-white lg:col-span-2">
          <div className="absolute -right-6 -bottom-8 text-[9rem] leading-none opacity-15 select-none" aria-hidden>
            {data.path?.next?.icon ?? "🌍"}
          </div>
          {data.path && profile.activeLanguage ? (
            <div className="relative space-y-4">
              <p className="text-sm font-bold uppercase tracking-wider text-brand-200">
                {activeLang?.flag ?? ""} Continuer ton apprentissage
              </p>
              {data.path.next ? (
                <>
                  <h2 className="text-2xl font-extrabold">{data.path.next.title}</h2>
                  <p className="max-w-md text-brand-100">{data.path.next.description}</p>
                  <LinkButton href={`/learn/${profile.activeLanguage}/${data.path.next.slug}`} variant="xp" size="lg">
                    Reprendre ▶
                  </LinkButton>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-extrabold">Toutes les leçons sont terminées 🎉</h2>
                  <p className="text-brand-100">Rejoue-les pour améliorer ton score, ou commence une nouvelle langue.</p>
                  <LinkButton href={`/learn/${profile.activeLanguage}`} variant="xp" size="lg">
                    Voir le parcours
                  </LinkButton>
                </>
              )}
              <div className="max-w-md space-y-1">
                <div className="flex justify-between text-xs font-bold text-brand-200">
                  <span>Progression du parcours</span>
                  <span>
                    {data.path.done}/{data.path.total} leçons
                  </span>
                </div>
                <ProgressBar value={data.path.total ? data.path.done / data.path.total : 0} color="xp" className="bg-white/20" />
              </div>
            </div>
          ) : (
            <div className="relative space-y-4">
              <h2 className="text-2xl font-extrabold">Choisis ta première langue</h2>
              <p className="max-w-md text-brand-100">Anglais, espagnol… tu pourras en changer à tout moment.</p>
              <LinkButton href="/learn" variant="xp" size="lg">
                Commencer ▶
              </LinkButton>
            </div>
          )}
        </Card>

        {/* Niveau */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Niveau {level.level}</CardTitle>
            <span className="text-3xl">⭐</span>
          </div>
          <ProgressBar value={level.progress} color="xp" label="Progression vers le niveau suivant" />
          <p className="text-sm text-slate-500">
            <strong className="text-slate-800">{level.xpForLevel - level.xpIntoLevel} XP</strong> avant le niveau {level.level + 1}
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Stat label="XP totale" value={profile.xpTotal.toLocaleString("fr-FR")} />
            <Stat label="Série" value={`${streak} 🔥`} />
            <Stat label="Réussite" value={`${accuracy} %`} />
            <Stat label="Leçons" value={profile.lessonsCompleted} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activité de la semaine */}
        <Card className="space-y-4">
          <CardTitle>Cette semaine</CardTitle>
          <div className="flex h-36 items-end justify-between gap-2">
            {data.days.map((d) => {
              const date = new Date(`${d.day}T12:00:00Z`);
              return (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">{d.xp || ""}</span>
                  <div
                    className={d.xp ? "w-full rounded-lg bg-brand-500" : "w-full rounded-lg bg-slate-100"}
                    style={{ height: `${Math.max(6, (d.xp / maxDayXp) * 96)}px` }}
                    title={`${d.xp} XP`}
                  />
                  <span className="text-xs font-bold text-slate-400">{WEEKDAYS[date.getUTCDay()]}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400">Meilleure série : {profile.longestStreak} jour(s) · Meilleur combo : {profile.bestCombo}</p>
        </Card>

        {/* Langues */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>Mes langues</CardTitle>
            <Link href="/learn" className="text-sm font-bold text-brand-600 hover:underline">
              + Ajouter
            </Link>
          </div>
          {data.myLanguages.length === 0 ? (
            <p className="text-sm text-slate-500">Termine une leçon pour voir tes langues ici.</p>
          ) : (
            <ul className="space-y-2">
              {data.myLanguages.map((l) => (
                <li key={l.code}>
                  <Link href={`/learn/${l.code}`} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-slate-50">
                    <span className="text-3xl">{l.flag}</span>
                    <span className="flex-1 font-bold">{l.name}</span>
                    <span className="text-sm font-extrabold text-xp-600">{l.xp} XP</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Succès */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>Derniers succès</CardTitle>
            <Link href="/achievements" className="text-sm font-bold text-brand-600 hover:underline">
              {data.achievementCounts.unlocked}/{data.achievementCounts.total}
            </Link>
          </div>
          {data.lastAchievements.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun succès pour l&apos;instant. Le premier est à une leçon d&apos;ici !</p>
          ) : (
            <ul className="space-y-2">
              {data.lastAchievements.map((a) => (
                <li key={a.name} className="flex items-center gap-3 rounded-2xl bg-xp-100/50 p-2">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <p className="font-bold leading-tight">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Exercices récents */}
      <Card className="space-y-3">
        <CardTitle>Leçons récentes</CardTitle>
        {data.recent.length === 0 ? (
          <p className="text-sm text-slate-500">Tes leçons terminées apparaîtront ici.</p>
        ) : (
          <ul className="divide-y-2 divide-slate-100">
            {data.recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <span className="text-2xl">{r.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    {r.flag} {r.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.correct}/{r.answered} bonnes réponses · {r.completedAt?.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-xp-600">+{r.xp} XP</span>
                <Link href={`/learn/${r.languageCode}/${r.slug}`} className="text-sm font-bold text-brand-600 hover:underline">
                  Rejouer
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AdSlot plan={profile.plan} slot="dashboard-bottom" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}
