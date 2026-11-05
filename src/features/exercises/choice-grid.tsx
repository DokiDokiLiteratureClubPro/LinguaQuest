"use client";

import { cn } from "@/lib/cn";

/** Grille de choix réutilisée par plusieurs types d'exercices (QCM, image, trous…). */
export function ChoiceGrid({
  choices,
  selected,
  onSelect,
  disabled,
  columns = 2,
  renderExtra,
}: {
  choices: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  disabled: boolean;
  columns?: 1 | 2;
  renderExtra?: (choice: string) => React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-3", columns === 2 ? "sm:grid-cols-2" : "")}>
      {choices.map((choice, i) => {
        const isSelected = selected === choice;
        return (
          <div key={choice} className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(choice)}
              aria-pressed={isSelected}
              className={cn(
                "flex min-h-14 flex-1 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-bold transition-all",
                isSelected
                  ? "border-brand-400 bg-brand-50 text-brand-700 shadow-[0_4px_0_var(--color-brand-300)]"
                  : "border-slate-200 bg-white shadow-[0_4px_0_var(--color-slate-200)] hover:bg-slate-50",
                !disabled && "active:translate-y-1 active:shadow-none",
              )}
            >
              <kbd className={cn("grid size-7 shrink-0 place-items-center rounded-lg border-2 text-xs", isSelected ? "border-brand-300" : "border-slate-200 text-slate-400")}>
                {i + 1}
              </kbd>
              {choice}
            </button>
            {renderExtra?.(choice)}
          </div>
        );
      })}
    </div>
  );
}
