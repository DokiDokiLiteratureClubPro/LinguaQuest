import { z } from "zod";
import { normalize, shuffle } from "../../normalize";
import type { ExerciseDefinition } from "../../types";

const content = z.object({
  prompt: z.string().min(1),
  question: z.string().min(1),
  /** Texte de la question dans la langue apprise : affiche un bouton d'écoute. */
  speak: z.boolean().optional(),
  choices: z.array(z.string().min(1)).min(2).max(6),
});
const solution = z.object({ answer: z.string().min(1) });
const answer = z.object({ value: z.string().max(200) });

export type MultipleChoiceContent = z.infer<typeof content>;
export type MultipleChoiceAnswer = z.infer<typeof answer>;

export const multipleChoice: ExerciseDefinition<MultipleChoiceContent, z.infer<typeof solution>, MultipleChoiceAnswer> = {
  type: "multiple_choice",
  label: "QCM",
  contentSchema: content,
  solutionSchema: solution,
  answerSchema: answer,
  solutionText: (_c, s) => s.answer,
  grade: (_c, s, a) => ({ correct: normalize(a.value) === normalize(s.answer), correctAnswer: s.answer }),
  toPublic: (c) => ({ ...c, choices: shuffle(c.choices) }),
};
