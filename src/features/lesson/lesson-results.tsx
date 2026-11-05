"use client";

import { Button, LinkButton } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { LessonResult } from "@/features/progress/service";
import { cn } from "@/lib/cn";

export function LessonResults({ result, languageCode, onReplay }: { result: LessonResult; languageCode: string; onReplay: () => void }) {
  const levelUp = result.level.level > result.levelBefore;
  const title = result.perfect ? "Sans faute ! 💎" : result.passed ? "Leçon terminée ! 🎉" : "Continue de t'entraîner 💪";

  return (
    <div className="mx-auto w-full max-w-lg flex-1 space-y-6 px-4 py-10">
      <div className="animate-pop text-center">
        <div className="text-7xl">{result.perfect ? "🏆" : result.passed ? "🎉" : "📚"}</div>
        <h1 className="mt-3 text-3xl font-extrabold">{title}</h1>
        {!result.passed && <p className="mt-1 text-slate-500">Il faut au moins 50 % de bonnes réponses pour valider la leçon.</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Tile label="Score" value={`${result.score} %`} className="border-emerald-200 bg-emerald-50 text-emerald-700" />
        <Tile label="XP gagnée" value={`+${result.xpGained}`} className="border-xp-400/40 bg-xp-100 text-xp-600" />
        <Tile label="Série" value={`${result.streak} 🔥`} className="border-orange-200 bg-orange-50 text-orange-600" />
      </div>

      {levelUp && (
        <div className="animate-pop rounded-3xl border-2 border-xp-400 bg-gradient-to-r from-xp-100 to-white p-5 text-center">
          <p className="text-sm font-extrabold uppercase tracking-wider text-xp-600">Niveau supérieur !</p>
          <p className="text-4xl font-extrabold">⭐ Niveau {result.level.level}</p>
        </div>
      )}

      <div className="space-y-2 rounded-3xl border-2 border-slate-200 bg-white p-5">
        <div className="flex justify-between text-sm font-bold">
          <span>Niveau {result.level.level}</span>
          <span className="text-slate-400">
            {result.level.xpIntoLevel}/{result.level.xpForLevel} XP
          </span>
        </div>
        <ProgressBar value={result.level.progress} color="xp" />
        {result.breakdown.length > 0 && (
          <ul className="mt-3 space-y-1 border-t-2 border-slate-100 pt-3 text-sm">
            {result.breakdown.map((b) => (
              <li key={b.label} className="flex justify-between">
                <span className="text-slate-500">{b.label}</span>
                <span className={cn("font-bold", b.amount < 0 ? "text-slate-400" : "text-slate-800")}>
                  {b.amount > 0 ? "+" : ""}
                  {b.amount} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {result.achievements.length > 0 && (
        <div className="space-y-2">
          <p className="text-center text-sm font-extrabold uppercase tracking-wider text-slate-500">Nouveaux succès</p>
          {result.achievements.map((a, i) => (
            <div key={a.slug} className="flex animate-fade-in items-center gap-3 rounded-2xl border-2 border-xp-400/50 bg-xp-100/60 p-3" style={{ animationDelay: `${i * 120}ms` }}>
              <span className="text-3xl">{a.icon}</span>
              <span className="flex-1 font-extrabold">{a.name}</span>
              {a.xpReward > 0 && <span className="text-sm font-bold text-xp-600">+{a.xpReward} XP</span>}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" size="lg" onClick={onReplay}>
          Rejouer
        </Button>
        <LinkButton href={`/learn/${languageCode}`} size="lg">
          Continuer
        </LinkButton>
      </div>
    </div>
  );
}

function Tile({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className={cn("rounded-2xl border-2 p-3 text-center", className)}>
      <p className="text-[11px] font-extrabold uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-xl font-extrabold">{value}</p>
    </div>
  );
}
