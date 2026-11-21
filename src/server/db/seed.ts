import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, sql } from "./client";
import { events, liveState, programItems, users } from "./schema";

// Load .env / .env.local when run outside Next.js.
for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File missing — ignore.
  }
}

const EVENT_SLUG = "sound-of-revival";

const STARTER_PROGRAM = [
  "Processional",
  "Opening Prayer",
  "Worship",
  "Thanksgiving Ministration",
];

async function main() {
  const [event] = await db
    .insert(events)
    .values({
      slug: EVENT_SLUG,
      title: "Sound of Revival",
      tagline: "Concert / Thanksgiving Service",
      venue: "Auditorium D, Baze University",
      startsAt: new Date("2026-11-22T15:00:00+01:00"),
      coverImageUrl: "/sound-of-revival.jpg",
    })
    .onConflictDoUpdate({
      target: events.slug,
      set: {
        title: "Sound of Revival",
        tagline: "Concert / Thanksgiving Service",
        venue: "Auditorium D, Baze University",
        startsAt: new Date("2026-11-22T15:00:00+01:00"),
        coverImageUrl: "/sound-of-revival.jpg",
        updatedAt: new Date(),
      },
    })
    .returning();

  await db.insert(liveState).values({ eventId: event.id }).onConflictDoNothing();

  const existingItems = await db
    .select({ id: programItems.id })
    .from(programItems)
    .where(eq(programItems.eventId, event.id))
    .limit(1);

  if (existingItems.length === 0) {
    await db.insert(programItems).values(
      STARTER_PROGRAM.map((title, position) => ({
        eventId: event.id,
        title,
        position,
      })),
    );
    console.log(`✔ Seeded ${STARTER_PROGRAM.length} starter program items`);
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (email && password) {
    const passwordHash = await hash(password, 12);
    await db
      .insert(users)
      .values({ email, name: "Admin", passwordHash })
      .onConflictDoUpdate({ target: users.email, set: { passwordHash } });
    console.log(`✔ Admin ready: ${email}`);
  } else {
    console.warn(
      "⚠ ADMIN_EMAIL / ADMIN_PASSWORD not set — skipped admin seed",
    );
  }

  console.log(`✔ Event ready: ${event.slug} (${event.id})`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
