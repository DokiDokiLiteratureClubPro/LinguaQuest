import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import type { Database } from "./types";

const globalForDb = globalThis as unknown as { __lqDb?: Database };

function createDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant : voir .env.example");
  // `prepare: false` est requis avec le pooler Supabase en mode transaction.
  const sql = postgres(url, { prepare: false, max: Number(process.env.DB_POOL_MAX ?? 5) });
  return drizzle(sql, { schema });
}

function getDb(): Database {
  // Connexion créée au premier usage (et réutilisée en dev malgré le rechargement des modules).
  globalForDb.__lqDb ??= createDb();
  return globalForDb.__lqDb;
}

/** Connexion à la base, ouverte paresseusement au premier appel. */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
