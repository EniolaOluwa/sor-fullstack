import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Postgres client (singleton).
 *
 * Note: no `server-only` import here on purpose — `src/server/db/seed.ts` runs this
 * module under tsx, where the `react-server` condition is absent and `server-only`
 * would throw. The server boundary lives in `src/server/services/*` and auth modules.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
  );
}

const globalForDb = globalThis as unknown as {
  __sql?: ReturnType<typeof postgres>;
};

const sql = globalForDb.__sql ?? postgres(connectionString, { max: 10 });
if (process.env.NODE_ENV !== "production") {
  globalForDb.__sql = sql;
}

export const db = drizzle(sql, { schema });

/** Raw client — only for scripts (e.g. seed) that must close the pool. */
export { sql };

/**
 * Opens the connection pool eagerly. Called from `src/instrumentation.ts` at
 * server start so the first query never happens mid-prerender (postgres.js
 * generates a SCRAM nonce with `crypto.randomBytes` on connect, which Cache
 * Components flags as an unstable value).
 */
export async function warmDb() {
  await sql`select 1`;
}
