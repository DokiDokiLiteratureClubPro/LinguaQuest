/**
 * Logique serveur de la progression : sessions de leçon, correction, XP, niveaux,
 * séries et succès. Toutes les fonctions reçoivent `db` : testables sans Supabase.
 *
 * Règle d'or : le navigateur n'envoie que des réponses brutes. Tout le reste
 * (correction, score, XP) est calculé ici.
 */
import { and, asc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import {
  achievements,
  dailyActivity,
  exerciseAttempts,
  exercises,
  languages,
  lessonProgress,
  lessonSessions,
  lessons,
  profiles,
  userAchievements,
  userLanguages,
  xpEvents,
} from "@/db/schema";
import type { Database } from "@/db/types";
import { gradeAnswer, toPublicContent } from "@/features/exercises/definitions";
import type { GradeResult, PublicExercise } from "@/features/exercises/types";
import { isConditionMet, type UserStats } from "@/features/gamification/achievements";
import { levelFromXp, type LevelInfo } from "@/features/gamification/levels";
import { nextStreak, todayKey } from "@/features/gamification/streak";
import { computeLessonXp, type XpBreakdownItem } from "@/features/gamification/xp";
import { canAccessLesson } from "@/features/monetization/entitlements";
import { AppError } from "./errors";

const SESSIONS_PER_MINUTE = 10;

type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
type Executor = Database | Tx;

/* ------------------------------------------------------------------ */
/* Profil                                                              */
/* ------------------------------------------------------------------ */

function slugifyUsername(raw: string): string {
  const base = raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
  return base.length >= 3 ? base : `user${base}`;
}

/** Crée le profil applicatif au premier passage d'un utilisateur authentifié. */
export async function ensureProfile(
  db: Database,
  user: { id: string; email?: string | null; username?: string | null; displayName?: string | null },
) {
  const existing = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (existing[0]) return existing[0];

  const fallback = user.email?.split("@")[0] ?? "apprenant";
  const base = slugifyUsername(user.username || fallback);
  const displayName = (user.displayName || user.username || fallback).slice(0, 40);

  for (let attempt = 0; attempt < 5; attempt++) {
    const username = attempt === 0 ? base : `${base.slice(0, 16)}${Math.floor(1000 + Math.random() * 9000)}`;
    const inserted = await db
      .insert(profiles)
      .values({ id: user.id, username, displayName })
      .onConflictDoNothing()
      .returning();
    if (inserted[0]) return inserted[0];
    // Conflit : soit le profil a été créé entre-temps, soit le pseudo est pris.
    const again = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (again[0]) return again[0];
  }
  throw new AppError("Impossible de créer le profil.");
}

/* ------------------------------------------------------------------ */
/* Leçons                                                              */
/* ------------------------------------------------------------------ */

export type StartedLesson = {
  sessionId: string;
  lesson: { id: number; title: string; icon: string };
  language: { code: string; name: string; flag: string; speechLocale: string };
  exercises: PublicExercise[];
};

export async function startLesson(db: Database, userId: string, languageCode: string, lessonSlug: string): Promise<StartedLesson> {
  const [row] = await db
    .select({ lesson: lessons, language: languages })
    .from(lessons)
    .innerJoin(languages, eq(languages.code, lessons.languageCode))
    .where(and(eq(lessons.languageCode, languageCode), eq(lessons.slug, lessonSlug), eq(lessons.isPublished, true)))
    .limit(1);
  if (!row || !row.language.isActive) throw new AppError("Leçon introuvable.");

  const [profile] = await db.select({ plan: profiles.plan }).from(profiles).where(eq(profiles.id, userId)).limit(1);
  if (!profile) throw new AppError("Profil introuvable.");
  if (!canAccessLesson(profile.plan, row.lesson)) throw new AppError("Cette leçon est réservée au Premium.");

  const list = await db
    .select({ id: exercises.id, type: exercises.type, content: exercises.content })
    .from(exercises)
    .where(eq(exercises.lessonId, row.lesson.id))
    .orderBy(asc(exercises.sortOrder), asc(exercises.id));
  if (list.length === 0) throw new AppError("Cette leçon ne contient pas encore d'exercices.");

  // Anti-abus : nombre de leçons démarrées par minute limité.
  const [{ recent }] = await db
    .select({ recent: sql<number>`count(*)::int` })
    .from(lessonSessions)
    .where(and(eq(lessonSessions.userId, userId), gt(lessonSessions.startedAt, sql`now() - interval '1 minute'`)));
  if (recent >= SESSIONS_PER_MINUTE) throw new AppError("Doucement ! Attends quelques secondes avant de relancer une leçon.");

  // Ménage : les leçons abandonnées depuis plus d'un jour ne servent plus (gain de place en base).
  await db
    .delete(lessonSessions)
    .where(and(eq(lessonSessions.userId, userId), isNull(lessonSessions.completedAt), lt(lessonSessions.startedAt, sql`now() - interval '1 day'`)));

  const [session] = await db.insert(lessonSessions).values({ userId, lessonId: row.lesson.id }).returning({ id: lessonSessions.id });

  await db.update(profiles).set({ activeLanguage: languageCode, updatedAt: new Date() }).where(eq(profiles.id, userId));

  return {
    sessionId: session.id,
    lesson: { id: row.lesson.id, title: row.lesson.title, icon: row.lesson.icon },
    language: { code: row.language.code, name: row.language.name, flag: row.language.flag, speechLocale: row.language.speechLocale },
    exercises: list.map((e) => ({ id: e.id, type: e.type, content: toPublicContent(e.type, e.content) })),
  };
}

export type AnswerResult = GradeResult & { combo: number };

export async function submitAnswer(
  db: Database,
  userId: string,
  sessionId: string,
  exerciseId: number,
  rawAnswer: unknown,
): Promise<AnswerResult> {
  return db.transaction(async (tx) => {
    const [session] = await tx
      .select()
      .from(lessonSessions)
      .where(and(eq(lessonSessions.id, sessionId), eq(lessonSessions.userId, userId)))
      .for("update")
      .limit(1);
    if (!session) throw new AppError("Session introuvable.");
    if (session.completedAt) throw new AppError("Cette leçon est déjà terminée.");

    const [exercise] = await tx
      .select()
      .from(exercises)
      .where(and(eq(exercises.id, exerciseId), eq(exercises.lessonId, session.lessonId)))
      .limit(1);
    if (!exercise) throw new AppError("Exercice introuvable.");

    const result = gradeAnswer(exercise.type, exercise.content, exercise.solution, rawAnswer);

    const inserted = await tx
      .insert(exerciseAttempts)
      .values({ sessionId, userId, exerciseId, answer: (rawAnswer ?? null) as object, isCorrect: result.correct })
      .onConflictDoNothing()
      .returning({ id: exerciseAttempts.id });
    if (!inserted[0]) throw new AppError("Tu as déjà répondu à cet exercice.");

    const combo = result.correct ? session.currentCombo + 1 : 0;
    const maxCombo = Math.max(session.maxCombo, combo);
    await tx
      .update(lessonSessions)
      .set({
        answeredCount: session.answeredCount + 1,
        correctCount: session.correctCount + (result.correct ? 1 : 0),
        currentCombo: combo,
        maxCombo,
      })
      .where(eq(lessonSessions.id, sessionId));

    await tx
      .update(profiles)
      .set({
        totalAnswers: sql`${profiles.totalAnswers} + 1`,
        totalCorrect: sql`${profiles.totalCorrect} + ${result.correct ? 1 : 0}`,
        bestCombo: sql`GREATEST(${profiles.bestCombo}, ${maxCombo})`,
      })
      .where(eq(profiles.id, userId));

    return { ...result, combo };
  });
}

export type UnlockedAchievement = { slug: string; name: string; icon: string; xpReward: number };

export type LessonResult = {
  score: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  perfect: boolean;
  xpGained: number;
  breakdown: XpBreakdownItem[];
  levelBefore: number;
  level: LevelInfo;
  xpTotal: number;
  streak: number;
  achievements: UnlockedAchievement[];
};

export async function completeLesson(db: Database, userId: string, sessionId: string, now: Date = new Date()): Promise<LessonResult> {
  return db.transaction(async (tx) => {
    const [session] = await tx
      .select({ s: lessonSessions, languageCode: lessons.languageCode })
      .from(lessonSessions)
      .innerJoin(lessons, eq(lessons.id, lessonSessions.lessonId))
      .where(and(eq(lessonSessions.id, sessionId), eq(lessonSessions.userId, userId)))
      .for("update", { of: lessonSessions })
      .limit(1);
    if (!session) throw new AppError("Session introuvable.");
    if (session.s.completedAt) throw new AppError("Cette leçon est déjà terminée.");
    const s = session.s;

    const [{ total }] = await tx
      .select({ total: sql<number>`count(*)::int` })
      .from(exercises)
      .where(eq(exercises.lessonId, s.lessonId));
    if (s.answeredCount < total) throw new AppError("Tous les exercices n'ont pas été faits.");

    const [{ correctXp }] = await tx
      .select({ correctXp: sql<number>`coalesce(sum(${exercises.xpReward}), 0)::int` })
      .from(exerciseAttempts)
      .innerJoin(exercises, eq(exercises.id, exerciseAttempts.exerciseId))
      .where(and(eq(exerciseAttempts.sessionId, sessionId), eq(exerciseAttempts.isCorrect, true)));

    const [profile] = await tx.select().from(profiles).where(eq(profiles.id, userId)).for("update").limit(1);
    if (!profile) throw new AppError("Profil introuvable.");

    const today = todayKey(now);
    const [activity] = await tx
      .select()
      .from(dailyActivity)
      .where(and(eq(dailyActivity.userId, userId), eq(dailyActivity.day, today)))
      .limit(1);
    const [progress] = await tx
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, s.lessonId)))
      .limit(1);

    const streakAfter = nextStreak(profile.lastActiveDate, profile.currentStreak, today);
    const xp = computeLessonXp({
      correctXp,
      correctCount: s.correctCount,
      totalCount: total,
      maxCombo: s.maxCombo,
      completionsBefore: progress?.completions ?? 0,
      streakAfter,
      firstLessonToday: !activity || activity.lessons === 0,
      xpEarnedToday: activity?.xp ?? 0,
    });

    const closed = await tx
      .update(lessonSessions)
      .set({ completedAt: now, xpAwarded: xp.total })
      .where(and(eq(lessonSessions.id, sessionId), isNull(lessonSessions.completedAt)))
      .returning({ id: lessonSessions.id });
    if (!closed[0]) throw new AppError("Cette leçon est déjà terminée.");

    if (xp.total > 0) {
      await tx.insert(xpEvents).values({ userId, amount: xp.total, source: "lesson", ref: sessionId, languageCode: session.languageCode });
    }

    await tx
      .insert(lessonProgress)
      .values({
        userId,
        lessonId: s.lessonId,
        completions: xp.passed ? 1 : 0,
        bestScore: xp.score,
        lastCompletedAt: now,
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          completions: sql`${lessonProgress.completions} + ${xp.passed ? 1 : 0}`,
          bestScore: sql`GREATEST(${lessonProgress.bestScore}, ${xp.score})`,
          lastCompletedAt: now,
        },
      });

    await tx
      .insert(dailyActivity)
      .values({ userId, day: today, xp: xp.total, exercises: total, lessons: 1 })
      .onConflictDoUpdate({
        target: [dailyActivity.userId, dailyActivity.day],
        set: {
          xp: sql`${dailyActivity.xp} + ${xp.total}`,
          exercises: sql`${dailyActivity.exercises} + ${total}`,
          lessons: sql`${dailyActivity.lessons} + 1`,
        },
      });

    await tx
      .insert(userLanguages)
      .values({ userId, languageCode: session.languageCode, xp: xp.total, lastPracticedAt: now })
      .onConflictDoUpdate({
        target: [userLanguages.userId, userLanguages.languageCode],
        set: { xp: sql`${userLanguages.xp} + ${xp.total}`, lastPracticedAt: now },
      });

    let xpTotal = profile.xpTotal + xp.total;
    const updated = {
      xpTotal,
      level: levelFromXp(xpTotal).level,
      currentStreak: streakAfter,
      longestStreak: Math.max(profile.longestStreak, streakAfter),
      lastActiveDate: today,
      lessonsCompleted: profile.lessonsCompleted + (xp.passed ? 1 : 0),
      perfectLessons: profile.perfectLessons + (xp.perfect ? 1 : 0),
      updatedAt: now,
    };
    await tx.update(profiles).set(updated).where(eq(profiles.id, userId));

    const unlocked = await checkAchievements(tx, userId);
    xpTotal += unlocked.reduce((sum, a) => sum + a.xpReward, 0);

    return {
      score: xp.score,
      correctCount: s.correctCount,
      totalCount: total,
      passed: xp.passed,
      perfect: xp.perfect,
      xpGained: xp.total,
      breakdown: xp.breakdown,
      levelBefore: profile.level,
      level: levelFromXp(xpTotal),
      xpTotal,
      streak: streakAfter,
      achievements: unlocked,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Succès                                                              */
/* ------------------------------------------------------------------ */

export async function getUserStats(db: Executor, userId: string): Promise<UserStats> {
  const [p] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  if (!p) throw new AppError("Profil introuvable.");
  const [langs] = await db
    .select({ started: sql<number>`count(*) filter (where ${userLanguages.xp} > 0)::int`, maxXp: sql<number>`coalesce(max(${userLanguages.xp}), 0)::int` })
    .from(userLanguages)
    .where(eq(userLanguages.userId, userId));
  return {
    lessonsCompleted: p.lessonsCompleted,
    totalCorrect: p.totalCorrect,
    bestCombo: p.bestCombo,
    perfectLessons: p.perfectLessons,
    longestStreak: p.longestStreak,
    level: p.level,
    xpTotal: p.xpTotal,
    languagesStarted: langs?.started ?? 0,
    maxLanguageXp: langs?.maxXp ?? 0,
  };
}

/**
 * Débloque les succès dont la condition est remplie et attribue leur XP.
 * Boucle car l'XP d'un succès peut en débloquer un autre (ex. "1 000 XP").
 */
export async function checkAchievements(tx: Executor, userId: string): Promise<UnlockedAchievement[]> {
  const unlocked: UnlockedAchievement[] = [];
  for (let round = 0; round < 5; round++) {
    const stats = await getUserStats(tx, userId);
    const candidates = await tx
      .select({ a: achievements })
      .from(achievements)
      .leftJoin(userAchievements, and(eq(userAchievements.achievementId, achievements.id), eq(userAchievements.userId, userId)))
      .where(isNull(userAchievements.userId));

    const newly = candidates.map((c) => c.a).filter((a) => isConditionMet(a.condition, stats));
    if (newly.length === 0) break;

    let bonus = 0;
    for (const a of newly) {
      const ins = await tx
        .insert(userAchievements)
        .values({ userId, achievementId: a.id })
        .onConflictDoNothing()
        .returning({ id: userAchievements.achievementId });
      if (!ins[0]) continue;
      unlocked.push({ slug: a.slug, name: a.name, icon: a.icon, xpReward: a.xpReward });
      if (a.xpReward > 0) {
        bonus += a.xpReward;
        await tx.insert(xpEvents).values({ userId, amount: a.xpReward, source: "achievement", ref: a.slug });
      }
    }
    if (bonus === 0) break;
    const newTotal = stats.xpTotal + bonus;
    await tx.update(profiles).set({ xpTotal: newTotal, level: levelFromXp(newTotal).level }).where(eq(profiles.id, userId));
  }
  return unlocked;
}
