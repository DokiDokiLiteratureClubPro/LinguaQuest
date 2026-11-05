import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { db } from "@/db";
import { requireProfile } from "@/features/auth/session";
import { getAchievementsOverview } from "@/features/progress/queries";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Succès" };

export default async function AchievementsPage() {
  const profile = await requireProfile();
  const list = await getAchievementsOverview(db, profile.id);
  const unlocked = list.filter((a) => a.unlockedAt);
  const locked = list.filter((a) => !a.unlockedAt);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Succès 🏆</h1>
          <p className="text-slate-500">
            {unlocked.length} débloqué{unlocked.length > 1 ? "s" : ""} sur {list.length}
          </p>
        </div>
        <ProgressBar value={list.length ? unlocked.length / list.length : 0} color="xp" className="max-w-xs" label="Succès débloqués" />
      </div>

      {unlocked.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-extrabold text-slate-500">Débloqués</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {unlocked.map((a) => (
              <Card key={a.slug} className="flex items-center gap-4 border-xp-400/50 bg-gradient-to-br from-xp-100/70 to-white p-4 sm:p-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-sm">{a.icon}</span>
                <div className="flex-1">
                  <p className="font-extrabold">{a.name}</p>
                  <p className="text-sm text-slate-500">{a.description}</p>
                  <p className="mt-1 text-xs font-bold text-xp-600">
                    Obtenu le {a.unlockedAt!.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-extrabold text-slate-500">À débloquer</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {locked.map((a) => (
              <Card key={a.slug} className="flex items-center gap-4 p-4 sm:p-4">
                <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-100 text-3xl grayscale opacity-60")}>{a.icon}</span>
                <div className="flex-1 space-y-1">
                  <p className="font-extrabold">{a.name}</p>
                  <p className="text-sm text-slate-500">{a.description}</p>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={a.progress.current / a.progress.target} className="h-2" />
                    <span className="shrink-0 text-xs font-bold text-slate-400">
                      {a.progress.current}/{a.progress.target}
                    </span>
                  </div>
                </div>
                {a.xpReward > 0 && <span className="text-xs font-bold text-xp-600">+{a.xpReward} XP</span>}
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
