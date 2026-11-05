"use client";

import { ChoiceGrid } from "../../choice-grid";
import { SpeakButton } from "../../speak-button";
import type { ExerciseViewProps } from "../../types";
import type { MultipleChoiceAnswer, MultipleChoiceContent } from "./definition";

export function MultipleChoiceView({ content, answer, onChange, disabled, speechLocale }: ExerciseViewProps<MultipleChoiceContent, MultipleChoiceAnswer>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {content.speak && <SpeakButton text={content.question} locale={speechLocale} />}
        <p className="text-xl font-bold sm:text-2xl">{content.question}</p>
      </div>
      <ChoiceGrid choices={content.choices} selected={answer?.value ?? null} onSelect={(value) => onChange({ value })} disabled={disabled} />
    </div>
  );
}
