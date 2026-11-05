import { cn } from "@/lib/cn";

export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: React.ReactNode }) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "rounded-2xl border-2 px-4 py-3 text-sm font-semibold",
        kind === "error" && "border-rose-200 bg-rose-50 text-rose-700",
        kind === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        kind === "info" && "border-brand-200 bg-brand-50 text-brand-700",
      )}
    >
      {children}
    </div>
  );
}
