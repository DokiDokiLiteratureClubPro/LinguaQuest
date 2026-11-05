import { z } from "zod";
import type { ExerciseDefinition } from "../../types";

const content = z.object({
  prompt: z.string().min(1),
  /** Affirmation à juger, ex. « "Dog" veut dire "chat" ». */
  statement: z.string().min(1),
});
const solution = z.object({ answer: z.boolean(), explanation: z.string().optional() });
const answer = z.object({ value: z.boolean() });

export type TrueFalseContent = z.infer<typeof content>;
export type TrueFalseAnswer = z.infer<typeof answer>;

export const trueFalse: ExerciseDefinition<TrueFalseContent, z.infer<typeof solution>, TrueFalseAnswer> = {
  type: "true_false",
  label: "Vrai ou faux",
  contentSchema: content,
  solutionSchema: solution,
  answerSchema: answer,
  solutionText: (_c, s) => (s.answer ? "Vrai" : "Faux"),
  grade: (_c, s, a) => ({
    correct: a.value === s.answer,
    correctAnswer: s.answer ? "Vrai" : "Faux",
    note: s.explanation,
  }),
  toPublic: (c) => c,
};
