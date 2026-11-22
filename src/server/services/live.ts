import "server-only";
import { eq } from "drizzle-orm";
import { toLiveStateData } from "@/features/projection/live-state";
import { db, sql } from "../db/client";
import { liveState, type LiveState, type LiveMode } from "../db/schema";

/**
 * Live projection state. Deliberately uncached: it is streamed to the audience
 * program page (and admin previews) over Server-Sent Events, with a polling
 * fallback at /api/live/[eventId].
 *
 * Every write is broadcast on the `live_state` Postgres channel so any server
 * instance can push the change to its connected clients.
 */

export const LIVE_CHANNEL = "live_state";

export type LiveStatePatch = {
  mode?: LiveMode;
  programItemId?: string | null;
  songId?: string | null;
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

  if (state) {
    await sql`select pg_notify(${LIVE_CHANNEL}, ${JSON.stringify(
      toLiveStateData(state),
    )})`;
  }

  return state;
}
