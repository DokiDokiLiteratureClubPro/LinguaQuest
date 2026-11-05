"use client";

import { ChoiceGrid } from "../../choice-grid";
import { SpeakButton } from "../../speak-button";
import type { ExerciseViewProps } from "../../types";
import type { ImageChoiceAnswer, ImageChoiceContent } from "./definition";

export function ImageChoiceView({ content, answer, onChange, disabled, speechLocale }: ExerciseViewProps<ImageChoiceContent, ImageChoiceAnswer>) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        {content.color ? (
          <div className="size-36 animate-pop rounded-[2rem] border-4 border-white shadow-lg" style={{ backgroundColor: content.color }} aria-label="Couleur à identifier" role="img" />
        ) : (
          <div className="grid size-40 animate-pop place-items-center rounded-[2rem] bg-white text-8xl shadow-sm ring-2 ring-slate-200" role="img" aria-label="Image à identifier">
            {content.image}
          </div>
        )}
      </div>
      <ChoiceGrid
        choices={content.choices}
        selected={answer?.value ?? null}
        onSelect={(value) => onChange({ value })}
        disabled={disabled}
        renderExtra={(choice) => <SpeakButton text={choice} locale={speechLocale} className="size-10 bg-slate-100 text-base shadow-none hover:bg-slate-200" />}
      />
    </div>
  );
}
