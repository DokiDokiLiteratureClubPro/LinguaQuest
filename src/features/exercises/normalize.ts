/** Normalisation tolérante : casse, espaces, ponctuation, apostrophes typographiques. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,!?¡¿;:"«»()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Retire en plus les accents (é → e, ñ → n). */
export function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
