import { z } from "zod";
import { normalize, shuffle } from "../../normalize";
import type { ExerciseDefinition } from "../../types";

/** Phrase à trous : la phrase contient "___", l'utilisateur choisit le mot manquant. */
const content = z.object({
  prompt: z.string().min(1),
  sentence: z.string().includes("___"),
  translation: z.string().optional(),
  choices: z.array(z.string().min(1)).min(2).max(6),
});
const solution = z.object({ answer: z.string().min(1) });
const answer = z.object({ value: z.string().max(200) });

export type FillBlankContent = z.infer<typeof content>;
export type FillBlankAnswer = z.infer<typeof answer>;

export const fillBlank: ExerciseDefinition<FillBlankContent, z.infer<typeof solution>, FillBlankAnswer> = {
  type: "fill_blank",
  label: "Phrase à trous",
  contentSchema: content,
  solutionSchema: solution,
  answerSchema: answer,
  solutionText: (c, s) => c.sentence.replace("___", s.answer),
  grade: (c, s, a) => ({
    correct: normalize(a.value) === normalize(s.answer),
    correctAnswer: c.sentence.replace("___", s.answer),
  }),
  toPublic: (c) => ({ ...c, choices: shuffle(c.choices) }),
};
