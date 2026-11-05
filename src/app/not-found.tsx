import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div className="space-y-4">
        <div className="text-7xl">🧭</div>
        <h1 className="text-3xl font-extrabold">Page introuvable</h1>
        <p className="text-slate-500">Cette page n&apos;existe pas ou a été déplacée.</p>
        <LinkButton href="/">Retour à l&apos;accueil</LinkButton>
      </div>
    </div>
  );
}
