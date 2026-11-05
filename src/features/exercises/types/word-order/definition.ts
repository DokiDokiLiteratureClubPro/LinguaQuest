import { z } from "zod";
import { normalize, shuffle } from "../../normalize";
import type { ExerciseDefinition } from "../../types";

/** Remettre les mots dans l'ordre pour traduire une phrase. */
const content = z.object({
  prompt: z.string().min(1),
  translation: z.string().min(1),
  /** Mots disponibles (y compris éventuels mots pièges). */
  words: z.array(z.string().min(1)).min(2).max(14),
});
const solution = z.object({
  answer: z.array(z.string().min(1)).min(1),
  /** Autres ordres acceptés. */
  alternatives: z.array(z.array(z.string())).optional(),
});
const answer = z.object({ words: z.array(z.string().max(60)).max(20) });

export type WordOrderContent = z.infer<typeof content>;
export type WordOrderAnswer = z.infer<typeof answer>;

const join = (w: string[]) => normalize(w.join(" "));

export const wordOrder: ExerciseDefinition<WordOrderContent, z.infer<typeof solution>, WordOrderAnswer> = {
  type: "word_order",
  label: "Remettre dans l'ordre",
  contentSchema: content,
  solutionSchema: solution,
  answerSchema: answer,
  solutionText: (_c, s) => s.answer.join(" "),
  grade: (_c, s, a) => {
    const accepted = [s.answer, ...(s.alternatives ?? [])].map(join);
    return { correct: accepted.includes(join(a.words)), correctAnswer: s.answer.join(" ") };
  },
  toPublic: (c) => {
    // Mélange jusqu'à obtenir un ordre différent de l'original.
    let words = shuffle(c.words);
    for (let i = 0; i < 5 && words.join(" ") === c.words.join(" "); i++) words = shuffle(c.words);
    return { ...c, words };
  },
};
