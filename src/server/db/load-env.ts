/**
 * Loads .env / .env.local for scripts that run outside Next.js (tsx).
 * Import this FIRST — module imports evaluate in order, so `./client` must come
 * after this file or DATABASE_URL will not be set yet.
 */
for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File missing — ignore.
  }
}
