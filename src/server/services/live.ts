import "server-only";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { liveState, type LiveState, type LiveMode } from "../db/schema";

/**
 * Live projection state. Deliberately uncached: this is polled every ~2s by the
 * display, audience program page, and admin preview via /api/live/[eventId].
 */

export type LiveStatePatch = {
  mode?: LiveMode;
  programItemId?: string | null;
  songId?: string | null;
  postId?: string | null;
  message?: string | null;
};

export async function getLiveState(eventId: string): Promise<LiveState | null> {
  const [state] = await db
    .select()
    .from(liveState)
    .where(eq(liveState.eventId, eventId))
    .limit(1);

  return state ?? null;
}

export async function setLiveState(eventId: string, patch: LiveStatePatch) {
  const [state] = await db
    .insert(liveState)
    .values({ eventId, ...patch })
    .onConflictDoUpdate({
      target: liveState.eventId,
      set: { ...patch, updatedAt: new Date() },
    })
    .returning();

  return state;
}
