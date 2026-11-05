import { requireProfile } from "@/features/auth/session";

/** Mise en page "concentration" : pas de navigation pendant une leçon. */
export default async function LessonLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();
  return <div className="flex min-h-screen flex-col bg-slate-50">{children}</div>;
}
