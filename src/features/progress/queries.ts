/** Lectures pour l'affichage (tableau de bord, parcours, succès). */
import { and, asc, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import {
  achievements,
  categories,
  dailyActivity,
  languages,
  lessonProgress,
  lessonSessions,
  lessons,
  userAchievements,
  userLanguages,
} from "@/db/schema";
import type { Database } from "@/db/types";
import { conditionProgress } from "@/features/gamification/achievements";
import { todayKey } from "@/features/gamification/streak";
import { getUserStats } from "./service";

export async function getActiveLanguages(db: Database) {
  const rows = await db
    .select({
      code: languages.code,
      name: languages.name,
      nativeName: languages.nativeName,
      flag: languages.flag,
      lessonCount: sql<number>`count(${lessons.id})::int`,
    })
    .from(languages)
    .leftJoin(lessons, and(eq(lessons.languageCode, languages.code), eq(lessons.isPublished, true)))
    .where(eq(languages.isActive, true))
    .groupBy(languages.code)
    .orderBy(asc(languages.sortOrder));
  return rows;
}

export async function getLanguage(db: Database, code: string) {
  const [row] = await db.select().from(languages).where(and(eq(languages.code, code), eq(languages.isActive, true))).limit(1);
  return row ?? null;
}

export type PathLesson = {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  difficulty: number;
  isPremium: boolean;
  completions: number;
  bestScore: number;
};

/** Leçons d'une langue regroupées par catégorie, avec la progression de l'utilisateur. */
export async function getLearningPath(db: Database, userId: string, languageCode: string) {
  const rows = await db
    .select({
      category: categories,
      lesson: lessons,
      completions: sql<number>`coalesce(${lessonProgress.completions}, 0)::int`,
      bestScore: sql<number>`coalesce(${lessonProgress.bestScore}, 0)::int`,
    })
    .from(lessons)
    .innerJoin(categories, eq(categories.id, lessons.categoryId))
    .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
    .where(and(eq(lessons.languageCode, languageCode), eq(lessons.isPublished, true)))
    .orderBy(asc(categories.sortOrder), asc(lessons.sortOrder));

  const groups = new Map<number, { category: (typeof rows)[number]["category"]; lessons: PathLesson[] }>();
  for (const r of rows) {
    const g = groups.get(r.category.id) ?? { category: r.category, lessons: [] };
    g.lessons.push({
      id: r.lesson.id,
      slug: r.lesson.slug,
      title: r.lesson.title,
      description: r.lesson.description,
      icon: r.lesson.icon,
      difficulty: r.lesson.difficulty,
      isPremium: r.lesson.isPremium,
      completions: r.completions,
      bestScore: r.bestScore,
    });
    groups.set(r.category.id, g);
  }
  const list = [...groups.values()];
  const all = list.flatMap((g) => g.lessons);
  const done = all.filter((l) => l.completions > 0).length;
  return { groups: list, total: all.length, done, next: all.find((l) => l.completions === 0) ?? null };
}

export async function getDashboardData(db: Database, userId: string, activeLanguage: string | null) {
  const since = new Date();
  since.setDate(since.getDate() - 6);

  const [myLanguages, recent, week, lastAchievements, achievementCounts, path] = await Promise.all([
    db
      .select({ code: languages.code, name: languages.name, flag: languages.flag, xp: userLanguages.xp, lastPracticedAt: userLanguages.lastPracticedAt })
      .from(userLanguages)
      .innerJoin(languages, eq(languages.code, userLanguages.languageCode))
      .where(eq(userLanguages.userId, userId))
      .orderBy(desc(userLanguages.lastPracticedAt)),
    db
      .select({
        id: lessonSessions.id,
        title: lessons.title,
        icon: lessons.icon,
        slug: lessons.slug,
        languageCode: lessons.languageCode,
        flag: languages.flag,
        correct: lessonSessions.correctCount,
        answered: lessonSessions.answeredCount,
        xp: lessonSessions.xpAwarded,
        completedAt: lessonSessions.completedAt,
      })
      .from(lessonSessions)
      .innerJoin(lessons, eq(lessons.id, lessonSessions.lessonId))
      .innerJoin(languages, eq(languages.code, lessons.languageCode))
      .where(and(eq(lessonSessions.userId, userId), isNotNull(lessonSessions.completedAt)))
      .orderBy(desc(lessonSessions.completedAt))
      .limit(5),
    db
      .select({ day: dailyActivity.day, xp: dailyActivity.xp })
      .from(dailyActivity)
      .where(and(eq(dailyActivity.userId, userId), gte(dailyActivity.day, todayKey(since)))),
    db
      .select({ name: achievements.name, icon: achievements.icon, description: achievements.description, unlockedAt: userAchievements.unlockedAt })
      .from(userAchievements)
      .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt))
      .limit(3),
    db
      .select({
        total: sql<number>`count(*)::int`,
        unlocked: sql<number>`count(${userAchievements.userId})::int`,
      })
      .from(achievements)
      .leftJoin(userAchievements, and(eq(userAchievements.achievementId, achievements.id), eq(userAchievements.userId, userId))),
    activeLanguage ? getLearningPath(db, userId, activeLanguage) : Promise.resolve(null),
  ]);

  // 7 derniers jours, y compris les jours sans activité.
  const byDay = new Map(week.map((w) => [w.day, w.xp]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = todayKey(d);
    return { day: key, xp: byDay.get(key) ?? 0 };
  });

  return { myLanguages, recent, days, lastAchievements, achievementCounts: achievementCounts[0], path };
}

export async function getAchievementsOverview(db: Database, userId: string) {
  const [stats, rows] = await Promise.all([
    getUserStats(db, userId),
    db
      .select({ a: achievements, unlockedAt: userAchievements.unlockedAt })
      .from(achievements)
      .leftJoin(userAchievements, and(eq(userAchievements.achievementId, achievements.id), eq(userAchievements.userId, userId)))
      .orderBy(asc(achievements.sortOrder)),
  ]);
  return rows.map((r) => ({
    slug: r.a.slug,
    name: r.a.name,
    description: r.a.description,
    icon: r.a.icon,
    xpReward: r.a.xpReward,
    unlockedAt: r.unlockedAt,
    progress: conditionProgress(r.a.condition, stats),
  }));
}
