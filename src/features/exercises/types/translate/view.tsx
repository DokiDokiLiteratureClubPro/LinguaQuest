"use client";

import { SpeakButton } from "../../speak-button";
import type { ExerciseViewProps } from "../../types";
import type { TranslateAnswer, TranslateContent } from "./definition";

export function TranslateView({ content, answer, onChange, disabled, speechLocale }: ExerciseViewProps<TranslateContent, TranslateAnswer>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-3xl border-2 border-slate-200 bg-white p-5">
        {content.direction === "to_native" && <SpeakButton text={content.text} locale={speechLocale} />}
        <p className="text-xl font-bold sm:text-2xl">{content.text}</p>
      </div>
      <textarea
        value={answer?.text ?? ""}
        onChange={(e) => onChange(e.target.value.trim() ? { text: e.target.value } : null)}
        disabled={disabled}
        maxLength={300}
        rows={3}
        autoFocus
        autoCapitalize="off"
        autoComplete="off"
        spellCheck={false}
        placeholder={content.direction === "to_target" ? "Écris la traduction…" : "Écris en français…"}
        className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-lg outline-none focus:border-brand-400 focus:bg-white"
      />
    </div>
  );
}
