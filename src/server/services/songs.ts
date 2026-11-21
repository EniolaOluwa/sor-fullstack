import "server-only";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "../db/client";
import { songs, type NewSong, type Song } from "../db/schema";

export function songsTag(eventId: string) {
  return `songs:${eventId}`;
}

export async function listSongs(
  eventId: string,
  options: { includeHidden?: boolean } = {},
): Promise<Song[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("songs", songsTag(eventId));

  const { includeHidden = false } = options;

  return db
    .select()
    .from(songs)
    .where(
      includeHidden
        ? eq(songs.eventId, eventId)
        : and(eq(songs.eventId, eventId), eq(songs.isVisible, true)),
    )
    .orderBy(asc(songs.position), asc(songs.createdAt));
}

export async function getSongBySlug(eventId: string, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("songs", songsTag(eventId));

  const [song] = await db
    .select()
    .from(songs)
    .where(and(eq(songs.eventId, eventId), eq(songs.slug, slug)))
    .limit(1);

  return song ?? null;
}

export async function createSong(values: NewSong) {
  const position = values.position ?? (await nextPosition(values.eventId));

  const [song] = await db
    .insert(songs)
    .values({ ...values, position })
    .returning();

  revalidateTag(songsTag(values.eventId), "max");
  return song;
}

export async function updateSong(
  eventId: string,
  id: string,
  patch: Partial<NewSong>,
) {
  const [song] = await db
    .update(songs)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(songs.id, id), eq(songs.eventId, eventId)))
    .returning();

  revalidateTag(songsTag(eventId), "max");
  return song;
}

export async function deleteSong(eventId: string, id: string) {
  await db
    .delete(songs)
    .where(and(eq(songs.id, id), eq(songs.eventId, eventId)));

  revalidateTag(songsTag(eventId), "max");
}

export async function reorderSongs(eventId: string, orderedIds: string[]) {
  await db.transaction(async (tx) => {
    for (const [position, id] of orderedIds.entries()) {
      await tx
        .update(songs)
        .set({ position, updatedAt: new Date() })
        .where(and(eq(songs.id, id), eq(songs.eventId, eventId)));
    }
  });

  revalidateTag(songsTag(eventId), "max");
}

async function nextPosition(eventId: string) {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${songs.position}), -1)` })
    .from(songs)
    .where(eq(songs.eventId, eventId));

  return (row?.max ?? -1) + 1;
}
