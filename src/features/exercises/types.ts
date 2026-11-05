import type { z } from "zod";

export type GradeResult = {
  correct: boolean;
  /** Bonne réponse lisible, affichée après correction. */
  correctAnswer: string;
  /** Remarque éventuelle (ex. "attention aux accents"). */
  note?: string;
};

/**
 * Définition d'un type d'exercice (code côté serveur, sans React).
 * Pour créer un nouveau type : copier un dossier de `types/`, l'adapter,
 * puis l'ajouter dans `definitions.ts` et `views.tsx`.
 */
export interface ExerciseDefinition<C = unknown, S = unknown, A = unknown> {
  type: string;
  label: string;
  contentSchema: z.ZodType<C>;
  solutionSchema: z.ZodType<S>;
  answerSchema: z.ZodType<A>;
  /** Bonne réponse lisible. */
  solutionText(content: C, solution: S): string;
  /** Corrige une réponse. Appelé uniquement côté serveur. */
  grade(content: C, solution: S, answer: A): GradeResult;
  /** Contenu envoyé au navigateur (mélangé, sans indice sur la solution). */
  toPublic(content: C): C;
}

export type PublicExercise = {
  id: number;
  type: string;
  content: unknown;
};

export type ExerciseViewProps<C, A> = {
  content: C;
  answer: A | null;
  onChange: (answer: A | null) => void;
  disabled: boolean;
  /** Locale de synthèse vocale de la langue apprise (ex. "en-GB"). */
  speechLocale: string;
};
