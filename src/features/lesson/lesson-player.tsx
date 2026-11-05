"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, LinkButton } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { exerciseViews } from "@/features/exercises/views";
import { completeLessonAction, startLessonAction, submitAnswerAction } from "@/features/progress/actions";
import type { AnswerResult, LessonResult, StartedLesson } from "@/features/progress/service";
import { cn } from "@/lib/cn";
import { LessonResults } from "./lesson-results";

type Phase =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "playing" }
  | { kind: "finishing" }
  | { kind: "done"; result: LessonResult };

const PRAISE = ["Bravo !", "Excellent !", "Parfait !", "Bien joué !", "Super !"];

export function LessonPlayer({ languageCode, lessonSlug }: { languageCode: string; lessonSlug: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [lesson, setLesson] = useState<StartedLesson | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<unknown>(null);
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [pending, startTransition] = useTransition();
  const started = useRef(false);

  const begin = useCallback(() => {
    setPhase({ kind: "loading" });
    setIndex(0);
    setAnswer(null);
    setFeedback(null);
    setCorrectCount(0);
    startLessonAction(languageCode, lessonSlug).then((res) => {
      if (!res.ok) return setPhase({ kind: "error", message: res.error });
      setLesson(res.data);
      setPhase({ kind: "playing" });
    });
  }, [languageCode, lessonSlug]);

  useEffect(() => {
    // Évite de créer deux sessions en mode développement (double montage de React).
    if (started.current) return;
    started.current = true;
    begin();
  }, [begin]);

  const exercise = lesson?.exercises[index];
  const total = lesson?.exercises.length ?? 1;
  const isLast = index === total - 1;

  const check = useCallback(() => {
    if (!lesson || !exercise || answer === null || feedback || pending) return;
    startTransition(async () => {
      const res = await submitAnswerAction(lesson.sessionId, exercise.id, answer);
      if (!res.ok) return setPhase({ kind: "error", message: res.error });
      setFeedback(res.data);
      if (res.data.correct) setCorrectCount((c) => c + 1);
    });
  }, [lesson, exercise, answer, feedback, pending]);

  const next = useCallback(() => {
    if (!lesson || !feedback || pending) return;
    if (!isLast) {
      setIndex((i) => i + 1);
      setAnswer(null);
      setFeedback(null);
      return;
    }
    setPhase({ kind: "finishing" });
    startTransition(async () => {
      const res = await completeLessonAction(lesson.sessionId);
      if (!res.ok) return setPhase({ kind: "error", message: res.error });
      setPhase({ kind: "done", result: res.data });
    });
  }, [lesson, feedback, pending, isLast]);

  // Raccourcis clavier : Entrée pour valider/continuer.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter" || e.shiftKey) return;
      if (feedback) {
        e.preventDefault();
        next();
      } else if (answer !== null) {
        e.preventDefault();
        check();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, answer, next, check]);

  if (phase.kind === "loading") {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="animate-pulse text-center">
          <div className="text-6xl">📖</div>
          <p className="mt-3 font-bold text-slate-500">Préparation de la leçon…</p>
        </div>
      </div>
    );
  }

  if (phase.kind === "error") {
    return (
      <div className="mx-auto grid w-full max-w-md flex-1 content-center gap-4 px-4">
        <Alert kind="error">{phase.message}</Alert>
        <LinkButton href={`/learn/${languageCode}`} variant="secondary">
          Retour au parcours
        </LinkButton>
      </div>
    );
  }

  if (phase.kind === "done" && lesson) {
    return <LessonResults result={phase.result} languageCode={languageCode} onReplay={begin} />;
  }

  if (!lesson || !exercise) return null;
  const View = exerciseViews[exercise.type];
  const progress = (index + (feedback ? 1 : 0)) / total;

  return (
    <div className="flex flex-1 flex-col">
      {/* En-tête */}
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 pt-5">
        <Link href={`/learn/${languageCode}`} aria-label="Quitter la leçon" className="grid size-10 place-items-center rounded-xl text-2xl text-slate-400 hover:bg-slate-100">
          ✕
        </Link>
        <ProgressBar value={progress} color="success" className="h-4" label="Progression de la leçon" />
        <span className="text-sm font-extrabold text-emerald-600" title="Bonnes réponses">
          ✓ {correctCount}
        </span>
      </div>

      {/* Exercice */}
      <div key={exercise.id} className="mx-auto w-full max-w-2xl flex-1 animate-fade-in px-4 py-8">
        <p className="mb-6 text-sm font-extrabold uppercase tracking-wider text-brand-600">
          {lesson.language.flag} {(exercise.content as { prompt?: string }).prompt}
        </p>
        <div className={cn(feedback && !feedback.correct && "animate-shake")}>
          {View ? (
            <View content={exercise.content} answer={answer} onChange={setAnswer} disabled={Boolean(feedback) || pending} speechLocale={lesson.language.speechLocale} />
          ) : (
            <Alert kind="error">Type d&apos;exercice non pris en charge : {exercise.type}</Alert>
          )}
        </div>
      </div>

      {/* Barre d'action / correction */}
      <div
        className={cn(
          "sticky bottom-0 border-t-2 pb-[env(safe-area-inset-bottom)]",
          !feedback && "border-slate-200 bg-white",
          feedback?.correct && "animate-slide-up border-emerald-200 bg-emerald-50",
          feedback && !feedback.correct && "animate-slide-up border-rose-200 bg-rose-50",
        )}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          {feedback ? (
            <div role="status" className="flex items-start gap-3">
              <span className={cn("grid size-12 shrink-0 animate-pop place-items-center rounded-full text-2xl text-white", feedback.correct ? "bg-emerald-500" : "bg-rose-500")}>
                {feedback.correct ? "✓" : "✕"}
              </span>
              <div>
                <p className={cn("text-xl font-extrabold", feedback.correct ? "text-emerald-700" : "text-rose-700")}>
                  {feedback.correct ? PRAISE[index % PRAISE.length] : "Pas tout à fait…"}
                  {feedback.correct && feedback.combo >= 3 && <span className="ml-2 text-base text-orange-500">🔥 Combo ×{feedback.combo}</span>}
                </p>
                {!feedback.correct && (
                  <p className="text-rose-700">
                    Bonne réponse : <strong>{feedback.correctAnswer}</strong>
                  </p>
                )}
                {feedback.note && <p className={feedback.correct ? "text-emerald-700" : "text-rose-700"}>{feedback.note}</p>}
              </div>
            </div>
          ) : (
            <p className="hidden text-sm text-slate-400 sm:block">Astuce : appuie sur Entrée pour valider</p>
          )}
          {feedback ? (
            <Button variant={feedback.correct ? "success" : "danger"} size="lg" onClick={next} disabled={pending || phase.kind === "finishing"} className="sm:min-w-44">
              {phase.kind === "finishing" ? "Calcul…" : isLast ? "Terminer" : "Continuer"}
            </Button>
          ) : (
            <Button size="lg" onClick={check} disabled={answer === null || pending} className="sm:min-w-44">
              {pending ? "Vérification…" : "Vérifier"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
