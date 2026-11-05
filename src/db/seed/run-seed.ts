import { and, asc, eq, inArray } from "drizzle-orm";
import { achievementDefinitions } from "@/config/achievements";
import { validateExercise } from "@/features/exercises/definitions";
import { achievementConditionSchema } from "@/features/gamification/achievements";
import { achievements, categories, exercises, languages, lessons } from "../schema";
import type { Database } from "../types";
import { seedCategories } from "./categories";
import { seedLanguages } from "./content";

/**
 * Synchronise le contenu (langues, catégories, leçons, exercices, succès) avec la base.
 * Idempotent : peut être relancé après chaque modification du contenu.
 * Les exercices sont mis à jour à leur position, ce qui conserve leurs identifiants.
 */
export async function runSeed(db: Database, log: (m: string) => void = () => {}) {
  // Validation complète AVANT d'écrire quoi que ce soit.
  for (const lang of seedLanguages) {
    for (const lesson of lang.lessons) {
      if (!seedCategories.some((c) => c.slug === lesson.category)) {
        throw new Error(`[${lang.code}/${lesson.slug}] catégorie inconnue : ${lesson.category}`);
      }
      lesson.exercises.forEach((ex, i) => {
        try {
          validateExercise(ex.type, ex.content, ex.solution);
        } catch (e) {
          throw new Error(`[${lang.code}/${lesson.slug}#${i + 1}] exercice invalide : ${(e as Error).message}`);
        }
      });
    }
  }
  for (const a of achievementDefinitions) achievementConditionSchema.parse(a.condition);

  await db.transaction(async (tx) => {
    for (const c of seedCategories) {
      await tx.insert(categories).values(c).onConflictDoUpdate({ target: categories.slug, set: c });
    }
    const cats = await tx.select().from(categories);
    const catId = new Map(cats.map((c) => [c.slug, c.id]));

    for (const lang of seedLanguages) {
      const langRow = {
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        flag: lang.flag,
        speechLocale: lang.speechLocale,
        sortOrder: lang.sortOrder,
      };
      await tx.insert(languages).values(langRow).onConflictDoUpdate({ target: languages.code, set: langRow });

      for (const [i, l] of lang.lessons.entries()) {
        const row = {
          languageCode: lang.code,
          categoryId: catId.get(l.category)!,
          slug: l.slug,
          title: l.title,
          description: l.description,
          icon: l.icon,
          difficulty: l.difficulty ?? 1,
          sortOrder: i + 1,
          isPremium: l.isPremium ?? false,
        };
        const [lessonRow] = await tx
          .insert(lessons)
          .values(row)
          .onConflictDoUpdate({ target: [lessons.languageCode, lessons.slug], set: row })
          .returning({ id: lessons.id });

        const existing = await tx
          .select({ id: exercises.id })
          .from(exercises)
          .where(eq(exercises.lessonId, lessonRow.id))
          .orderBy(asc(exercises.sortOrder), asc(exercises.id));

        for (const [pos, ex] of l.exercises.entries()) {
          const values = {
            lessonId: lessonRow.id,
            type: ex.type,
            content: ex.content,
            solution: ex.solution,
            xpReward: ex.xpReward ?? 10,
            sortOrder: pos + 1,
          };
          if (existing[pos]) await tx.update(exercises).set(values).where(eq(exercises.id, existing[pos].id));
          else await tx.insert(exercises).values(values);
        }
        const extra = existing.slice(l.exercises.length).map((e) => e.id);
        if (extra.length) await tx.delete(exercises).where(and(eq(exercises.lessonId, lessonRow.id), inArray(exercises.id, extra)));
      }
      log(`✓ ${lang.flag} ${lang.name} : ${lang.lessons.length} leçons`);
    }

    for (const [i, a] of achievementDefinitions.entries()) {
      const row = { ...a, sortOrder: i + 1 };
      await tx.insert(achievements).values(row).onConflictDoUpdate({ target: achievements.slug, set: row });
    }
    log(`✓ ${achievementDefinitions.length} succès`);
  });
}
