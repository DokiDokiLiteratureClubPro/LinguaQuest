import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-brand-50 to-slate-50 px-4 py-10">
      <Logo />
      <main className="mt-8 w-full max-w-md animate-fade-in rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </main>
    </div>
  );
}
