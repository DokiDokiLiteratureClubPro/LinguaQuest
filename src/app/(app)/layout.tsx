import Link from "next/link";
import { LanguageChip, LevelChip, StreakChip } from "@/components/app-shell/stat-chips";
import { DesktopNav, MobileNav } from "@/components/app-shell/nav-links";
import { Logo } from "@/components/logo";
import { db } from "@/db";
import { requireProfile } from "@/features/auth/session";
import { displayedStreak } from "@/features/gamification/streak";
import { getLanguage } from "@/features/progress/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const language = profile.activeLanguage ? await getLanguage(db, profile.activeLanguage) : null;
  const streak = displayedStreak(profile.lastActiveDate, profile.currentStreak);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b-2 border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Logo href="/dashboard" />
            <DesktopNav />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {language && <LanguageChip flag={language.flag} code={language.code} />}
            <StreakChip streak={streak} />
            <LevelChip level={profile.level} xp={profile.xpTotal} />
            <Link href="/profile" className="ml-1 hidden size-10 place-items-center rounded-full bg-brand-50 text-xl sm:grid" title={profile.displayName}>
              {profile.avatar}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 md:pb-12">{children}</main>
      <MobileNav />
    </div>
  );
}
