import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazily created so `next build` and the seed-data pages work without a
// DATABASE_URL set. Week 2 wires up the real connection string.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
      );
    }
    _db = drizzle(postgres(url), { schema });
  }
  return _db;
}
