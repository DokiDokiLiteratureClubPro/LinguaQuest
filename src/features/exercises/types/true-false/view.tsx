"use client";

import { cn } from "@/lib/cn";
import type { ExerciseViewProps } from "../../types";
import type { TrueFalseAnswer, TrueFalseContent } from "./definition";

export function TrueFalseView({ content, answer, onChange, disabled }: ExerciseViewProps<TrueFalseContent, TrueFalseAnswer>) {
  const options = [
    { value: true, label: "Vrai", icon: "👍" },
    { value: false, label: "Faux", icon: "👎" },
  ];
  return (
    <div className="space-y-6">
      <p className="rounded-3xl border-2 border-slate-200 bg-white p-6 text-center text-xl font-bold sm:text-2xl">{content.statement}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => {
          const selected = answer?.value === o.value;
          return (
            <button
              key={o.label}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange({ value: o.value })}
              className={cn(
                "flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-lg font-extrabold transition-all",
                selected ? "border-brand-400 bg-brand-50 text-brand-700 shadow-[0_4px_0_var(--color-brand-300)]" : "border-slate-200 bg-white shadow-[0_4px_0_var(--color-slate-200)] hover:bg-slate-50",
                !disabled && "active:translate-y-1 active:shadow-none",
              )}
            >
              <span className="text-3xl">{o.icon}</span>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
