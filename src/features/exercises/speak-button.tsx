"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const noop = () => () => {};

/** Lit un texte à voix haute avec la synthèse vocale du navigateur (gratuite, hors ligne). */
export function SpeakButton({ text, locale, className }: { text: string; locale: string; className?: string }) {
  const supported = useSyncExternalStore(
    noop,
    () => "speechSynthesis" in window,
    () => false,
  );
  if (!supported) return null;

  function speak() {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    u.rate = 0.9;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(locale.slice(0, 2)));
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  }

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`Écouter : ${text}`}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-500 text-xl text-white shadow-[0_3px_0_var(--color-brand-700)] transition-all hover:bg-brand-400 active:translate-y-0.5 active:shadow-none",
        className,
      )}
    >
      🔊
    </button>
  );
}
