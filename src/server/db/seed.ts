import "./load-env";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, sql } from "./client";
import { events, liveState, programItems, songs, users } from "./schema";
import { SONGBOOK } from "./songbook";

const EVENT_SLUG = "sound-of-revival";

const PROGRAM: Array<{ title: string; description?: string }> = [
  { title: "Opening Prayer" },
  { title: "Piano Prelude", description: "J.S. Bach — Prelude in C Major" },
  { title: "Orchestra Prelude", description: "March from Scipio" },
  { title: "Welcoming of Invited Guests" },
  { title: "CM's Speech" },
  {
    title: "First Set Performances",
    description: [
      "Duration: 55 min 5 sec",
      "Opening Song — He Has Done Marvellous Things",
      "Praise Him",
      "Psalm 150",
      "Goodness of the Lord",
      "First Service Choir",
    ].join("\n"),
  },
  { title: "Intersection" },
  { title: "Testimonies and Praise" },
  {
    title: "Second Set Performances",
    description: [
      "Song of the Redeemed and Drama Presentation",
      "Jerusalem",
      "Statement of Faith",
      "Children Choir",
    ].join("\n"),
  },
  { title: "Intersection" },
  {
    title: "Orchestra Performance",
    description: ["Eti to bi", "Seasons of the King"].join("\n"),
  },
  {
    title: "Third Set Performances",
    description: [
      "Igbo Song",
      "Hausa Song",
      "Yoruba Song",
      "Revival in the Land",
      "Days of Elijah",
    ].join("\n"),
  },
  { title: "Prayers", description: "Led by Pastor Tolu" },
  { title: "Exhortation" },
  { title: "Sing" },
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
      PROGRAM.map((item, position) => ({
        eventId: event.id,
        title: item.title,
        description: item.description ?? null,
        position,
      })),
    );
    console.log(`✔ Seeded ${PROGRAM.length} program items`);
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const existingSongs = await db
    .select({ id: songs.id })
    .from(songs)
    .where(eq(songs.eventId, event.id))
    .limit(1);

  if (existingSongs.length === 0) {
    await db.insert(songs).values(
      SONGBOOK.map((song, position) => ({
        eventId: event.id,
        slug: song.slug,
        title: song.title,
        author: song.author ?? null,
        songKey: song.songKey ?? null,
        lyrics: song.sections,
        position,
      })),
    );
    console.log(`✔ Seeded ${SONGBOOK.length} songs from the songbook`);
  }

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
