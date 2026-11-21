import { defineConfig } from "drizzle-kit";

// Load .env / .env.local for CLI commands (drizzle-kit runs outside Next.js).
for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File missing — ignore.
  }
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
