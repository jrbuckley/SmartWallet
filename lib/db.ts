import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Single-user placeholder until auth lands (PR #4) and defines the users
// table. Every query filters on this; auth will replace it with the
// signed-in user's id.
export const DEMO_USER_ID = "demo-user";

// Lazily created so `next build` works without a DATABASE_URL set.
// Pages only call it at request time, when the env var must exist.
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
