import { LinkButton } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { getAuthUser } from "@/features/auth/session";

const FEATURES = [
  { icon: "🧩", title: "6 types d'exercices", text: "QCM, images, phrases à trous, mots à remettre dans l'ordre, vrai ou faux, traduction." },
  { icon: "⭐", title: "XP et niveaux", text: "Chaque bonne réponse rapporte de l'XP. Monte de niveau et suis ta progression." },
  { icon: "🔥", title: "Séries quotidiennes", text: "Quelques minutes par jour suffisent. Garde ta série en vie et gagne des bonus." },
  { icon: "🏆", title: "Succès à débloquer", text: "Première leçon, 100 bonnes réponses, 7 jours d'affilée… relève les défis." },
  { icon: "🔊", title: "Écoute la prononciation", text: "Entends chaque mot prononcé par une voix native, directement dans ton navigateur." },
  { icon: "📱", title: "Partout avec toi", text: "Ordinateur, tablette ou téléphone : ta progression te suit sur tous tes appareils." },
];

const LANGS = [
  { flag: "🇬🇧", name: "Anglais", ready: true },
  { flag: "🇪🇸", name: "Espagnol", ready: true },
  { flag: "🇩🇪", name: "Allemand", ready: false },
  { flag: "🇮🇹", name: "Italien", ready: false },
  { flag: "🇯🇵", name: "Japonais", ready: false },
  { flag: "🇰🇷", name: "Coréen", ready: false },
  { flag: "🇵🇹", name: "Portugais", ready: false },
];

async function isLoggedIn() {
  try {
    return Boolean(await getAuthUser());
  } catch {
    return false;
  }
}

export default async function HomePage() {
  const loggedIn = await isLoggedIn();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b-2 border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-2">
            {loggedIn ? (
              <LinkButton href="/dashboard" size="sm">
                Mon tableau de bord
              </LinkButton>
            ) : (
              <>
                <LinkButton href="/login" variant="ghost" size="sm">
                  Connexion
                </LinkButton>
                <LinkButton href="/signup" size="sm">
                  S&apos;inscrire
                </LinkButton>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
            <div className="animate-fade-in space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold text-brand-700 ring-2 ring-brand-100">
                ✨ Gratuit · 5 minutes par jour
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Apprends une langue <span className="text-brand-600">en jouant</span>, un peu chaque jour.
              </h1>
              <p className="max-w-lg text-lg text-slate-600">
                Des exercices courts et variés, de l&apos;XP, des niveaux et des succès : LinguaQuest transforme l&apos;apprentissage en une habitude qui donne envie de revenir.
              </p>
              <div className="flex flex-wrap gap-3">
                <LinkButton href={loggedIn ? "/dashboard" : "/signup"} size="lg">
                  {loggedIn ? "Reprendre" : "Commencer gratuitement"}
                </LinkButton>
                {!loggedIn && (
                  <LinkButton href="/login" variant="secondary" size="lg">
                    J&apos;ai déjà un compte
                  </LinkButton>
                )}
              </div>
            </div>

            {/* Aperçu d'un exercice */}
            <div className="relative mx-auto w-full max-w-sm animate-fade-in [animation-delay:150ms]" aria-hidden>
              <div className="absolute -top-6 -right-4 rotate-6 rounded-2xl bg-xp-100 px-3 py-2 text-sm font-extrabold text-xp-600 shadow-sm">+15 XP ⭐</div>
              <div className="absolute -bottom-5 -left-4 -rotate-6 rounded-2xl bg-orange-50 px-3 py-2 text-sm font-extrabold text-orange-500 shadow-sm">🔥 7 jours</div>
              <div className="rounded-[2rem] border-2 border-slate-200 bg-white p-6 shadow-xl shadow-brand-900/5">
                <div className="mb-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-2/3 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-brand-600">🇬🇧 Que représente cette image ?</p>
                <div className="my-5 grid place-items-center text-7xl">🐶</div>
                <div className="grid grid-cols-2 gap-2">
                  {["cat", "dog", "bird", "fish"].map((w) => (
                    <div key={w} className={w === "dog" ? "rounded-xl border-2 border-emerald-400 bg-emerald-50 p-3 text-center font-bold text-emerald-700" : "rounded-xl border-2 border-slate-200 p-3 text-center font-bold"}>
                      {w}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center font-extrabold text-emerald-700">✓ Bravo !</div>
              </div>
            </div>
          </div>
        </section>

        {/* Fonctionnalités */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-3xl font-extrabold">Tout pour progresser sans t&apos;ennuyer</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-3xl border-2 border-slate-200 bg-white p-6">
                <div className="text-4xl">{f.icon}</div>
                <h3 className="mt-3 text-lg font-extrabold">{f.title}</h3>
                <p className="mt-1 text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-3xl font-extrabold">Comment ça marche ?</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                ["Crée ton compte", "Gratuit, en 30 secondes. Ta progression est sauvegardée."],
                ["Choisis ta langue", "Anglais, espagnol… et change quand tu veux."],
                ["Joue chaque jour", "Enchaîne les leçons, gagne de l'XP, débloque des succès."],
              ].map(([title, text], i) => (
                <li key={title} className="text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-600 text-2xl font-extrabold text-white shadow-[0_4px_0_var(--color-brand-800)]">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                  <p className="mt-1 text-slate-600">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Langues */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-3xl font-extrabold">Les langues</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {LANGS.map((l) => (
              <div key={l.name} className={l.ready ? "rounded-2xl border-2 border-brand-200 bg-white px-4 py-3 font-bold" : "rounded-2xl border-2 border-dashed border-slate-200 px-4 py-3 font-bold text-slate-400"}>
                <span className="mr-2 text-2xl">{l.flag}</span>
                {l.name}
                {!l.ready && <span className="ml-2 text-xs">bientôt</span>}
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-12 text-center text-white">
            <h2 className="text-3xl font-extrabold">Prêt à commencer ta quête ?</h2>
            <p className="mx-auto mt-2 max-w-md text-brand-100">Ta première leçon prend moins de 5 minutes.</p>
            <LinkButton href={loggedIn ? "/dashboard" : "/signup"} variant="xp" size="lg" className="mt-6">
              {loggedIn ? "Reprendre" : "Créer mon compte gratuit"}
            </LinkButton>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-slate-100 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} LinguaQuest · Fait avec ❤️ pour les apprenants
      </footer>
    </div>
  );
}
