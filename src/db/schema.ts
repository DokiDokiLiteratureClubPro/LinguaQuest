/**
 * Schéma de la base de données (source de vérité).
 * Toute modification ici => `npm run db:generate` pour créer une migration versionnée.
 */
import {
  bigserial,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
};

/* ------------------------------------------------------------------ */
/* Utilisateurs                                                        */
/* ------------------------------------------------------------------ */

/** Profil applicatif. `id` = id de l'utilisateur Supabase Auth (auth.users). */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar").notNull().default("🦊"),
  nativeLanguage: text("native_language").notNull().default("fr"),
  activeLanguage: text("active_language"),
  xpTotal: integer("xp_total").notNull().default(0),
  level: integer("level").notNull().default(1),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  totalAnswers: integer("total_answers").notNull().default(0),
  totalCorrect: integer("total_correct").notNull().default(0),
  bestCombo: integer("best_combo").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  perfectLessons: integer("perfect_lessons").notNull().default(0),
  /** Monétisation future : 'free' | 'premium'. */
  plan: text("plan").notNull().default("free"),
  ...timestamps,
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Contenu pédagogique                                                 */
/* ------------------------------------------------------------------ */

export const languages = pgTable("languages", {
  code: text("code").primaryKey(), // 'en', 'es', ...
  name: text("name").notNull(), // nom en français : "Anglais"
  nativeName: text("native_name").notNull(), // "English"
  flag: text("flag").notNull(),
  speechLocale: text("speech_locale").notNull(), // 'en-GB' pour la synthèse vocale
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    languageCode: text("language_code")
      .notNull()
      .references(() => languages.code, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    icon: text("icon").notNull().default("📘"),
    difficulty: integer("difficulty").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
    /** Monétisation future : leçon réservée au Premium. */
    isPremium: boolean("is_premium").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
  },
  (t) => [unique("lessons_lang_slug_uq").on(t.languageCode, t.slug), index("lessons_lang_idx").on(t.languageCode)],
);

export const exercises = pgTable(
  "exercises",
  {
    id: serial("id").primaryKey(),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    /** Clé du type dans le registre (src/features/exercises/registry.ts). */
    type: text("type").notNull(),
    /** Données affichées à l'utilisateur. */
    content: jsonb("content").notNull(),
    /** Solution : n'est JAMAIS envoyée au navigateur avant la réponse. */
    solution: jsonb("solution").notNull(),
    xpReward: integer("xp_reward").notNull().default(10),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("exercises_lesson_idx").on(t.lessonId)],
);

/* ------------------------------------------------------------------ */
/* Progression                                                         */
/* ------------------------------------------------------------------ */

export const userLanguages = pgTable(
  "user_languages",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    languageCode: text("language_code")
      .notNull()
      .references(() => languages.code, { onDelete: "cascade" }),
    xp: integer("xp").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    lastPracticedAt: timestamp("last_practiced_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.languageCode] })],
);

/** Une tentative de leçon. Toute la logique de score est calculée côté serveur. */
export const lessonSessions = pgTable(
  "lesson_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    answeredCount: integer("answered_count").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    currentCombo: integer("current_combo").notNull().default(0),
    maxCombo: integer("max_combo").notNull().default(0),
    xpAwarded: integer("xp_awarded").notNull().default(0),
  },
  (t) => [index("sessions_user_idx").on(t.userId, t.startedAt)],
);

export const exerciseAttempts = pgTable(
  "exercise_attempts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => lessonSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    answer: jsonb("answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    ...timestamps,
  },
  (t) => [
    // Une seule réponse par exercice et par session : impossible de "re-tenter" pour farmer.
    unique("attempts_session_exercise_uq").on(t.sessionId, t.exerciseId),
    index("attempts_user_idx").on(t.userId, t.createdAt),
  ],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completions: integer("completions").notNull().default(0),
    bestScore: integer("best_score").notNull().default(0), // pourcentage 0-100
    lastCompletedAt: timestamp("last_completed_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

/** Registre de toute l'XP gagnée : l'XP totale est toujours vérifiable. */
export const xpEvents = pgTable(
  "xp_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    source: text("source").notNull(), // 'lesson' | 'achievement'
    ref: text("ref"), // id de session ou slug du succès
    languageCode: text("language_code"),
    ...timestamps,
  },
  (t) => [index("xp_events_user_idx").on(t.userId, t.createdAt)],
);

export const dailyActivity = pgTable(
  "daily_activity",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    xp: integer("xp").notNull().default(0),
    exercises: integer("exercises").notNull().default(0),
    lessons: integer("lessons").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

/* ------------------------------------------------------------------ */
/* Succès                                                              */
/* ------------------------------------------------------------------ */

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  /** Condition de déblocage, ex. {"type":"correct_answers","count":100}. */
  condition: jsonb("condition").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    achievementId: integer("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })],
);

export type Profile = typeof profiles.$inferSelect;
export type Language = typeof languages.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
