import { describe, expect, it } from "vitest";
import { levelFromXp, totalXpForLevel, xpToNextLevel } from "@/features/gamification/levels";
import { displayedStreak, nextStreak, todayKey } from "@/features/gamification/streak";
import { computeLessonXp } from "@/features/gamification/xp";

const base = {
  correctXp: 80,
  correctCount: 8,
  totalCount: 8,
  maxCombo: 8,
  completionsBefore: 0,
  streakAfter: 1,
  firstLessonToday: true,
  xpEarnedToday: 0,
};

describe("niveaux", () => {
  it("niveau 1 au départ, chaque niveau demande plus d'XP", () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(xpToNextLevel(2)).toBeGreaterThan(xpToNextLevel(1));
    expect(levelFromXp(totalXpForLevel(5)).level).toBe(5);
    expect(levelFromXp(totalXpForLevel(5) - 1).level).toBe(4);
    const info = levelFromXp(150);
    expect(info.progress).toBeGreaterThan(0);
    expect(info.progress).toBeLessThan(1);
  });
});

describe("XP d'une leçon", () => {
  it("leçon parfaite : réponses + fin + sans faute + combo", () => {
    const r = computeLessonXp(base);
    expect(r.perfect).toBe(true);
    expect(r.total).toBe(80 + 20 + 15 + 5);
  });

  it("échec (< 50 %) : pas de bonus de fin", () => {
    const r = computeLessonXp({ ...base, correctXp: 30, correctCount: 3, maxCombo: 2 });
    expect(r.passed).toBe(false);
    expect(r.total).toBe(30);
  });

  it("rejouer une leçon rapporte moins", () => {
    expect(computeLessonXp({ ...base, completionsBefore: 1 }).total).toBe(60);
    expect(computeLessonXp({ ...base, completionsBefore: 9 }).total).toBe(30);
  });

  it("bonus de série et plafond quotidien", () => {
    expect(computeLessonXp({ ...base, streakAfter: 5 }).total).toBe(120 + 10);
    expect(computeLessonXp({ ...base, streakAfter: 5, firstLessonToday: false }).total).toBe(120);
    expect(computeLessonXp({ ...base, xpEarnedToday: 1950 }).total).toBe(50);
    expect(computeLessonXp({ ...base, xpEarnedToday: 5000 }).total).toBe(0);
  });
});

describe("séries", () => {
  it("jour suivant +1, jour manqué = reset, même jour inchangé", () => {
    expect(nextStreak(null, 0, "2026-11-05")).toBe(1);
    expect(nextStreak("2026-11-04", 3, "2026-11-05")).toBe(4);
    expect(nextStreak("2026-11-05", 3, "2026-11-05")).toBe(3);
    expect(nextStreak("2026-11-02", 3, "2026-11-05")).toBe(1);
    expect(nextStreak("2026-12-31", 9, "2027-01-01")).toBe(10);
  });
  it("affichage : retombe à 0 après un jour manqué", () => {
    expect(displayedStreak("2026-11-04", 4, "2026-11-05")).toBe(4);
    expect(displayedStreak("2026-11-03", 4, "2026-11-05")).toBe(0);
  });
  it("jour calculé dans le fuseau configuré", () => {
    // 23h30 UTC le 4 = 00h30 le 5 à Paris
    expect(todayKey(new Date("2026-11-04T23:30:00Z"), "Europe/Paris")).toBe("2026-11-05");
  });
});
