import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-extrabold tracking-tight", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-lg text-white shadow-[0_3px_0_var(--color-brand-800)]">
        L
      </span>
      <span className="text-xl text-slate-900">
        Lingua<span className="text-brand-600">Quest</span>
      </span>
    </Link>
  );
}
