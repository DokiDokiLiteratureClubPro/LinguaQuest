"use client";

import { ChoiceGrid } from "../../choice-grid";
import type { ExerciseViewProps } from "../../types";
import type { FillBlankAnswer, FillBlankContent } from "./definition";

export function FillBlankView({ content, answer, onChange, disabled }: ExerciseViewProps<FillBlankContent, FillBlankAnswer>) {
  const [before, after] = content.sentence.split("___");
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 text-center">
        <p className="text-xl font-bold sm:text-2xl">
          {before}
          <span className="mx-1 inline-block min-w-20 border-b-4 border-brand-300 px-2 text-brand-600">{answer?.value ?? " "}</span>
          {after}
        </p>
        {content.translation && <p className="mt-2 text-sm text-slate-500">« {content.translation} »</p>}
      </div>
      <ChoiceGrid choices={content.choices} selected={answer?.value ?? null} onSelect={(value) => onChange({ value })} disabled={disabled} columns={1} />
    </div>
  );
}
