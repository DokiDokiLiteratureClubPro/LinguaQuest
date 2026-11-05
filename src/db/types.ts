import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "./schema";

/**
 * Type commun à toutes les connexions (postgres-js en prod, PGlite en tests).
 * Les services reçoivent `db` en paramètre : ils sont testables sans Supabase.
 */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;
