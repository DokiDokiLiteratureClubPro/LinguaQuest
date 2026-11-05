"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div className="space-y-4">
        <div className="text-7xl">😵</div>
        <h1 className="text-2xl font-extrabold">Oups, quelque chose s&apos;est mal passé</h1>
        <p className="text-slate-500">Réessaie dans un instant.</p>
        <Button onClick={reset}>Réessayer</Button>
      </div>
    </div>
  );
}
