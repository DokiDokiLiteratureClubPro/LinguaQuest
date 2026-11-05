import type { Metadata } from "next";
import { LessonPlayer } from "@/features/lesson/lesson-player";

export const metadata: Metadata = { title: "Leçon" };

export default async function LessonPage({ params }: PageProps<"/learn/[lang]/[lesson]">) {
  const { lang, lesson } = await params;
  // `key` : repart de zéro si on change de leçon sans recharger la page.
  return <LessonPlayer key={`${lang}/${lesson}`} languageCode={lang} lessonSlug={lesson} />;
}
