import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger" | "xp";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-[0_4px_0_var(--color-brand-800)] hover:bg-brand-500 active:shadow-none active:translate-y-1",
  secondary: "bg-white text-slate-800 border-2 border-slate-200 shadow-[0_4px_0_var(--color-slate-200)] hover:bg-slate-50 active:shadow-none active:translate-y-1",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  success: "bg-emerald-500 text-white shadow-[0_4px_0_var(--color-emerald-700)] hover:bg-emerald-400 active:shadow-none active:translate-y-1",
  danger: "bg-rose-500 text-white shadow-[0_4px_0_var(--color-rose-700)] hover:bg-rose-400 active:shadow-none active:translate-y-1",
  xp: "bg-xp-500 text-white shadow-[0_4px_0_var(--color-xp-600)] hover:bg-xp-400 active:shadow-none active:translate-y-1",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold tracking-wide transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none select-none";

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
