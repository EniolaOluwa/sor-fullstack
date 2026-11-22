"use server";

import { requireAdmin } from "@/server/auth/guards";
import { getActiveEvent } from "@/server/services/events";
import { setLiveState } from "@/server/services/live";

/** Returns the projection to the idle screen. Shared by all admin sections. */
export async function clearLiveStateAction() {
  await requireAdmin();

  const event = await getActiveEvent();
  if (!event) throw new Error("No active event");

  await setLiveState(event.id, {
    mode: "idle",
    programItemId: null,
    songId: null,
    message: null,
  });
}
