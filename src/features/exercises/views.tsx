"use client";

import type { ComponentType } from "react";
import type { ExerciseViewProps } from "./types";
import { FillBlankView } from "./types/fill-blank/view";
import { ImageChoiceView } from "./types/image-choice/view";
import { MultipleChoiceView } from "./types/multiple-choice/view";
import { TranslateView } from "./types/translate/view";
import { TrueFalseView } from "./types/true-false/view";
import { WordOrderView } from "./types/word-order/view";

/** Registre des composants d'affichage (côté navigateur). Clé = type d'exercice. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exerciseViews: Record<string, ComponentType<ExerciseViewProps<any, any>>> = {
  multiple_choice: MultipleChoiceView,
  image_choice: ImageChoiceView,
  true_false: TrueFalseView,
  fill_blank: FillBlankView,
  word_order: WordOrderView,
  translate: TranslateView,
};
