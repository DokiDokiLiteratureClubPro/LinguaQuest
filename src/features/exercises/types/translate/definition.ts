import { z } from "zod";
import { normalize, stripAccents } from "../../normalize";
import type { ExerciseDefinition } from "../../types";

/** Traduction tapée au clavier, dans un sens ou dans l'autre. */
const content = z.object({
  prompt: z.string().min(1),
  text: z.string().min(1),
  /** "to_target" : du français vers la langue apprise ; "to_native" : l'inverse. */
  direction: z.enum(["to_target", "to_native"]),
});
const solution = z.object({ accepted: z.array(z.string().min(1)).min(1) });
const answer = z.object({ text: z.string().max(300) });

export type TranslateContent = z.infer<typeof content>;
export type TranslateAnswer = z.infer<typeof answer>;

export const translate: ExerciseDefinition<TranslateContent, z.infer<typeof solution>, TranslateAnswer> = {
  type: "translate",
  label: "Traduction",
  contentSchema: content,
  solutionSchema: solution,
  answerSchema: answer,
  solutionText: (_c, s) => s.accepted[0],
  grade: (_c, s, a) => {
    const given = normalize(a.text);
    const correctAnswer = s.accepted[0];
    if (!given) return { correct: false, correctAnswer };
    if (s.accepted.some((x) => normalize(x) === given)) return { correct: true, correctAnswer };
    const givenNoAccent = stripAccents(given);
    if (s.accepted.some((x) => stripAccents(normalize(x)) === givenNoAccent)) {
      return { correct: true, correctAnswer, note: "Correct, mais attention aux accents !" };
    }
    return { correct: false, correctAnswer };
  },
  toPublic: (c) => c,
};
