/** Erreur "métier" dont le message peut être montré à l'utilisateur. */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}
