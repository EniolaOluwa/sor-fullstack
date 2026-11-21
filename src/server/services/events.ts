import "server-only";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { events, type NewEvent } from "../db/schema";

export const EVENTS_TAG = "events";

export async function getActiveEvent() {
  "use cache";
  cacheLife("hours");
  cacheTag(EVENTS_TAG);

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.isActive, true))
    .orderBy(desc(events.startsAt))
    .limit(1);

  return event ?? null;
}

export async function getEventBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(EVENTS_TAG);

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1);

  return event ?? null;
}

export async function updateEvent(id: string, patch: Partial<NewEvent>) {
  const [event] = await db
    .update(events)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();

  revalidateTag(EVENTS_TAG, "max");
  return event;
}
