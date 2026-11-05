import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Props = ComponentProps<"input"> & { label: string; error?: string; hint?: string };

export function Field({ label, error, hint, id, name, className, ...props }: Props) {
  const inputId = id ?? name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-bold text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "h-12 w-full rounded-2xl border-2 bg-slate-50 px-4 text-base outline-none transition-colors",
          "focus:border-brand-400 focus:bg-white",
          error ? "border-rose-300" : "border-slate-200",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
