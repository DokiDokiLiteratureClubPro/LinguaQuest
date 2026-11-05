/**
 * Petites fonctions pour écrire le contenu pédagogique de façon lisible.
 * Chaque exercice est validé par le schéma de son type au moment du seed.
 */
export type SeedExercise = { type: string; content: unknown; solution: unknown; xpReward?: number };

export type SeedLesson = {
  slug: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  difficulty?: number;
  isPremium?: boolean;
  exercises: SeedExercise[];
};

export type SeedLanguage = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechLocale: string;
  sortOrder: number;
  lessons: SeedLesson[];
};

/** Image (emoji) → mot. */
export const img = (image: string, choices: string[], answer: string): SeedExercise => ({
  type: "image_choice",
  content: { prompt: "Que représente cette image ?", image, choices },
  solution: { answer },
});

/** Couleur → mot. */
export const color = (hex: string, choices: string[], answer: string): SeedExercise => ({
  type: "image_choice",
  content: { prompt: "Quelle est cette couleur ?", color: hex, choices },
  solution: { answer },
});

export const mc = (question: string, choices: string[], answer: string, prompt = "Choisis la bonne réponse"): SeedExercise => ({
  type: "multiple_choice",
  content: { prompt, question, choices },
  solution: { answer },
});

export const tf = (statement: string, answer: boolean, explanation?: string): SeedExercise => ({
  type: "true_false",
  content: { prompt: "Vrai ou faux ?", statement },
  solution: { answer, explanation },
});

export const fb = (sentence: string, choices: string[], answer: string, translation?: string): SeedExercise => ({
  type: "fill_blank",
  content: { prompt: "Complète la phrase", sentence, translation, choices },
  solution: { answer },
});

export const wo = (translation: string, words: string[], answer: string[], alternatives?: string[][]): SeedExercise => ({
  type: "word_order",
  content: { prompt: "Traduis en remettant les mots dans l'ordre", translation, words },
  solution: { answer, alternatives },
});

/** Traduction tapée. `toTarget` : du français vers la langue apprise. */
export const tr = (text: string, toTarget: boolean, accepted: string[]): SeedExercise => ({
  type: "translate",
  content: {
    prompt: toTarget ? "Traduis dans la langue apprise" : "Traduis en français",
    text,
    direction: toTarget ? "to_target" : "to_native",
  },
  solution: { accepted },
  xpReward: 15,
});
