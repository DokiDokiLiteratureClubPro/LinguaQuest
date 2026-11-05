import type { ExerciseDefinition, GradeResult } from "./types";
import { multipleChoice } from "./types/multiple-choice/definition";
import { imageChoice } from "./types/image-choice/definition";
import { trueFalse } from "./types/true-false/definition";
import { fillBlank } from "./types/fill-blank/definition";
import { wordOrder } from "./types/word-order/definition";
import { translate } from "./types/translate/definition";

/** Registre des types d'exercices (côté serveur). */
const definitions = [multipleChoice, imageChoice, trueFalse, fillBlank, wordOrder, translate] as ExerciseDefinition[];

export const exerciseDefinitions: Record<string, ExerciseDefinition> = Object.fromEntries(
  definitions.map((d) => [d.type, d]),
);

export function getDefinition(type: string): ExerciseDefinition {
  const def = exerciseDefinitions[type];
  if (!def) throw new Error(`Type d'exercice inconnu : ${type}`);
  return def;
}

/** Valide le contenu et la solution d'un exercice (utilisé par le seed). */
export function validateExercise(type: string, content: unknown, solution: unknown): void {
  const def = getDefinition(type);
  def.contentSchema.parse(content);
  def.solutionSchema.parse(solution);
}

export function toPublicContent(type: string, content: unknown): unknown {
  const def = getDefinition(type);
  return def.toPublic(def.contentSchema.parse(content));
}

/** Corrige une réponse brute envoyée par le navigateur. Réponse mal formée = fausse. */
export function gradeAnswer(type: string, content: unknown, solution: unknown, rawAnswer: unknown): GradeResult {
  const def = getDefinition(type);
  const c = def.contentSchema.parse(content);
  const s = def.solutionSchema.parse(solution);
  const parsed = def.answerSchema.safeParse(rawAnswer);
  if (!parsed.success) {
    return { correct: false, correctAnswer: def.solutionText(c, s) };
  }
  return def.grade(c, s, parsed.data);
}
