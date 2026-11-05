import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/db/schema";
import type { Database } from "@/db/types";
import { runSeed } from "@/db/seed/run-seed";

/** Base PostgreSQL en mémoire (PGlite) avec les vraies migrations et le vrai contenu. */
export async function createTestDb() {
  const client = new PGlite();
  // Simule le schéma `auth` de Supabase.
  await client.exec(`CREATE SCHEMA auth; CREATE TABLE auth.users (id uuid PRIMARY KEY);`);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  await runSeed(db as unknown as Database);
  return { db: db as unknown as Database, client };
}

export async function createUser(client: PGlite, id: string) {
  await client.query(`INSERT INTO auth.users (id) VALUES ($1)`, [id]);
}
