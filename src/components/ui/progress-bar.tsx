import { cn } from "@/lib/cn";

type Props = {
  value: number; // 0..1
  className?: string;
  color?: "brand" | "xp" | "success";
  label?: string;
};

const colors = {
  brand: "bg-brand-500",
  xp: "bg-gradient-to-r from-xp-400 to-xp-500",
  success: "bg-emerald-500",
};

export function ProgressBar({ value, className, color = "brand", label }: Props) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-3 w-full overflow-hidden rounded-full bg-slate-200", className)}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-500 ease-out", colors[color])} style={{ width: `${pct}%` }} />
    </div>
  );
}
