import { describe, expect, it } from "vitest";
import { gradeAnswer, toPublicContent, validateExercise } from "@/features/exercises/definitions";
import { seedLanguages } from "@/db/seed/content";

describe("correction des exercices", () => {
  it("QCM : insensible à la casse, faux si réponse malformée", () => {
    const c = { prompt: "p", question: "q", choices: ["horse", "house"] };
    const s = { answer: "horse" };
    expect(gradeAnswer("multiple_choice", c, s, { value: "Horse" }).correct).toBe(true);
    expect(gradeAnswer("multiple_choice", c, s, { value: "house" }).correct).toBe(false);
    expect(gradeAnswer("multiple_choice", c, s, { hack: true })).toEqual({ correct: false, correctAnswer: "horse" });
    expect(gradeAnswer("multiple_choice", c, s, null).correct).toBe(false);
  });

  it("traduction : tolère ponctuation, majuscules et accents (avec remarque)", () => {
    const c = { prompt: "p", text: "Je suis français.", direction: "to_target" };
    const s = { accepted: ["Soy francés", "Yo soy francés"] };
    expect(gradeAnswer("translate", c, s, { text: "  soy  FRANCÉS ! " }).correct).toBe(true);
    const noAccent = gradeAnswer("translate", c, s, { text: "yo soy frances" });
    expect(noAccent.correct).toBe(true);
    expect(noAccent.note).toMatch(/accents/);
    expect(gradeAnswer("translate", c, s, { text: "soy inglés" }).correct).toBe(false);
    expect(gradeAnswer("translate", c, s, { text: "" }).correct).toBe(false);
  });

  it("traduction : apostrophes typographiques acceptées", () => {
    const c = { prompt: "p", text: "I have a cat.", direction: "to_native" };
    const s = { accepted: ["J'ai un chat"] };
    expect(gradeAnswer("translate", c, s, { text: "J’ai un chat." }).correct).toBe(true);
  });

  it("ordre des mots : réponse et alternatives", () => {
    const c = { prompt: "p", translation: "t", words: ["Yo", "como", "una", "manzana", "un"] };
    const s = { answer: ["Yo", "como", "una", "manzana"], alternatives: [["como", "una", "manzana"]] };
    expect(gradeAnswer("word_order", c, s, { words: ["Yo", "como", "una", "manzana"] }).correct).toBe(true);
    expect(gradeAnswer("word_order", c, s, { words: ["como", "una", "manzana"] }).correct).toBe(true);
    expect(gradeAnswer("word_order", c, s, { words: ["una", "Yo", "como", "manzana"] }).correct).toBe(false);
  });

  it("vrai/faux et phrase à trous", () => {
    expect(gradeAnswer("true_false", { prompt: "p", statement: "s" }, { answer: false }, { value: false }).correct).toBe(true);
    const fb = gradeAnswer("fill_blank", { prompt: "p", sentence: "I ___ happy.", choices: ["am", "is"] }, { answer: "am" }, { value: "is" });
    expect(fb).toEqual({ correct: false, correctAnswer: "I am happy." });
  });

  it("le contenu public ne change que l'ordre des choix", () => {
    const c = { prompt: "p", question: "q", choices: ["a", "b", "c", "d"] };
    const pub = toPublicContent("multiple_choice", c) as typeof c;
    expect([...pub.choices].sort()).toEqual(["a", "b", "c", "d"]);
    expect(pub).not.toHaveProperty("answer");
  });

  it("tout le contenu du seed est valide et chaque bonne réponse fait partie des choix", () => {
    for (const lang of seedLanguages) {
      for (const lesson of lang.lessons) {
        expect(lesson.exercises.length).toBeGreaterThanOrEqual(5);
        for (const ex of lesson.exercises) {
          expect(() => validateExercise(ex.type, ex.content, ex.solution)).not.toThrow();
          const content = ex.content as { choices?: string[]; words?: string[] };
          const solution = ex.solution as { answer?: unknown };
          if (content.choices) expect(content.choices).toContain(solution.answer);
          if (content.words && Array.isArray(solution.answer)) {
            for (const w of solution.answer as string[]) expect(content.words).toContain(w);
          }
        }
      }
    }
  });
});
