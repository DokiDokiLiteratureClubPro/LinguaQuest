import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "LinguaQuest — Apprends une langue en jouant", template: "%s · LinguaQuest" },
  description:
    "Apprends l'anglais, l'espagnol et d'autres langues avec des exercices courts et ludiques. Gagne de l'XP, monte de niveau et débloque des succès.",
  openGraph: { type: "website", locale: "fr_FR", siteName: "LinguaQuest" },
};

export const viewport: Viewport = { themeColor: "#4f46e5" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
