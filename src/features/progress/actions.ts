"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { languages, profiles } from "@/db/schema";
import { requireUserId } from "@/features/auth/session";
import { AppError } from "./errors";
import * as service from "./service";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    unstable_rethrow(e); // laisse passer les redirections (ex. session expirée)
    if (e instanceof AppError) return { ok: false, error: e.message };
    console.error(e);
    return { ok: false, error: "Une erreur est survenue. Réessaie." };
  }
}

const slug = z.string().regex(/^[a-z0-9-]{1,60}$/);
const langCode = z.string().regex(/^[a-z]{2,3}$/);

export async function startLessonAction(languageCode: string, lessonSlug: string) {
  return run(async () => {
    const userId = await requireUserId();
    return service.startLesson(db, userId, langCode.parse(languageCode), slug.parse(lessonSlug));
  });
}

export async function submitAnswerAction(sessionId: string, exerciseId: number, answer: unknown) {
  return run(async () => {
    const userId = await requireUserId();
    const input = z.object({ sessionId: z.string().uuid(), exerciseId: z.number().int().positive() }).parse({ sessionId, exerciseId });
    // Limite la taille de ce qui est stocké.
    if (JSON.stringify(answer ?? null).length > 2000) throw new AppError("Réponse trop longue.");
    return service.submitAnswer(db, userId, input.sessionId, input.exerciseId, answer);
  });
}

export async function completeLessonAction(sessionId: string) {
  return run(async () => {
    const userId = await requireUserId();
    const result = await service.completeLesson(db, userId, z.string().uuid().parse(sessionId));
    revalidatePath("/", "layout");
    return result;
  });
}

export async function setActiveLanguageAction(languageCode: string) {
  return run(async () => {
    const userId = await requireUserId();
    const code = langCode.parse(languageCode);
    const [lang] = await db.select().from(languages).where(eq(languages.code, code)).limit(1);
    if (!lang?.isActive) throw new AppError("Langue indisponible.");
    await db.update(profiles).set({ activeLanguage: code, updatedAt: new Date() }).where(eq(profiles.id, userId));
    revalidatePath("/", "layout");
    return code;
  });
}
