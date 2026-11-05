"use client";

import { cn } from "@/lib/cn";
import type { ExerciseViewProps } from "../../types";
import type { WordOrderAnswer, WordOrderContent } from "./definition";

/** On travaille avec les index des mots pour gérer les doublons éventuels. */
export function WordOrderView({ content, answer, onChange, disabled }: ExerciseViewProps<WordOrderContent, WordOrderAnswer & { _idx?: number[] }>) {
  const picked: number[] = answer?._idx ?? [];

  function update(next: number[]) {
    onChange(next.length ? { words: next.map((i) => content.words[i]), _idx: next } : null);
  }

  const chip = "rounded-xl border-2 px-3 py-2 text-base font-bold transition-all";

  return (
    <div className="space-y-6">
      <p className="rounded-3xl border-2 border-slate-200 bg-white p-5 text-center text-xl font-bold">« {content.translation} »</p>

      <div className="flex min-h-16 flex-wrap items-center gap-2 border-y-2 border-slate-200 py-3" aria-label="Ta réponse">
        {picked.length === 0 && <span className="text-sm text-slate-400">Touche les mots dans le bon ordre…</span>}
        {picked.map((i, pos) => (
          <button
            key={`${i}-${pos}`}
            type="button"
            disabled={disabled}
            onClick={() => update(picked.filter((_, p) => p !== pos))}
            className={cn(chip, "animate-pop border-brand-300 bg-brand-50 text-brand-700")}
          >
            {content.words[i]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {content.words.map((w, i) => {
          const used = picked.includes(i);
          return (
            <button
              key={`${w}-${i}`}
              type="button"
              disabled={disabled || used}
              onClick={() => update([...picked, i])}
              className={cn(
                chip,
                used ? "border-slate-200 bg-slate-100 text-transparent" : "border-slate-200 bg-white shadow-[0_3px_0_var(--color-slate-200)] hover:bg-slate-50 active:translate-y-0.5 active:shadow-none",
              )}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}
