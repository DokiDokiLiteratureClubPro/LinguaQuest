import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { exercises, lessons, profiles, userAchievements, xpEvents } from "@/db/schema";
import type { Database } from "@/db/types";
import { completeLesson, ensureProfile, startLesson, submitAnswer } from "@/features/progress/service";
import { runSeed } from "@/db/seed/run-seed";
import { createTestDb, createUser } from "./helpers/test-db";
import type { PGlite } from "@electric-sql/pglite";

const USER = "11111111-1111-1111-1111-111111111111";
const OTHER = "22222222-2222-2222-2222-222222222222";

let db: Database;
let client: PGlite;

/** Récupère les solutions directement en base (comme le ferait le serveur). */
async function solutionsFor(lessonId: number) {
  const rows = await db.select().from(exercises).where(eq(exercises.lessonId, lessonId));
  return new Map(rows.map((r) => [r.id, r]));
}

function correctAnswerFor(type: string, solution: Record<string, unknown>): unknown {
  switch (type) {
    case "true_false":
      return { value: solution.answer };
    case "word_order":
      return { words: solution.answer };
    case "translate":
      return { text: (solution.accepted as string[])[0] };
    default:
      return { value: solution.answer };
  }
}

async function playLesson(userId: string, slug: string, opts: { wrong?: number } = {}, now?: Date) {
  const started = await startLesson(db, userId, "en", slug);
  const sol = await solutionsFor(started.lesson.id);
  for (const [i, ex] of started.exercises.entries()) {
    const row = sol.get(ex.id)!;
    const answer = i < (opts.wrong ?? 0) ? { value: "__faux__", words: [], text: "__faux__" } : correctAnswerFor(row.type, row.solution as Record<string, unknown>);
    await submitAnswer(db, userId, started.sessionId, ex.id, answer);
  }
  return { started, result: await completeLesson(db, userId, started.sessionId, now) };
}

beforeAll(async () => {
  ({ db, client } = await createTestDb());
  await createUser(client, USER);
  await createUser(client, OTHER);
  await ensureProfile(db, { id: USER, email: "riyane@example.com", username: "Riyane" });
  await ensureProfile(db, { id: OTHER, email: "autre@example.com", username: "Riyane" }); // pseudo déjà pris
});

describe("profils", () => {
  it("crée un profil unique, même si le pseudo est déjà pris", async () => {
    const [a] = await db.select().from(profiles).where(eq(profiles.id, USER));
    const [b] = await db.select().from(profiles).where(eq(profiles.id, OTHER));
    expect(a.username).toBe("riyane");
    expect(b.username).not.toBe("riyane");
    expect(a.level).toBe(1);
    // idempotent
    const again = await ensureProfile(db, { id: USER, email: "riyane@example.com" });
    expect(again.username).toBe("riyane");
  });
});

describe("parcours d'une leçon", () => {
  it("n'envoie jamais la solution au navigateur", async () => {
    const started = await startLesson(db, USER, "en", "animals-1");
    const json = JSON.stringify(started);
    expect(json).not.toContain("solution");
    expect(json).not.toContain("accepted");
    expect(started.exercises.length).toBeGreaterThan(0);
  });

  it("leçon parfaite : XP, niveau, série, succès et registre cohérents", async () => {
    const day1 = new Date("2026-11-05T10:00:00Z");
    const { result } = await playLesson(USER, "animals-1", {}, day1);
    expect(result.perfect).toBe(true);
    expect(result.xpGained).toBeGreaterThan(100);
    expect(result.streak).toBe(1);
    const slugs = result.achievements.map((a) => a.slug);
    expect(slugs).toContain("first-lesson");
    expect(slugs).toContain("perfect-lesson");

    const [p] = await db.select().from(profiles).where(eq(profiles.id, USER));
    const events = await db.select().from(xpEvents).where(eq(xpEvents.userId, USER));
    // L'XP du profil = somme exacte du registre.
    expect(p.xpTotal).toBe(events.reduce((s, e) => s + e.amount, 0));
    expect(p.xpTotal).toBe(result.xpTotal);
    expect(p.level).toBe(result.level.level);
    expect(p.lessonsCompleted).toBe(1);
    expect(p.activeLanguage).toBe("en");
  });

  it("refuse de terminer deux fois la même session et de répondre deux fois", async () => {
    const started = await startLesson(db, USER, "en", "food-1");
    const first = started.exercises[0];
    await submitAnswer(db, USER, started.sessionId, first.id, { value: "x" });
    await expect(submitAnswer(db, USER, started.sessionId, first.id, { value: "x" })).rejects.toThrow(/déjà répondu/);
    await expect(completeLesson(db, USER, started.sessionId)).rejects.toThrow(/Tous les exercices/);
  });

  it("refuse l'accès à la session d'un autre utilisateur", async () => {
    const started = await startLesson(db, USER, "en", "colors-1");
    await expect(submitAnswer(db, OTHER, started.sessionId, started.exercises[0].id, { value: "red" })).rejects.toThrow(/introuvable/);
  });

  it("refuse un exercice qui n'appartient pas à la leçon", async () => {
    const started = await startLesson(db, USER, "en", "colors-1");
    const [other] = await db.select().from(lessons).where(eq(lessons.slug, "food-1"));
    const [foreign] = await db.select().from(exercises).where(eq(exercises.lessonId, other.id));
    await expect(submitAnswer(db, USER, started.sessionId, foreign.id, { value: "x" })).rejects.toThrow(/introuvable/);
  });

  it("rejouer une leçon rapporte moins d'XP, et la série monte le lendemain", async () => {
    const day2 = new Date("2026-11-06T10:00:00Z");
    const { result } = await playLesson(USER, "animals-1", {}, day2);
    expect(result.streak).toBe(2);
    expect(result.breakdown.some((b) => b.label === "Leçon déjà terminée")).toBe(true);
  });

  it("une leçon ratée ne compte pas comme terminée", async () => {
    const [before] = await db.select().from(profiles).where(eq(profiles.id, OTHER));
    const { result } = await playLesson(OTHER, "to-be", { wrong: 6 });
    expect(result.passed).toBe(false);
    const [after] = await db.select().from(profiles).where(eq(profiles.id, OTHER));
    expect(after.lessonsCompleted).toBe(before.lessonsCompleted);
    const unlocked = await db.select().from(userAchievements).where(eq(userAchievements.userId, OTHER));
    expect(unlocked.length).toBe(0);
  });

  it("relancer le seed conserve les identifiants des exercices", async () => {
    const before = await db.select({ id: exercises.id }).from(exercises);
    await runSeed(db);
    const after = await db.select({ id: exercises.id }).from(exercises);
    expect(after.map((e) => e.id).sort()).toEqual(before.map((e) => e.id).sort());
  });

  it("limite le nombre de leçons démarrées par minute", async () => {
    await expect(
      (async () => {
        for (let i = 0; i < 12; i++) await startLesson(db, OTHER, "en", "animals-1");
      })(),
    ).rejects.toThrow(/Doucement/);
  });
});
