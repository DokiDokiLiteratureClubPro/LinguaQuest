import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { runSeed } from "../src/db/seed/run-seed";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant dans .env.local");
  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    await runSeed(drizzle(sql, { schema }), console.log);
    console.log("Contenu synchronisé ✅");
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
