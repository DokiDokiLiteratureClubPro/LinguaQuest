"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/cn";
import { setActiveLanguageAction } from "./actions";

type Lang = { code: string; name: string; nativeName: string; flag: string; lessonCount: number };

export function LanguagePicker({ languages, active }: { languages: Lang[]; active: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function choose(code: string) {
    setSelected(code);
    setError(null);
    startTransition(async () => {
      const res = await setActiveLanguageAction(code);
      if (res.ok) router.push(`/learn/${code}`);
      else setError(res.error);
    });
  }

  return (
    <div className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => choose(l.code)}
            disabled={pending}
            className={cn(
              "group flex items-center gap-4 rounded-3xl border-2 bg-white p-5 text-left transition-all",
              "shadow-[0_4px_0_var(--color-slate-200)] hover:-translate-y-0.5 hover:border-brand-300 active:translate-y-1 active:shadow-none",
              active === l.code ? "border-brand-400 ring-4 ring-brand-100" : "border-slate-200",
              pending && selected === l.code && "opacity-70",
            )}
          >
            <span className="text-5xl transition-transform group-hover:scale-110">{l.flag}</span>
            <span className="flex-1">
              <span className="block text-lg font-extrabold">{l.name}</span>
              <span className="block text-sm text-slate-500">
                {l.nativeName} · {l.lessonCount} leçons
              </span>
            </span>
            {active === l.code && <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-bold text-brand-700">En cours</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
