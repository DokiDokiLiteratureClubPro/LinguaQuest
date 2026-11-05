import { z } from "zod";
import { normalize, shuffle } from "../../normalize";
import type { ExerciseDefinition } from "../../types";

/** Une image (emoji) → choisir le mot correspondant dans la langue apprise. */
const content = z
  .object({
  prompt: z.string().min(1),
  image: z.string().min(1).optional(),
  /** Couleur à afficher à la place d'une image (exercices sur les couleurs). */
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  choices: z.array(z.string().min(1)).min(2).max(6),
  })
  .refine((c) => c.image || c.color, "image ou color requis");
const solution = z.object({ answer: z.string().min(1) });
const answer = z.object({ value: z.string().max(200) });

export type ImageChoiceContent = z.infer<typeof content>;
export type ImageChoiceAnswer = z.infer<typeof answer>;

export const imageChoice: ExerciseDefinition<ImageChoiceContent, z.infer<typeof solution>, ImageChoiceAnswer> = {
  type: "image_choice",
  label: "Image et mot",
  contentSchema: content,
  solutionSchema: solution,
  answerSchema: answer,
  solutionText: (_c, s) => s.answer,
  grade: (_c, s, a) => ({ correct: normalize(a.value) === normalize(s.answer), correctAnswer: s.answer }),
  toPublic: (c) => ({ ...c, choices: shuffle(c.choices) }),
};
